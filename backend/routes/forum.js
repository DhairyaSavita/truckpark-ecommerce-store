const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/User');

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
    }
    console.log('✅ Forum initialized with sample data');
  } catch (error) {
    console.error('Error initializing forum:', error);
  }
};

initSampleData();

// Get all forum posts
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

// Get single post with comments
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

// Create new post
router.post('/posts', async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'store_name', 'role']
    });
    
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
    console.log(`📝 New forum post created: ${title}`);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Like a post
router.post('/posts/:id/like', async (req, res) => {
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

// Add comment to post
router.post('/posts/:id/comments', async (req, res) => {
  try {
    const { content } = req.body;
    const postId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const post = forumPosts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'store_name', 'role']
    });
    
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
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Like a comment
router.post('/comments/:id/like', async (req, res) => {
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
