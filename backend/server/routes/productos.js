const authMiddleware = require('../middlewares/authMiddleware');
const express = require('express');
const Producto = require('../models/Producto');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Configuración de multer para manejar la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find();
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
    const { nombre, descripcion, precio, marca, categoria, tallas, encargo, destacado, destacado_zapatillas } = req.body;
    if (!nombre || !precio || !marca || !categoria || !tallas) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    if (!Array.isArray(tallas) || !tallas.every(talla => talla.talla && talla.precioTalla)) {
      return res.status(400).json({ error: 'El campo tallas debe ser un arreglo con objetos que incluyan talla y precioTalla' });
    }    
    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      precio,
      marca,
      categoria,
      tallas,
      encargo,
      destacado,
      destacado_zapatillas
    });
    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/imagen', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'Se debe proporcionar una imagen.' });
    }

    // Leer el archivo como Buffer
    const imageBuffer = fs.readFileSync(req.file.path);
    const contentType = req.file.mimetype;

    // Actualizar el producto con la imagen como Buffer
    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { 
        image: {
          data: imageBuffer,
          contentType: contentType
        }
      },
      { new: true }
    );

    // Eliminar el archivo temporal
    fs.unlinkSync(req.file.path);

    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(productoActualizado);
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(400).json({ error: error.message });
  }
});


router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { image, ...updatedData } = req.body;
    const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(productoActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.put('/:id/image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'Se requiere una imagen para actualizar.' });
    }

    // Leer el archivo como Buffer
    const imageBuffer = fs.readFileSync(req.file.path);
    const contentType = req.file.mimetype;

    // Verificar que el producto existe antes de actualizar
    const productoExistente = await Producto.findById(id);
    if (!productoExistente) {
      fs.unlinkSync(req.file.path); // Limpiar el archivo temporal
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Actualizar el producto con la imagen como Buffer
    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { 
        image: {
          data: imageBuffer,
          contentType: contentType
        }
      },
      { new: true }
    ).select('-image.data'); // No enviar el buffer en la respuesta

    // Eliminar el archivo temporal
    fs.unlinkSync(req.file.path);

    res.status(200).json(productoActualizado);
  } catch (error) {
    // Asegurarse de limpiar el archivo temporal en caso de error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo temporal:', unlinkError);
      }
    }
    console.error('Error al actualizar la imagen del producto:', error);
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
