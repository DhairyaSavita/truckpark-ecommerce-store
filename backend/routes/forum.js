const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/User');
const { verifyToken } = require('../config/auth');

// Simple in-memory store for forum data
let forumPosts = [];
let forumComments = [];
let nextPostId = 1;
let nextCommentId = 1;

// Initialize with sample data
const initSampleData = async () => {
  try {
    if (forumPosts.length === 0) {
      const admin = await User.findOne({ where: { role: 'admin' } });
      const seller = await User.findOne({ where: { role: 'seller' } });
      
      if (admin) {
        forumPosts.push({
          id: nextPostId++,
          title: 'Welcome to the Seller Community!',
          content: 'Welcome all sellers! This is a space for you to connect, share experiences, ask questions, and grow together.',
          user_id: admin.id,
          category: 'announcements',
          likes: 0,
          views: 0,
          is_pinned: true,
          created_at: new Date(),
          updated_at: new Date(),
          User: { id: admin.id, name: admin.name, store_name: admin.store_name }
        });
      }
      
      if (seller) {
        forumPosts.push({
          id: nextPostId++,
          title: 'Tips for Selling Truck Parts Online',
          content: 'What are your best tips for selling truck parts online? Share your experiences!',
          user_id: seller.id,
          category: 'business',
          likes: 0,
          views: 0,
          is_pinned: false,
          created_at: new Date(),
          updated_at: new Date(),
          User: { id: seller.id, name: seller.name, store_name: seller.store_name }
        });
        
        forumPosts.push({
          id: nextPostId++,
          title: 'Technical Question: Common Engine Issues',
          content: 'What are the most common engine issues you see in trucks?',
          user_id: seller.id,
          category: 'technical',
          likes: 0,
          views: 0,
          is_pinned: false,
          created_at: new Date(),
          updated_at: new Date(),
          User: { id: seller.id, name: seller.name, store_name: seller.store_name }
        });
      }
    }
    console.log('✅ Forum initialized with sample data');
  } catch (error) {
    console.error('Error initializing forum:', error);
  }
};

initSampleData();

// Get all forum posts (public)
router.get('/posts', async (req, res) => {
  try {
    const { category, search } = req.query;
    let filteredPosts = [...forumPosts];
    
    if (category && category !== 'all' && category !== 'undefined') {
      filteredPosts = filteredPosts.filter(p => p.category === category);
    }
    
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(p => 
        p.title.toLowerCase().includes(searchLower) || 
        p.content.toLowerCase().includes(searchLower)
      );
    }
    
    filteredPosts.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
    
    res.json(filteredPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single post with comments (public)
router.get('/posts/:id', async (req, res) => {
  try {
    const post = forumPosts.find(p => p.id === parseInt(req.params.id));
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    post.views += 1;
    
    const postComments = forumComments
      .filter(c => c.post_id === post.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    res.json({ post, comments: postComments });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new post (requires authentication)
router.post('/posts', verifyToken, async (req, res) => {
  try {
    console.log('Create post - User from token:', req.user);
    
    const { title, content, category } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated. Please login.' });
    }
    
    // Check if user is seller or admin
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only sellers can create posts' });
    }
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'store_name', 'role']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const newPost = {
      id: nextPostId++,
      title,
      content,
      user_id: userId,
      category: category || 'general',
      likes: 0,
      views: 0,
      is_pinned: false,
      created_at: new Date(),
      updated_at: new Date(),
      User: user
    };
    
    forumPosts.unshift(newPost);
    console.log(`📝 New forum post created by ${user.name}: ${title}`);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Like a post (requires authentication)
router.post('/posts/:id/like', verifyToken, async (req, res) => {
  try {
    const post = forumPosts.find(p => p.id === parseInt(req.params.id));
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    post.likes += 1;
    res.json({ likes: post.likes });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add comment to post (requires authentication)
router.post('/posts/:id/comments', verifyToken, async (req, res) => {
  try {
    console.log('Add comment - User from token:', req.user);
    
    const { content } = req.body;
    const postId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated. Please login.' });
    }
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    const post = forumPosts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'store_name', 'role']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const newComment = {
      id: nextCommentId++,
      post_id: postId,
      user_id: userId,
      content,
      likes: 0,
      created_at: new Date(),
      User: user
    };
    
    forumComments.push(newComment);
    console.log(`💬 New comment added by ${user.name} on post: ${post.title}`);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Like a comment (requires authentication)
router.post('/comments/:id/like', verifyToken, async (req, res) => {
  try {
    const comment = forumComments.find(c => c.id === parseInt(req.params.id));
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    comment.likes += 1;
    res.json({ likes: comment.likes });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
