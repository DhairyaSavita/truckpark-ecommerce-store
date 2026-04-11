import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatbotAPI } from '../services/api';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon,
  UserCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'bot',
          text: `Hello ${user?.name || 'there'}! 👋 I am your AI assistant for Truck Parts Marketplace. How can I help you today?`,
          timestamp: new Date(),
          suggestions: ['Find engine parts', 'Track my order', 'Check compatibility', 'Return policy']
        }
      ]);
    }
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (!user) {
      toast.error('Please login to use the chatbot');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      console.log('Sending message:', inputMessage);
      const response = await chatbotAPI.sendMessage(inputMessage);
      console.log('Received response:', response.data);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.data.message,
        timestamp: new Date(),
        suggestions: response.data.suggestions,
        products: response.data.products,
        order: response.data.order
      };
      
      console.log('Bot message with products:', botMessage.products);
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: "I am having trouble connecting. Please try again or contact support.",
        timestamp: new Date(),
        suggestions: ['Contact support', 'Try again']
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setTimeout(() => sendMessage(), 100);
  };

  const handleProductClick = (productId) => {
    window.location.href = `/products/${productId}`;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 group"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6 group-hover:scale-110 transition" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-5 w-5" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] flex ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                    {message.type === 'bot' && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <SparklesIcon className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 px-2">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                    {message.type === 'user' && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserCircleIcon className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                </div>

                {message.products && message.products.length > 0 && (
                  <div className="mt-2 ml-10">
                    <p className="text-xs text-gray-500 mb-2">Recommended products:</p>
                    <div className="space-y-2">
                      {message.products.map(product => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          className="bg-white border rounded-lg p-2 cursor-pointer hover:shadow-md transition"
                        >
                          <p className="font-semibold text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.brand}</p>
                          <p className="text-sm font-bold text-green-600">₹{product.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 ml-10 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-full transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2 text-center">
              Powered by AI • Ask me anything about truck parts!
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
