const express = require('express');
const Producto = require('../models/Producto');
const router = express.Router();

// Ruta para obtener la imagen de un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    
    if (!producto || !producto.image) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    // Si el producto tiene una URL de imagen, redirigir a esa URL
    if (producto.image.url) {
      return res.redirect(producto.image.url);
    }
    
    // Si no tiene URL pero tiene datos de imagen, enviar la imagen como antes
    if (producto.image.data) {
      // Establecer el tipo de contenido correcto
      res.set('Content-Type', producto.image.contentType);
      // Enviar la imagen como respuesta
      res.send(producto.image.data);
    } else {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener la imagen:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 