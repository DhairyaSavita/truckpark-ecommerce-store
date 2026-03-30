const express = require('express');
const router = express.Router();
const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
const User = require('../models/User');
const { verifyToken } = require('../config/auth');

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await ForumPost.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'store_name'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create post
router.post('/posts', verifyToken, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const post = await ForumPost.create({
      title,
      content,
      user_id: req.user.id,
      category: category || 'general'
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single post with comments
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await ForumPost.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'store_name'] }]
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Increment views
    post.views += 1;
    await post.save();
    
    const comments = await ForumComment.findAll({
      where: { post_id: post.id },
      include: [{ model: User, attributes: ['id', 'name', 'store_name'] }],
      order: [['created_at', 'ASC']]
    });
    
    res.json({ post, comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment
router.post('/posts/:id/comments', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await ForumComment.create({
      post_id: req.params.id,
      user_id: req.user.id,
      content
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
