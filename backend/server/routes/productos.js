const authMiddleware = require('../middlewares/authMiddleware');
const express = require('express');
const Producto = require('../models/Producto');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find();

    const jsonResponse = JSON.stringify(productos);
    const responseSize = Buffer.byteLength(jsonResponse, 'utf8');
    const responseSizeKB = (responseSize / 1024).toFixed(2);

    console.log(`Tamaño de la respuesta: ${responseSizeKB} KB (${responseSize} bytes)`);

    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/nombre/:nombre', async (req, res) => {
  try {
    const { nombre } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'Debes proporcionar un nombre para filtrar.' });
    }

    const productosFiltrados = await Producto.find({
      nombre: { $regex: new RegExp(nombre, 'i') }
    })
    .skip((page - 1) * limit)
    .limit(limit);

    res.status(200).json(productosFiltrados);
  } catch (error) {
    console.error('Error al filtrar productos por nombre:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/categoria/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;
    const categoriasValidas = ['zapatillas', 'ropa', 'accesorios'];
    const categoriaLower = categoria ? categoria.toLowerCase() : null;
    if (categoriaLower && categoriasValidas.includes(categoriaLower)) {
      const productosFiltrados = await Producto.find({
        categoria: { $regex: new RegExp(categoria, 'i') }
      });
      return res.status(200).json(productosFiltrados);
    } else {
      return res.status(400).json({ error: 'Categoría no válida. Las categorías permitidas son: zapatillas, ropa, accesorios.' });
    }
  } catch (error) {
    console.error('Error en la ruta /categoria:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    if (typeof req.body.tallas !== 'object' || Array.isArray(req.body.tallas)) {
      return res.status(400).json({ error: 'El campo tallas debe ser un objeto con tallas y su stock' });
    }
    const nuevoProducto = new Producto(req.body);
    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(productoActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
    if (!productoEliminado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
