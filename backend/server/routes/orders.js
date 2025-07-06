const express = require('express');
const Order = require('../models/Order');
const authMiddleware = require('../middlewares/authMiddleware');
const mongoose = require('mongoose');
const { sendOrderReceiptEmail, sendNewOrderNotification, sendOrderShippedEmail, sendOrderCancelledEmail } = require('../utils/email');
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
    
    const order = new Order(req.body);
    await order.save();
    
    // Enviar email de comprobante al cliente
    try {
      await sendOrderReceiptEmail({ to: order.datosPersonales.email, order });
    } catch (err) {
      console.error('Error enviando email de comprobante:', err);
    }
    
    // Enviar notificación a Hassuru
    try {
      await sendNewOrderNotification({ order });
    } catch (err) {
      console.error('Error enviando notificación a Hassuru: ', err);
    }
    
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
    
    // Si el estado cambió a 'cancelado', enviar email de cancelación
    if (estado === 'cancelado') {
      try {
        await sendOrderCancelledEmail({ to: order.datosPersonales.email, order });
      } catch (err) {
        console.error('Error enviando email de cancelación:', err);
      }
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar tracking
router.put('/:id/tracking', authMiddleware, async (req, res) => {
  try {
    const { tracking } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { tracking },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

    // Si el estado es 'enviado', enviar email de notificación
    if (order.estado === 'enviado') {
      try {
        await sendOrderShippedEmail({ to: order.datosPersonales.email, order });
      } catch (err) {
        console.error('Error enviando email de envío:', err);
      }
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 