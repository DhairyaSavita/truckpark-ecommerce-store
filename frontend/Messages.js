import React, { useState, useEffect } from 'react';
import { messages, admin } from '../../services/api';
import toast from 'react-hot-toast';
import { EnvelopeIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

const AdminMessages = () => {
  const [messageList, setMessageList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await admin.getAllMessages();
      setMessageList(response.data);
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await messages.markRead(id);
      toast.success('Message marked as read');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to update message');
    }
  };

  const deleteMessage = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await messages.delete(id);
        toast.success('Message deleted');
        fetchMessages();
      } catch (error) {
        toast.error('Failed to delete message');
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading messages...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Customer Enquiries</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="font-semibold">All Enquiries ({messageList.length})</h2>
          </div>
          <div className="divide-y">
            {messageList.map((message) => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                  selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      {message.status === 'unread' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      )}
                      <p className="font-semibold">{message.User?.name}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{message.subject}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {message.status === 'unread' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(message.id);
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(message.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Details */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
          {selectedMessage ? (
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    From: {selectedMessage.User?.name} ({selectedMessage.User?.email})
                  </p>
                  <p className="text-sm text-gray-500">
                    Received: {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {selectedMessage.status === 'unread' && (
                    <button
                      onClick={() => markAsRead(selectedMessage.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Message:</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded">
                <h3 className="font-semibold mb-2">Reply to Customer:</h3>
                <p className="text-sm text-gray-600">
                  Email: <a href={`mailto:${selectedMessage.User?.email}`} className="text-blue-600">
                    {selectedMessage.User?.email}
                  </a>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Phone: {selectedMessage.User?.phone || 'Not provided'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <EnvelopeIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
