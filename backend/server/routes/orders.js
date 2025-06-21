const express = require('express');
const Order = require('../models/Order');
const authMiddleware = require('../middlewares/authMiddleware');
const mongoose = require('mongoose');
const { sendOrderReceiptEmail, sendNewOrderNotification, testClientEmail } = require('../utils/email');
const router = express.Router();

// Ruta simple para probar email al cliente
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('🧪 Test de email solicitado para:', email);
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email requerido' });
    }
    
    const result = await testClientEmail(email);
    
    if (result) {
      res.json({ success: true, message: `Email de prueba enviado a ${email}` });
    } else {
      res.status(500).json({ success: false, message: 'Error enviando email de prueba' });
    }
  } catch (error) {
    console.error('❌ Error en test de email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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
    console.log('📦 BODY RECIBIDO EN BACKEND:', req.body);
    const order = new Order(req.body);
    await order.save();
    console.log('✅ Pedido guardado en base de datos:', order._id);
    
    // Verificar datos del cliente antes de enviar email
    console.log('🔍 Verificando datos del cliente:');
    console.log('  - Email:', order.datosPersonales.email);
    console.log('  - Nombre:', order.datosPersonales.nombre);
    console.log('  - Datos completos:', order.datosPersonales);
    
    // Enviar email de comprobante al cliente
    try {
      console.log('📧 Iniciando envío de email de comprobante...');
      console.log('📧 Email del cliente:', order.datosPersonales.email);
      
      if (!order.datosPersonales.email) {
        console.log('❌ ERROR: No hay email del cliente');
        throw new Error('Email del cliente no encontrado');
      }
      
      const emailResult = await sendOrderReceiptEmail({ to: order.datosPersonales.email, order });
      console.log('✅ Email de comprobante enviado correctamente:', emailResult);
    } catch (err) {
      console.error('❌ Error enviando email de comprobante:', err);
      console.error('❌ Stack trace:', err.stack);
      console.error('❌ Error completo:', JSON.stringify(err, null, 2));
    }
    
    // Enviar notificación a Hassuru
    try {
      console.log('📧 Iniciando envío de notificación a Hassuru...');
      const hassuruResult = await sendNewOrderNotification({ order });
      console.log('✅ Notificación a Hassuru enviada correctamente:', hassuruResult);
    } catch (err) {
      console.error('❌ Error enviando notificación a Hassuru:', err);
    }
    
    res.status(201).json(order);
  } catch (error) {
    console.error('❌ Error general en creación de pedido:', error);
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