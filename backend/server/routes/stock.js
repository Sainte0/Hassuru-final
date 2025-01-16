const express = require('express');
const Producto = require('../models/Producto');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { tallas } = req.body;

    // Validar que el producto exista
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Validar que tallas sea un arreglo con los campos correctos
    if (!Array.isArray(tallas) || !tallas.every(talla => talla.talla && talla.precioTalla)) {
      return res.status(400).json({
        error: 'El campo tallas debe ser un arreglo con objetos que incluyan talla y precioTalla',
      });
    }

    // Actualizar las tallas del producto
    producto.tallas = tallas;
    await producto.save();

    res.status(200).json(producto);
  } catch (error) {
    console.error('Error al actualizar tallas:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
