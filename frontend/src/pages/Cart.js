import React, { useState, useEffect } from 'react';
import { cart, orders } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cart.get();
      console.log('Cart response:', response.data);
      setCartItems(response.data || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await cart.update(id, newQuantity);
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (id) => {
    try {
      await cart.remove(id);
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setCheckoutLoading(true);
    try {
      await orders.create({
        shipping_address: user.address || 'Please update your address in profile',
        payment_method: 'cash_on_delivery'
      });
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Helper function to safely convert price to number
  const toNumber = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  };

  // Calculate total safely
  const calculateTotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((sum, item) => {
      const product = item.Product || {};
      const price = toNumber(product.price);
      const quantity = toNumber(item.quantity);
      return sum + (price * quantity);
    }, 0);
  };

  const total = calculateTotal();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <div className="text-gray-500">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cartItems.map((item) => {
            const product = item.Product || {};
            const productName = product.name || 'Product';
            const productPrice = toNumber(product.price);
            const productImage = product.image_url || 'https://via.placeholder.com/100x100?text=Product';
            const quantity = toNumber(item.quantity);
            
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center">
                <img
                  src={productImage}
                  alt={productName}
                  className="w-24 h-24 object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100x100?text=Product';
                  }}
                />
                <div className="flex-1 ml-4">
                  <h3 className="text-lg font-semibold">{productName}</h3>
                  <p className="text-gray-600">${productPrice.toFixed(2)}</p>
                  {product.part_number && (
                    <p className="text-xs text-gray-500">Part #: {product.part_number}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, quantity - 1)}
                    className="p-2 border rounded hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, quantity + 1)}
                    className="p-2 border rounded hover:bg-gray-100"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-4 text-red-600 hover:text-red-800 p-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-8">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading || cartItems.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
          
          <button
            onClick={() => navigate('/products')}
            className="w-full mt-3 text-blue-600 hover:text-blue-800 text-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
