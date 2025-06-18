const express = require('express');
const Order = require('../models/Order');
const authMiddleware = require('../middlewares/authMiddleware');
const mongoose = require('mongoose');
const router = express.Router();

// Crear pedido
router.post('/', async (req, res) => {
  try {
    console.log('Pedido recibido:', JSON.stringify(req.body, null, 2));
    if (!Array.isArray(req.body.productos) || req.body.productos.length === 0) {
      return res.status(400).json({ error: 'La orden debe tener al menos un producto.' });
    }
    // Validar productoId
    for (const prod of req.body.productos) {
      if (!prod.productoId || !mongoose.Types.ObjectId.isValid(prod.productoId)) {
        console.error('ProductoId inválido:', prod.productoId);
        return res.status(400).json({ error: `ProductoId inválido: ${prod.productoId}` });
      }
    }
    console.log('Todos los productoId son válidos.');
    const order = new Order(req.body);
    await order.save();
    console.log('Pedido guardado correctamente');
    res.status(201).json(order);
  } catch (error) {
    console.error('Error al guardar pedido:', error);
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