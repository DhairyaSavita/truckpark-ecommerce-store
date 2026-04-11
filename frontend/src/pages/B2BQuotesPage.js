import React, { useState, useEffect } from 'react';
import { b2bAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BuildingStorefrontIcon, CurrencyRupeeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const B2BQuotesPage = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    quantity: '',
    proposed_price: '',
    message: ''
  });

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await b2bAPI.getMyQuotes();
      setQuotes(response.data);
    } catch (error) {
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await b2bAPI.requestQuote({
        product_id: selectedProduct,
        ...formData
      });
      toast.success('Quote request sent successfully');
      setShowModal(false);
      setFormData({ quantity: '', proposed_price: '', message: '' });
      fetchQuotes();
    } catch (error) {
      toast.error('Failed to send quote request');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      responded: 'bg-green-100 text-green-800',
      accepted: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return <div className="text-center py-10">Loading quotes...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">B2B Quotes</h1>
          <p className="text-gray-600 mt-1">Request bulk purchase quotes from sellers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Request New Quote
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Total Quotes</p>
          <p className="text-2xl font-bold">{quotes.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Pending Response</p>
          <p className="text-2xl font-bold text-yellow-600">
            {quotes.filter(q => q.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Responded</p>
          <p className="text-2xl font-bold text-green-600">
            {quotes.filter(q => q.status === 'responded').length}
          </p>
        </div>
      </div>

      {/* Quotes List */}
      <div className="space-y-4">
        {quotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BuildingStorefrontIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
            <p className="text-gray-500 mb-4">Request a bulk quote for wholesale purchases</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Request Quote
            </button>
          </div>
        ) : (
          quotes.map((quote) => (
            <div key={quote.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Quote #{quote.id}</p>
                    <p className="text-sm text-gray-500">{quote.Product?.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(quote.status)}`}>
                    {quote.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-semibold">{quote.quantity} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Proposed Price</p>
                    <p className="font-semibold text-green-600">₹{quote.proposed_price}/unit</p>
                  </div>
                </div>
                {quote.message && (
                  <div className="mb-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">{quote.message}</p>
                  </div>
                )}
                {quote.seller_response && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-semibold text-blue-800">Seller Response:</p>
                    <p className="text-sm text-blue-700">{quote.seller_response}</p>
                  </div>
                )}
                <div className="text-sm text-gray-500 mt-2">
                  Requested: {new Date(quote.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Quote Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Request Bulk Quote</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Product ID</label>
                <input
                  type="text"
                  value={selectedProduct || ''}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  placeholder="Enter product ID"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Minimum 5 units"
                  min="5"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Target Price (₹ per unit) *</label>
                <input
                  type="number"
                  value={formData.proposed_price}
                  onChange={(e) => setFormData({ ...formData, proposed_price: e.target.value })}
                  placeholder="Your proposed price"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="3"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Any special requirements?"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BQuotesPage;
