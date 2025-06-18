const express = require('express');
const Order = require('../models/Order');
const authMiddleware = require('../middlewares/authMiddleware');
const mongoose = require('mongoose');
const router = express.Router();

// Ultra simple: guardar pedido tal cual llega
router.post('/', async (req, res) => {
  try {
    // Fix: Si el body llega como string, parsea a objeto
    if (typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({ error: 'Body malformado' });
      }
    }
    console.log('BODY RECIBIDO EN BACKEND:', req.body);
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message, stack: error.stack });
  }
});

// Ruta de prueba para guardar un pedido fijo
router.post('/test', async (req, res) => {
  try {
    const order = new Order({
      productos: [{
        productoId: "testid123",
        nombre: "Producto Test",
        cantidad: 1,
        precio: 100,
        imagen: "https://via.placeholder.com/150"
      }],
      datosPersonales: {
        nombre: "Test",
        email: "test@test.com",
        telefono: "+541111111111"
      },
      envio: {
        tipo: "retiro",
        direccion: ""
      },
      pago: "usdt"
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message, stack: error.stack });
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