import React, { useState } from 'react';
import { messages } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Contact = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to send a message');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Sending message:', formData);
      const response = await messages.send({
        subject: formData.subject,
        message: formData.message,
        seller_id: 1
      });
      console.log('Message response:', response.data);
      toast.success('Message sent successfully! Our team will contact you soon.');
      setFormData({ subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Contact Seller</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter subject"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your message or question"
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
          
          <div className="mt-8 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Other Ways to Contact Us</h3>
            <p className="text-gray-600">📞 Phone: +1 (555) 123-4567</p>
            <p className="text-gray-600">📧 Email: support@truckpartspro.com</p>
            <p className="text-gray-600">🕒 Business Hours: Mon-Fri, 9 AM - 6 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
