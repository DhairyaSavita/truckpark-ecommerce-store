const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../config/auth');

// ─── In-memory store (survives restarts would need DB migration) ───────────────
let forumPosts    = [];
let forumComments = [];
let nextPostId    = 1;
let nextCommentId = 1;

// Provider-eligible roles that can post
const PROVIDER_ROLES = ['seller', 'admin'];
// These user flags also grant posting access
const canPost = (user, dbUser) =>
  PROVIDER_ROLES.includes(user.role) ||
  dbUser?.is_driver ||
  dbUser?.is_technician_verified ||
  dbUser?.refurbisher_verified ||
  dbUser?.is_logistics;

// Channels available per role
const CHANNEL_MAP = {
  drivers:       { label: 'Drivers Hub',             icon: '🚛', roles: ['driver'] },
  technicians:   { label: 'Technicians Lounge',       icon: '🔧', roles: ['technician'] },
  refurbishers:  { label: 'Refurbishers Workshop',    icon: '♻️', roles: ['refurbisher'] },
  logistics:     { label: 'Logistics Operations',     icon: '📦', roles: ['logistics'] },
  trade:         { label: 'Open Trade',               icon: '🤝', roles: [] },
  general:       { label: 'General Discussion',       icon: '💬', roles: [] },
  technical:     { label: 'Technical Help',           icon: '⚙️', roles: [] },
  business:      { label: 'Business Tips',            icon: '💼', roles: [] },
  announcements: { label: 'Announcements',            icon: '📣', roles: [] },
};

const initSampleData = async () => {
  try {
    if (forumPosts.length === 0) {
      const admin = await User.findOne({ where: { role: 'admin' } });
      if (admin) {
        forumPosts.push(
          {
            id: nextPostId++,
            title: '🚀 Welcome to the Provider Community!',
            content: 'This is the hub for all service providers — Drivers, Technicians, Refurbishers, and Logistics Partners. Share knowledge, resolve technical queries, and support each other!',
            user_id: admin.id,
            category: 'announcements',
            channel: 'announcements',
            thread_type: 'announcement',
            upvotes: 0,
            upvoted_by: [],
            views: 0,
            is_pinned: true,
            is_resolved: false,
            author_role_badge: 'admin',
            created_at: new Date(),
            updated_at: new Date(),
            User: { id: admin.id, name: admin.name, store_name: admin.store_name },
            comments: [],
          },
          {
            id: nextPostId++,
            title: '❓ How do I handle overweight cargo on mountain routes?',
            content: 'Looking for experienced drivers who have done Shimla or Manali routes with heavy machinery. Any tips on permits, speed handling, and rest stops?',
            user_id: admin.id,
            category: 'drivers',
            channel: 'drivers',
            thread_type: 'technical_enquiry',
            upvotes: 3,
            upvoted_by: [],
            views: 12,
            is_pinned: false,
            is_resolved: false,
            author_role_badge: 'driver',
            created_at: new Date(Date.now() - 3600000),
            updated_at: new Date(Date.now() - 3600000),
            User: { id: admin.id, name: 'Ramesh K.', store_name: null },
            comments: [],
          },
          {
            id: nextPostId++,
            title: '✅ Best practices for refurbishing truck alternators',
            content: 'Sharing my workflow after 200+ alternator refurbs. Key steps: deep clean → brush test → regulator check → load test → wrap. Happy to answer questions!',
            user_id: admin.id,
            category: 'refurbishers',
            channel: 'refurbishers',
            thread_type: 'operational_insight',
            upvotes: 8,
            upvoted_by: [],
            views: 34,
            is_pinned: false,
            is_resolved: true,
            author_role_badge: 'refurbisher',
            created_at: new Date(Date.now() - 86400000),
            updated_at: new Date(Date.now() - 86400000),
            User: { id: admin.id, name: 'Priya M.', store_name: 'AutoReborn Parts' },
            comments: [],
          }
        );
      }
    }
    console.log('✅ Provider Community Forum initialized');
  } catch (err) {
    console.error('Forum init error:', err);
  }
};
initSampleData();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/forum/posts
// ─────────────────────────────────────────────────────────────────────────────
router.get('/posts', async (req, res) => {
  try {
    const { category, channel, search, thread_type, is_resolved } = req.query;
    let posts = [...forumPosts];

    if (channel && channel !== 'all') posts = posts.filter(p => p.channel === channel);
    else if (category && category !== 'all') posts = posts.filter(p => p.category === category);
    if (thread_type) posts = posts.filter(p => p.thread_type === thread_type);
    if (is_resolved !== undefined) posts = posts.filter(p => p.is_resolved === (is_resolved === 'true'));
    if (search?.trim()) {
      const s = search.toLowerCase();
      posts = posts.filter(p => p.title.toLowerCase().includes(s) || p.content.toLowerCase().includes(s));
    }

    posts.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/forum/channels — list available channels with stats
router.get('/channels', async (req, res) => {
  try {
    const stats = Object.entries(CHANNEL_MAP).map(([key, meta]) => ({
      key,
      ...meta,
      post_count: forumPosts.filter(p => p.channel === key).length,
    }));
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/forum/posts/:id
router.get('/posts/:id', async (req, res) => {
  try {
    const post = forumPosts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.views = (post.views || 0) + 1;
    const comments = forumComments.filter(c => c.post_id === post.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    res.json({ post, comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/forum/posts — create post (all providers + sellers + admin)
router.post('/posts', verifyToken, async (req, res) => {
  try {
    const { title, content, category, channel, thread_type } = req.body;
    const dbUser = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'store_name', 'role', 'is_driver', 'is_logistics', 'is_technician_verified', 'refurbisher_verified'] });

    if (!dbUser) return res.status(404).json({ error: 'User not found' });
    if (!canPost(req.user, dbUser)) return res.status(403).json({ error: 'Only providers (sellers, drivers, technicians, refurbishers, logistics) can post' });

    // Determine author role badge
    let badge = req.user.role;
    if (dbUser.is_driver) badge = 'driver';
    else if (dbUser.is_technician_verified) badge = 'technician';
    else if (dbUser.refurbisher_verified) badge = 'refurbisher';
    else if (dbUser.is_logistics) badge = 'logistics';

    const post = {
      id: nextPostId++,
      title, content,
      user_id: req.user.id,
      category: category || channel || 'general',
      channel: channel || category || 'general',
      thread_type: thread_type || 'general',
      upvotes: 0,
      upvoted_by: [],
      views: 0,
      is_pinned: false,
      is_resolved: false,
      solved_by_comment_id: null,
      author_role_badge: badge,
      created_at: new Date(),
      updated_at: new Date(),
      User: { id: dbUser.id, name: dbUser.name, store_name: dbUser.store_name },
    };
    forumPosts.unshift(post);
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/forum/posts/:id/like  (kept for backward compat)
router.post('/posts/:id/like', verifyToken, async (req, res) => {
  try {
    const post = forumPosts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.likes = (post.likes || 0) + 1;
    res.json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/forum/posts/:id/upvote
router.post('/posts/:id/upvote', verifyToken, async (req, res) => {
  try {
    const post = forumPosts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (!post.upvoted_by) post.upvoted_by = [];
    const uid = req.user.id;
    if (post.upvoted_by.includes(uid)) {
      post.upvoted_by = post.upvoted_by.filter(id => id !== uid);
      post.upvotes = Math.max(0, (post.upvotes || 0) - 1);
    } else {
      post.upvoted_by.push(uid);
      post.upvotes = (post.upvotes || 0) + 1;
    }
    res.json({ upvotes: post.upvotes, upvoted: post.upvoted_by.includes(uid) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/forum/posts/:id/resolve — mark thread as resolved
router.patch('/posts/:id/resolve', verifyToken, async (req, res) => {
  try {
    const post = forumPosts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Only the author or admin can mark as resolved' });

    const { solved_by_comment_id } = req.body;
    post.is_resolved = !post.is_resolved;
    post.solved_by_comment_id = post.is_resolved ? (solved_by_comment_id || null) : null;
    res.json({ is_resolved: post.is_resolved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/forum/posts/:id/comments
router.post('/posts/:id/comments', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const postId = parseInt(req.params.id);
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });

    const post = forumPosts.find(p => p.id === postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const dbUser = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'store_name', 'role', 'is_driver', 'is_logistics', 'is_technician_verified', 'refurbisher_verified'] });
    if (!dbUser) return res.status(404).json({ error: 'User not found' });

    let badge = req.user.role;
    if (dbUser.is_driver) badge = 'driver';
    else if (dbUser.is_technician_verified) badge = 'technician';
    else if (dbUser.refurbisher_verified) badge = 'refurbisher';
    else if (dbUser.is_logistics) badge = 'logistics';

    const comment = {
      id: nextCommentId++,
      post_id: postId,
      user_id: req.user.id,
      content,
      likes: 0,
      upvotes: 0,
      upvoted_by: [],
      author_role_badge: badge,
      created_at: new Date(),
      User: { id: dbUser.id, name: dbUser.name, store_name: dbUser.store_name },
    };
    forumComments.push(comment);
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/forum/comments/:id/like
router.post('/comments/:id/like', verifyToken, async (req, res) => {
  try {
    const comment = forumComments.find(c => c.id === parseInt(req.params.id));
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    comment.likes = (comment.likes || 0) + 1;
    res.json({ likes: comment.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/forum/comments/:id/upvote
router.post('/comments/:id/upvote', verifyToken, async (req, res) => {
  try {
    const comment = forumComments.find(c => c.id === parseInt(req.params.id));
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (!comment.upvoted_by) comment.upvoted_by = [];
    const uid = req.user.id;
    if (comment.upvoted_by.includes(uid)) {
      comment.upvoted_by = comment.upvoted_by.filter(id => id !== uid);
      comment.upvotes = Math.max(0, (comment.upvotes || 0) - 1);
    } else {
      comment.upvoted_by.push(uid);
      comment.upvotes = (comment.upvotes || 0) + 1;
    }
    res.json({ upvotes: comment.upvotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/forum/stats — community stats
router.get('/stats', async (req, res) => {
  try {
    res.json({
      total_posts:    forumPosts.length,
      total_comments: forumComments.length,
      resolved:       forumPosts.filter(p => p.is_resolved).length,
      by_channel:     Object.keys(CHANNEL_MAP).reduce((acc, k) => {
        acc[k] = forumPosts.filter(p => p.channel === k).length;
        return acc;
      }, {}),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
