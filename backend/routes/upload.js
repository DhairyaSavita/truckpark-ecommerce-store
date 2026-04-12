const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { verifyToken } = require('../config/auth');

// ─── Ensure uploads directory exists ───
const UPLOAD_DIR = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ─── Multer storage config ───
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // product-<timestamp>-<random>.<ext>
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// ─── File filter — images only ───
const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

/**
 * POST /api/upload/product-image
 * Authenticated route — upload a single product image.
 * Returns the public URL to store in product.image_url
 */
router.post('/product-image', verifyToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Build the public URL for the uploaded file
    const protocol = req.protocol;
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/uploads/products/${req.file.filename}`;

    res.json({
      success: true,
      imageUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

/**
 * DELETE /api/upload/product-image/:filename
 * Authenticated — delete an uploaded image file.
 */
router.delete('/product-image/:filename', verifyToken, (req, res) => {
  try {
    const filename = path.basename(req.params.filename); // prevent path traversal
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Multer error handler ───
router.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 5 MB.' });
  }
  res.status(400).json({ error: err.message });
});

module.exports = router;
