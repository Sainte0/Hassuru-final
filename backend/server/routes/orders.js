const express = require('express');
const Order = require('../models/Order');
const authMiddleware = require('../middlewares/authMiddleware');
const mongoose = require('mongoose');
const { sendOrderReceiptEmail, sendNewOrderNotification, sendOrderShippedEmail, sendOrderCancelledEmail } = require('../utils/email');
const { uploadToSupabase } = require('../utils/supabase');
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
    
    // Procesar imágenes de productos si existen
    console.log('🔍 Verificando productos con fotos...');
    if (req.body.productos && Array.isArray(req.body.productos)) {
      console.log(`📦 Total productos: ${req.body.productos.length}`);
      
      for (let i = 0; i < req.body.productos.length; i++) {
        const producto = req.body.productos[i];
        console.log(`📝 Producto ${i + 1}: ${producto.nombre}`);
        console.log(`   Tiene fotos: ${producto.fotos ? 'Sí' : 'No'}`);
        
        // Si el producto tiene fotos en base64, subirlas a Supabase
        if (producto.fotos && Array.isArray(producto.fotos) && producto.fotos.length > 0) {
          console.log(`   📸 Cantidad de fotos: ${producto.fotos.length}`);
          const uploadedFotos = [];
          
          for (let j = 0; j < producto.fotos.length; j++) {
            const foto = producto.fotos[j];
            console.log(`   🖼️  Procesando foto ${j + 1}...`);
            
            try {
              // Convertir base64 a buffer
              if (foto.data && foto.data.startsWith('data:image')) {
                const base64Data = foto.data.split(',')[1];
                const imageBuffer = Buffer.from(base64Data, 'base64');
                console.log(`      Tamaño: ${imageBuffer.length} bytes`);
                
                // Subir a Supabase con optimización
                console.log(`      Subiendo a Supabase...`);
                const imageUrl = await uploadToSupabase(
                  imageBuffer, 
                  `order-${Date.now()}-${j}-${foto.name || 'image.jpg'}`,
                  'order-images',  // Bucket específico para imágenes de órdenes
                  { maxWidth: 800, maxHeight: 800, quality: 70 }
                );
                
                console.log(`      ✅ Subida exitosa: ${imageUrl}`);
                uploadedFotos.push({
                  url: imageUrl,
                  size: imageBuffer.length,
                  uploadedAt: new Date()
                });
              } else {
                console.log(`      ⚠️  Foto no tiene formato base64 válido`);
              }
            } catch (uploadError) {
              console.error(`      ❌ Error al subir foto ${j + 1}:`, uploadError.message);
              // Continuar con las demás fotos aunque una falle
            }
          }
          
          console.log(`   ✅ Total fotos subidas: ${uploadedFotos.length}`);
          // Reemplazar las fotos base64 con las URLs de Supabase
          req.body.productos[i].fotos = uploadedFotos;
        } else {
          console.log(`   ℹ️  No hay fotos para este producto`);
        }
      }
    } else {
      console.log('⚠️  No hay productos en el pedido');
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
    console.error('Error al crear orden:', error);
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