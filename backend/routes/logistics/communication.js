/**
 * routes/logistics/communication.js
 *
 * Role-based logistics ↔ vendor communication channel.
 *
 * WHO CAN USE THIS:
 *  ✅ Logistics partners (is_logistics = true, role = 'user') — initiate + reply
 *  ✅ Admins             (role = 'admin')                     — full access
 *  ✅ Drivers            (is_driver = true)                   — initiate + reply
 *  ✅ Sellers/Vendors    (role = 'seller')                    — READ & REPLY only
 *  ❌ Plain customers    (role = 'user', no flags)            — blocked entirely
 *
 * NOTE: 'canContactLogistics' middleware handles the above gate.
 * Sellers attempting to INITIATE (POST /) get a 403 inside the route.
 */

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { verifyToken, canContactLogistics } = require('../../config/auth');
const User = require('../../models/User');
const LogisticsMessage = require('../../models/LogisticsMessage');

// All routes require auth + role gate
router.use(verifyToken, canContactLogistics);

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/logistics/messages/vendors
//  Returns users that a logistics partner can contact:
//   - approved sellers (vendors)
//   - other logistics partners (for coordination)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/vendors', async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.user.id, {
      attributes: ['id', 'is_logistics', 'is_driver']
    });

    // Logistics/admin/driver → show all sellers + other logistics partners
    // Seller → show all logistics partners they can reply to
    let whereClause;
    if (currentUser.is_logistics || req.user.role === 'admin' || currentUser.is_driver) {
      // Can contact sellers AND other logistics partners
      whereClause = {
        id: { [Op.ne]: req.user.id },     // exclude self
        status: { [Op.ne]: 'blocked' },
        [Op.or]: [
          { role: 'seller' },             // vendors to coordinate with
          { is_logistics: true },         // other logistics for subcontracting
        ]
      };
    } else {
      // Seller can only see logistics partners they can reply to
      whereClause = {
        is_logistics: true,
        status: { [Op.ne]: 'blocked' },
      };
    }

    const contacts = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'phone', 'role', 'is_logistics',
                   'logistics_company_name', 'logistics_verified',
                   'store_name', 'created_at'],
      order: [['name', 'ASC']],
      limit: 200,
    });

    res.json(contacts);
  } catch (err) {
    console.error('[LogisticsChat] /vendors error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/logistics/messages
//  Send a message.
//  WHO CAN INITIATE: logistics partners, admins, drivers.
//  WHO CAN REPLY:    sellers (only to threads already started by logistics).
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { receiver_id, message, subject, shipment_id } = req.body;

    if (!receiver_id || !message?.trim()) {
      return res.status(400).json({ error: 'receiver_id and message are required' });
    }

    const sender   = await User.findByPk(req.user.id,   { attributes: ['id', 'role', 'is_logistics', 'is_driver'] });
    const receiver = await User.findByPk(receiver_id,   { attributes: ['id', 'name', 'role', 'is_logistics'] });

    if (!receiver) return res.status(404).json({ error: 'Recipient not found' });

    const isLogisticsOrAdmin = sender.is_logistics || sender.is_driver || req.user.role === 'admin';
    const isSeller           = req.user.role === 'seller';

    if (isSeller) {
      // Sellers can ONLY reply — check a prior message from a logistics partner exists
      const priorContact = await LogisticsMessage.findOne({
        where: {
          sender_id:   receiver_id,   // logistics sent to this seller
          receiver_id: req.user.id,
        }
      });

      if (!priorContact) {
        return res.status(403).json({
          error: 'Sellers can only reply to messages initiated by a logistics partner. No prior conversation found.',
          code: 'SELLER_REPLY_ONLY',
        });
      }
    } else if (!isLogisticsOrAdmin) {
      return res.status(403).json({
        error: 'Only logistics partners or admins can initiate messages on this channel.',
        code: 'LOGISTICS_INITIATE_ONLY',
      });
    }

    const msg = await LogisticsMessage.create({
      sender_id:   req.user.id,
      receiver_id: parseInt(receiver_id),
      message:     message.trim(),
      subject:     subject || 'Transport Coordination',
      shipment_id: shipment_id || null,
      is_read:     false,
    });

    const full = await LogisticsMessage.findByPk(msg.id, {
      include: [
        { model: User, as: 'Sender',   attributes: ['id', 'name', 'email'] },
        { model: User, as: 'Receiver', attributes: ['id', 'name', 'email'] },
      ],
    });

    console.log(`📦 [LogisticsChat] ${sender.id} → ${receiver_id}: "${message.slice(0, 60)}"`);
    res.status(201).json(full);
  } catch (err) {
    console.error('[LogisticsChat] POST / error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/logistics/messages
//  Returns all conversations for the currently logged in user (grouped by peer).
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const messages = await LogisticsMessage.findAll({
      where: {
        [Op.or]: [
          { sender_id:   req.user.id },
          { receiver_id: req.user.id },
        ],
      },
      include: [
        { model: User, as: 'Sender',   attributes: ['id', 'name', 'email', 'role', 'is_logistics'] },
        { model: User, as: 'Receiver', attributes: ['id', 'name', 'email', 'role', 'is_logistics'] },
      ],
      order: [['created_at', 'DESC']],
    });

    // Group by peer
    const convMap = {};
    for (const m of messages) {
      const peerId = m.sender_id === req.user.id ? m.receiver_id : m.sender_id;
      const peer   = m.sender_id === req.user.id ? m.Receiver  : m.Sender;
      if (!convMap[peerId]) {
        convMap[peerId] = {
          peer_id:      peerId,
          peer_name:    peer?.name  || 'Unknown',
          peer_email:   peer?.email || '',
          peer_role:    peer?.role  || '',
          is_logistics: peer?.is_logistics || false,
          last_message: m.message,
          last_at:      m.created_at,
          unread_count: 0,
          shipment_id:  m.shipment_id,
        };
      }
      if (!m.is_read && m.receiver_id === req.user.id) {
        convMap[peerId].unread_count++;
      }
    }

    const conversations = Object.values(convMap)
      .sort((a, b) => new Date(b.last_at) - new Date(a.last_at));

    res.json(conversations);
  } catch (err) {
    console.error('[LogisticsChat] GET / error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/logistics/messages/thread/:peerId
//  Full message thread between current user and peer. Auto-marks as read.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/thread/:peerId', async (req, res) => {
  try {
    const peerId = parseInt(req.params.peerId);
    if (!peerId) return res.status(400).json({ error: 'Invalid peer ID' });

    const messages = await LogisticsMessage.findAll({
      where: {
        [Op.or]: [
          { sender_id: req.user.id,  receiver_id: peerId },
          { sender_id: peerId,       receiver_id: req.user.id },
        ],
      },
      include: [
        { model: User, as: 'Sender',   attributes: ['id', 'name', 'email'] },
        { model: User, as: 'Receiver', attributes: ['id', 'name', 'email'] },
      ],
      order: [['created_at', 'ASC']],
    });

    // Auto-mark messages sent to me as read
    await LogisticsMessage.update(
      { is_read: true },
      { where: { sender_id: peerId, receiver_id: req.user.id, is_read: false } }
    );

    res.json(messages);
  } catch (err) {
    console.error('[LogisticsChat] /thread error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/logistics/messages/:id/read
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/read', async (req, res) => {
  try {
    const msg = await LogisticsMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'Cannot mark others\' messages as read' });
    }
    msg.is_read = true;
    await msg.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
