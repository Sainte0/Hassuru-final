const express = require('express');
const Order = require('../models/Order');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Crear pedido
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar pedidos (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ fechaCreacion: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cambiar estado
router.put('/:id/estado', authMiddleware, async (req, res) => {
  try {
    const { estado } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 