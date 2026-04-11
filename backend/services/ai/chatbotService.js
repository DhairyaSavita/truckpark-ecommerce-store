const natural = require('natural');
const Sentiment = require('sentiment');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const User = require('../../models/User');
const { Op } = require('sequelize');

class ChatbotService {
  constructor() {
    this.sentiment = new Sentiment();
    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();
    this.trainClassifier();
    console.log('✅ Chatbot service initialized');
  }

  trainClassifier() {
    const intents = [
      { text: 'I want to buy engine parts', intent: 'product_search' },
      { text: 'Looking for brake pads', intent: 'product_search' },
      { text: 'Need turbocharger', intent: 'product_search' },
      { text: 'Where is my order', intent: 'order_tracking' },
      { text: 'Track order', intent: 'order_tracking' },
      { text: 'Order status', intent: 'order_tracking' },
      { text: 'How to return', intent: 'returns' },
      { text: 'Return policy', intent: 'returns' },
      { text: 'Cancel my order', intent: 'cancellation' },
      { text: 'Cancel order', intent: 'cancellation' },
      { text: 'What parts fit', intent: 'compatibility' },
      { text: 'Compatibility', intent: 'compatibility' },
      { text: 'Help me', intent: 'help' },
      { text: 'I need help', intent: 'help' }
    ];
    
    intents.forEach(item => {
      this.classifier.addDocument(item.text, item.intent);
    });
    this.classifier.train();
  }

  async processMessage(message, userId) {
    try {
      console.log('Processing message:', message);
      
      const sentiment = this.sentiment.analyze(message);
      const intent = this.classifier.classify(message);
      console.log('Detected intent:', intent);
      
      let response;
      
      switch(intent) {
        case 'product_search':
          response = await this.handleProductSearch(message);
          break;
        case 'order_tracking':
          response = await this.handleOrderTracking(message, userId);
          break;
        case 'returns':
          response = this.handleReturns();
          break;
        case 'cancellation':
          response = await this.handleCancellation(message, userId);
          break;
        case 'compatibility':
          response = this.handleCompatibility(message);
          break;
        default:
          response = this.handleGeneral(message);
      }
      
      return {
        intent,
        sentiment: sentiment.score,
        ...response
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        type: 'error',
        message: 'I am having trouble right now. Please try again or contact support.',
        suggestions: ['Help', 'Contact support']
      };
    }
  }

  async handleProductSearch(message) {
    try {
      const keywords = this.extractKeywords(message);
      console.log('Search keywords:', keywords);
      
      const products = await Product.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${keywords}%` } },
            { description: { [Op.iLike]: `%${keywords}%` } },
            { brand: { [Op.iLike]: `%${keywords}%` } }
          ]
        },
        limit: 5
      });
      
      if (products.length > 0) {
        return {
          type: 'product_recommendation',
          message: `I found ${products.length} products matching your search:`,
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            brand: p.brand
          }))
        };
      } else {
        return {
          type: 'suggestion',
          message: 'I could not find products matching your search. Try different keywords or browse categories.',
          suggestions: ['Engine Parts', 'Brake System', 'Transmission', 'Suspension']
        };
      }
    } catch (error) {
      console.error('Product search error:', error);
      return {
        type: 'error',
        message: 'Unable to search products right now. Please try again.',
        suggestions: ['Browse categories']
      };
    }
  }

  async handleOrderTracking(message, userId) {
    try {
      const orderMatch = message.match(/#?(\d{5,})/);
      const orderNumber = orderMatch ? orderMatch[1] : null;
      
      if (orderNumber) {
        const order = await Order.findOne({
          where: { id: orderNumber, user_id: userId }
        });
        
        if (order) {
          let statusMsg = '';
          switch(order.status) {
            case 'pending':
              statusMsg = 'Your order is confirmed and waiting for processing.';
              break;
            case 'processing':
              statusMsg = 'We are preparing your order for shipment.';
              break;
            case 'shipped':
              statusMsg = `Your order has been shipped! Tracking: ${order.tracking_number || 'available soon'}`;
              break;
            case 'delivered':
              statusMsg = 'Your order has been delivered. Hope you enjoy it!';
              break;
            case 'cancelled':
              statusMsg = 'Your order was cancelled.';
              break;
            default:
              statusMsg = `Order status: ${order.status}`;
          }
          
          return {
            type: 'order_status',
            message: statusMsg,
            order: {
              id: order.id,
              status: order.status,
              total: order.total_amount,
              date: order.created_at
            }
          };
        } else {
          return {
            type: 'help',
            message: 'Order not found. Please check the order number.',
            suggestions: ['View my orders', 'Recent orders']
          };
        }
      }
      
      return {
        type: 'help',
        message: 'Please provide your order number (e.g., #12345) to track your order.',
        suggestions: ['View my orders', 'Need help']
      };
    } catch (error) {
      console.error('Order tracking error:', error);
      return {
        type: 'error',
        message: 'Unable to track order right now. Please try again.',
        suggestions: ['Contact support']
      };
    }
  }

  handleReturns() {
    return {
      type: 'policy',
      message: 'Return Policy: 30-day returns, items must be unused, original packaging required.',
      suggestions: ['Initiate return', 'Contact support']
    };
  }

  async handleCancellation(message, userId) {
    const orderMatch = message.match(/#?(\d{5,})/);
    const orderNumber = orderMatch ? orderMatch[1] : null;
    
    if (orderNumber) {
      const order = await Order.findOne({
        where: { id: orderNumber, user_id: userId }
      });
      
      if (order && order.status === 'pending') {
        return {
          type: 'cancellation',
          message: `I can help cancel order #${orderNumber}. Are you sure?`,
          requires_confirmation: true,
          order_id: order.id
        };
      } else if (order) {
        return {
          type: 'info',
          message: `Order #${orderNumber} is already ${order.status} and cannot be cancelled.`
        };
      }
    }
    
    return {
      type: 'help',
      message: 'Please provide your order number to cancel.',
      suggestions: ['My orders', 'Contact support']
    };
  }

  handleCompatibility(message) {
    const vehicles = ['Volvo', 'Scania', 'Mercedes', 'MAN', 'Kenworth', 'Peterbilt'];
    let vehicle = null;
    
    for (let v of vehicles) {
      if (message.toLowerCase().includes(v.toLowerCase())) {
        vehicle = v;
        break;
      }
    }
    
    if (vehicle) {
      return {
        type: 'compatibility_check',
        message: `For ${vehicle} trucks, what specific part are you looking for?`,
        suggestions: ['Brake pads', 'Engine parts', 'Transmission']
      };
    } else {
      return {
        type: 'help',
        message: 'Please tell me your truck make and model (e.g., Volvo FH16, Scania R500).',
        suggestions: ['Volvo FH16', 'Scania R500', 'Kenworth T680']
      };
    }
  }

  handleGeneral(message) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('help')) {
      return {
        type: 'general',
        message: 'I can help you find truck parts, track orders, and answer questions. What do you need?',
        suggestions: ['Find parts', 'Track order', 'Return policy']
      };
    }
    
    if (lowerMsg.includes('price')) {
      return {
        type: 'general',
        message: 'Prices are in Indian Rupees (₹). Use filters to find products in your budget.',
        suggestions: ['Show budget parts', 'Price filter help']
      };
    }
    
    if (lowerMsg.includes('shipping')) {
      return {
        type: 'general',
        message: 'Free shipping on orders over ₹5000. Standard delivery: 3-5 business days.',
        suggestions: ['Track order', 'Shipping policy']
      };
    }
    
    return {
      type: 'general',
      message: 'I am your AI assistant! I can help find parts, track orders, check compatibility, and more.',
      suggestions: ['Find parts', 'Track order', 'Check compatibility', 'Return policy']
    };
  }

  extractKeywords(message) {
    const tokens = this.tokenizer.tokenize(message.toLowerCase());
    const stopwords = ['i', 'want', 'need', 'looking', 'for', 'the', 'to', 'buy', 'get', 'me', 'help'];
    const keywords = tokens.filter(t => !stopwords.includes(t) && t.length > 2);
    return keywords.join(' ');
  }
}

module.exports = new ChatbotService();
