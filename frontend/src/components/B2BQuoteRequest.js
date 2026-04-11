import React, { useState } from 'react';
import { b2bAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const B2BQuoteRequest = ({ productId, productName, productPrice }) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(10);
  const [proposedPrice, setProposedPrice] = useState(productPrice * 0.9);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to request a quote');
      return;
    }

    setSubmitting(true);
    try {
      await b2bAPI.requestQuote({
        product_id: productId,
        quantity,
        proposed_price: proposedPrice,
        message
      });
      toast.success('Quote request sent! Seller will contact you soon.');
    } catch (error) {
      toast.error('Failed to send quote request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <h4 className="font-semibold mb-3">Bulk Purchase Request</h4>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              min="5"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Target Price (₹)</label>
            <input
              type="number"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(parseFloat(e.target.value))}
              step="0.01"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Additional requirements or questions..."
          rows="2"
          className="w-full border rounded px-3 py-2 text-sm mb-3"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm"
        >
          {submitting ? 'Sending...' : 'Request Bulk Quote'}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Request quote for bulk purchase (Min. 5 units)
        </p>
      </form>
    </div>
  );
};

export default B2BQuoteRequest;
