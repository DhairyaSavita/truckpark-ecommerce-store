const express = require('express');
const router = express.Router();
const VehicleCompatibility = require('../models/VehicleCompatibility');
const Product = require('../models/Product');

// Check compatibility for a product
router.post('/check/:productId', async (req, res) => {
  try {
    const { make, model, year, engine } = req.body;
    const productId = req.params.productId;
    
    const compatibility = await VehicleCompatibility.findOne({
      where: {
        product_id: productId,
        make: { [Op.iLike]: `%${make}%` },
        model: { [Op.iLike]: `%${model}%` }
      }
    });
    
    const compatible = !!compatibility;
    res.json({ compatible, details: compatibility });
  } catch (error) {
    console.error('Error checking compatibility:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get compatible products for a vehicle
router.post('/products', async (req, res) => {
  try {
    const { make, model, year } = req.body;
    
    const compatibilities = await VehicleCompatibility.findAll({
      where: {
        make: { [Op.iLike]: `%${make}%` },
        model: { [Op.iLike]: `%${model}%` }
      },
      include: [{ model: Product, where: { approval_status: 'approved' } }]
    });
    
    const products = compatibilities.map(c => c.Product);
    res.json(products);
  } catch (error) {
    console.error('Error fetching compatible products:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
