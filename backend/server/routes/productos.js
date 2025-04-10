const authMiddleware = require('../middlewares/authMiddleware');
const express = require('express');
const Producto = require('../models/Producto');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { generateUniqueSlug } = require('../utils/slugify');
const { cacheMiddleware } = require('../utils/cache');
const { uploadToImgBB } = require('../utils/imgbb');
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

// Rutas específicas primero
router.get('/buscar/:termino', async (req, res) => {
  try {
    const { termino } = req.params;
    
    if (!termino || termino.trim() === '') {
      return res.status(400).json({ error: 'Debes proporcionar un término para buscar.' });
    }

    const searchRegex = new RegExp(termino, 'i');
    const productosFiltrados = await Producto.find({
      $or: [
        { nombre: { $regex: searchRegex } },
        { descripcion: { $regex: searchRegex } }
      ]
    })
    .select('-image.data')
    .lean();
      
    res.status(200).json(productosFiltrados);
  } catch (error) {
    console.error('Error al filtrar productos:', error);
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
      })
      .select('-image.data')
      .lean();
      
      return res.status(200).json(productosFiltrados);
    } else {
      return res.status(400).json({ error: 'Categoría no válida. Las categorías permitidas son: zapatillas, ropa, accesorios.' });
    }
  } catch (error) {
    console.error('Error en la ruta /categoria:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rutas generales después
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find()
      .select('-image.data')
      .lean();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener un producto por ID (mantener compatibilidad)
router.get('/:id', async (req, res) => {
  try {
    // Verificar si el ID es un slug o un ID de MongoDB
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    
    let producto;
    if (isMongoId) {
      producto = await Producto.findById(req.params.id);
    } else {
      producto = await Producto.findOne({ slug: req.params.id });
    }
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    console.log('Iniciando creación de producto...');
    console.log('Datos recibidos:', JSON.stringify(req.body));
    
    const { nombre, descripcion, precio, marca, categoria, tallas, colores, encargo, destacado, destacado_zapatillas } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !precio || !marca || !categoria) {
      console.error('Faltan campos requeridos');
      return res.status(400).json({ error: 'Faltan campos requeridos: nombre, precio, marca, categoria' });
    }
    
    let imageUrl = null;
    
    if (req.file) {
      console.log('Archivo recibido:', req.file.originalname, 'Tipo:', req.file.mimetype);
      try {
        // Leer el archivo como Buffer
        const imageBuffer = fs.readFileSync(req.file.path);
        console.log('Archivo leído correctamente, tamaño:', imageBuffer.length, 'bytes');
        
        // Subir la imagen a ImgBB
        try {
          console.log('Intentando subir imagen a ImgBB...');
          // No pasamos la API key, usará la hardcodeada como respaldo
          imageUrl = await uploadToImgBB(imageBuffer);
          console.log('Imagen subida exitosamente a ImgBB:', imageUrl);
        } catch (error) {
          console.error('Error al subir la imagen a ImgBB:', error);
          return res.status(500).json({ error: 'Error al subir la imagen a ImgBB: ' + error.message });
        } finally {
          // Eliminar el archivo temporal
          if (req.file && req.file.path) {
            try {
              fs.unlinkSync(req.file.path);
              console.log('Archivo temporal eliminado');
            } catch (error) {
              console.error('Error al eliminar archivo temporal:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error al procesar la imagen:', error);
        return res.status(500).json({ error: 'Error al procesar la imagen: ' + error.message });
      }
    } else {
      console.log('No se recibió ningún archivo de imagen');
    }

    // Parsear tallas y colores si son strings JSON
    let parsedTallas = [];
    let parsedColores = [];
    
    try {
      parsedTallas = tallas ? JSON.parse(tallas) : [];
      console.log('Tallas parseadas:', parsedTallas);
    } catch (e) {
      console.error('Error al parsear tallas:', e);
      return res.status(400).json({ error: 'Formato de tallas inválido' });
    }
    
    try {
      parsedColores = colores ? JSON.parse(colores) : [];
      console.log('Colores parseados:', parsedColores);
    } catch (e) {
      console.error('Error al parsear colores:', e);
      return res.status(400).json({ error: 'Formato de colores inválido' });
    }

    // Generar un slug único para el producto
    const slug = generateUniqueSlug(nombre);
    console.log('Slug generado:', slug);

    const nuevoProducto = new Producto({
      nombre,
      slug,
      descripcion,
      precio: parseFloat(precio),
      marca,
      categoria,
      tallas: parsedTallas,
      colores: parsedColores,
      encargo: encargo === 'true',
      destacado: destacado === 'true',
      destacado_zapatillas: destacado_zapatillas === 'true',
      image: imageUrl ? { url: imageUrl } : null
    });

    console.log('Guardando producto en la base de datos...');
    const productoGuardado = await nuevoProducto.save();
    console.log('Producto guardado exitosamente con ID:', productoGuardado._id);
    
    res.status(201).json(productoGuardado);
  } catch (error) {
    console.error('Error al crear el producto:', error);
    
    // Asegurarse de eliminar el archivo temporal si existe
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Archivo temporal eliminado después de error');
      } catch (unlinkError) {
        console.error('Error al eliminar archivo temporal:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Error al crear el producto: ' + error.message });
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
    
    // Subir la imagen a ImgBB
    let imageUrl = null;
    try {
      console.log('Intentando subir imagen a ImgBB...');
      // No pasamos la API key, usará la hardcodeada como respaldo
      imageUrl = await uploadToImgBB(imageBuffer);
      console.log('Imagen subida exitosamente a ImgBB:', imageUrl);
    } catch (error) {
      console.error('Error al subir la imagen a ImgBB:', error);
      return res.status(500).json({ error: 'Error al subir la imagen a ImgBB: ' + error.message });
    } finally {
      // Eliminar el archivo temporal
      try {
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Error al eliminar archivo temporal:', error);
      }
    }

    // Actualizar el producto con la URL de la imagen
    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { 
        image: { url: imageUrl }
      },
      { new: true }
    );

    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(productoActualizado);
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    
    // Asegurarse de eliminar el archivo temporal si existe
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo temporal:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Error al subir la imagen: ' + error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { image, nombre, ...updatedData } = req.body;
    
    // Si se está actualizando el nombre, actualizar también el slug
    if (nombre) {
      const producto = await Producto.findById(req.params.id);
      if (producto) {
        updatedData.slug = generateUniqueSlug(nombre, req.params.id);
      }
    }
    
    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id, 
      updatedData, 
      { new: true }
    );
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
    
    // Verificar que se ha subido un archivo
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
    }

    // Verificar que el producto existe
    const productoExistente = await Producto.findById(id);
    if (!productoExistente) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Error al eliminar archivo temporal:', error);
      }
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Leer el archivo como Buffer
    const imageBuffer = fs.readFileSync(req.file.path);
    
    // Subir la imagen a ImgBB
    let imageUrl = null;
    try {
      console.log('Intentando subir imagen a ImgBB...');
      // No pasamos la API key, usará la hardcodeada como respaldo
      imageUrl = await uploadToImgBB(imageBuffer);
      console.log('Imagen subida exitosamente a ImgBB:', imageUrl);
    } catch (error) {
      console.error('Error al subir la imagen a ImgBB:', error);
      return res.status(500).json({ error: 'Error al subir la imagen a ImgBB: ' + error.message });
    } finally {
      // Eliminar el archivo temporal
      try {
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Error al eliminar archivo temporal:', error);
      }
    }

    // Actualizar el producto con la URL de la imagen
    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { 
        image: { url: imageUrl }
      },
      { new: true }
    );

    // Devolver el producto actualizado
    res.status(200).json(productoActualizado);
  } catch (error) {
    console.error('Error al actualizar la imagen del producto:', error);
    
    // Asegurarse de eliminar el archivo temporal si existe
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo temporal:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Error al actualizar la imagen del producto: ' + error.message });
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

// Ruta para obtener la imagen de un producto
router.get('/:id/image', async (req, res) => {
  try {
    // Verificar si el ID es un slug o un ID de MongoDB
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    
    let producto;
    if (isMongoId) {
      producto = await Producto.findById(req.params.id).select('image');
    } else {
      producto = await Producto.findOne({ slug: req.params.id }).select('image');
    }
    
    // Si el producto tiene una URL de imagen, redirigir a esa URL
    if (producto && producto.image && producto.image.url) {
      return res.redirect(producto.image.url);
    } else {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener la imagen:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
