import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { forumAPI } from '../../services/api';
import { PlusIcon, ChatBubbleLeftIcon, HeartIcon, EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ForumList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, loading: authLoading } = useAuth();

  const categories = [
    { value: 'all', label: 'All Topics', icon: '📋' },
    { value: 'general', label: 'General Discussion', icon: '💬' },
    { value: 'technical', label: 'Technical Help', icon: '🔧' },
    { value: 'business', label: 'Business Tips', icon: '💼' },
    { value: 'marketing', label: 'Marketing', icon: '📢' },
    { value: 'announcements', label: 'Announcements', icon: '📣' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchTerm]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      
      const response = await forumAPI.getPosts(params);
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load forum posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to create a post');
      return;
    }
    
    if (user.role !== 'seller' && user.role !== 'admin') {
      toast.error('Only sellers can create posts');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      console.log('Creating post with token:', token ? 'Present' : 'Missing');
      console.log('User:', user);
      
      await forumAPI.createPost(newPost);
      toast.success('Post created successfully!');
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', category: 'general' });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.error || 'Failed to create post');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const postDate = new Date(date);
    const diffHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return 'Yesterday';
    return postDate.toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <div className="text-gray-500">Loading forum...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Seller Community Forum</h1>
          <p className="text-gray-600 mt-1">Connect, share, and grow together</p>
        </div>
        {(user?.role === 'seller' || user?.role === 'admin') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Discussion
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full transition ${
              selectedCategory === cat.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No discussions found. Be the first to start a conversation!</p>
          </div>
        ) : (
          posts.map((post) => (
            <Link to={`/forum/post/${post.id}`} key={post.id}>
              <div className="border-b p-4 hover:bg-gray-50 transition cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.is_pinned && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">📌 Pinned</span>
                      )}
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {categories.find(c => c.value === post.category)?.label || post.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>By {post.User?.store_name || post.User?.name || 'Unknown'}</span>
                      <span>• {formatDate(post.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                      {post.comments?.length || 0}
                    </span>
                    <span className="flex items-center">
                      <HeartIcon className="h-4 w-4 mr-1" />
                      {post.likes || 0}
                    </span>
                    <span className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {post.views || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Start New Discussion</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  {categories.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="What's your question or topic?"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  required
                  rows="6"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Write your message here..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Post Discussion</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumList;
