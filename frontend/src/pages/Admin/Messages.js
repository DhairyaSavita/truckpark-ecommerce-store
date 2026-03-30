import React, { useState, useEffect } from 'react';
import { messages, admin } from '../../services/api';
import toast from 'react-hot-toast';
import { EnvelopeIcon, CheckCircleIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const AdminMessages = () => {
  const [messageList, setMessageList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      let response;
      try {
        // Try to get messages from admin endpoint
        response = await admin.getAllMessages();
      } catch (error) {
        console.log('Admin endpoint failed, trying messages endpoint');
        // Fallback to regular messages endpoint
        response = await messages.getAll();
      }
      setMessageList(response.data || []);
      console.log('Messages loaded:', response.data?.length || 0);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
      setMessageList([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await messages.markRead(id);
      toast.success('Message marked as read');
      fetchMessages();
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status: 'read' });
      }
    } catch (error) {
      console.error('Error marking message:', error);
      toast.error('Failed to update message');
    }
  };

  const deleteMessage = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await messages.delete(id);
        toast.success('Message deleted');
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
        fetchMessages();
      } catch (error) {
        console.error('Error deleting message:', error);
        toast.error('Failed to delete message');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customer Enquiries</h1>
        <button
          onClick={fetchMessages}
          className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span>Refresh</span>
        </button>
      </div>

      {!messageList || messageList.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <EnvelopeIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
          <p className="text-gray-500">When customers send enquiries, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-semibold">
                All Enquiries 
                <span className="ml-2 text-sm text-gray-500">({messageList.length})</span>
              </h2>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {messageList.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedMessage?.id === message.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        {message.status === 'unread' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2 flex-shrink-0"></div>
                        )}
                        <p className="font-semibold text-gray-900 truncate">
                          {message.User?.name || 'Anonymous'}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-700 truncate mb-1">
                        {message.subject || 'No Subject'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {message.message?.substring(0, 60)}...
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      {message.status === 'unread' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(message.id);
                          }}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Mark as read"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(message.id);
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
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
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h2 className="text-xl font-bold mr-3">{selectedMessage.subject || 'No Subject'}</h2>
                      {selectedMessage.status === 'unread' && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          Unread
                        </span>
                      )}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-600">
                        <strong>From:</strong> {selectedMessage.User?.name || 'Anonymous'} ({selectedMessage.User?.email || 'No email'})
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Received:</strong> {formatDate(selectedMessage.created_at)}
                      </p>
                      {selectedMessage.User?.phone && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Phone:</strong> {selectedMessage.User.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {selectedMessage.status === 'unread' && (
                      <button
                        onClick={() => markAsRead(selectedMessage.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 text-gray-700">Message:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap text-gray-700">{selectedMessage.message}</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold mb-2 text-blue-900">Reply to Customer:</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Email:</strong>{' '}
                      <a 
                        href={`mailto:${selectedMessage.User?.email}?subject=Re: ${selectedMessage.subject}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {selectedMessage.User?.email}
                      </a>
                    </p>
                    {selectedMessage.User?.phone && (
                      <p className="text-sm text-gray-700">
                        <strong>Phone:</strong>{' '}
                        <a 
                          href={`tel:${selectedMessage.User.phone}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {selectedMessage.User.phone}
                        </a>
                      </p>
                    )}
                    <button
                      onClick={() => {
                        const mailtoLink = `mailto:${selectedMessage.User?.email}?subject=Re: ${selectedMessage.subject}&body=Dear ${selectedMessage.User?.name || 'Customer'},\n\nThank you for your enquiry. We will get back to you shortly.\n\nBest regards,\nTruckParts Pro Team`;
                        window.location.href = mailtoLink;
                      }}
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                      Send Email Reply
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <EnvelopeIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg">Select a message to view details</p>
                  <p className="text-sm mt-1">Click on any message from the list</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
