const authMiddleware = require('../middlewares/authMiddleware');
const express = require('express');
const Producto = require('../models/Producto');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { generateUniqueSlug } = require('../utils/slugify');
const { cacheMiddleware } = require('../utils/cache');
const { uploadToSupabase } = require('../utils/supabase');
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

// Ruta de categoría PRIMERO (antes de buscar)
router.get('/categoria/:categoria', async (req, res) => {
  try {
    console.log('🔍 Ruta /categoria/:categoria llamada');
    console.log('📋 Parámetros:', req.params);
    console.log('🔍 Query:', req.query);
    
    const { categoria } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      marca, 
      talla, 
      disponibilidad, 
      precioMin, 
      precioMax, 
      q,
      tallaRopa,
      tallaZapatilla,
      accesorio
    } = req.query;
    
    const categoriasValidas = ['zapatillas', 'ropa', 'accesorios'];
    const categoriaLower = categoria ? categoria.toLowerCase() : null;
    
    console.log('🏷️ Categoría recibida:', categoria);
    console.log('✅ Categoría válida:', categoriasValidas.includes(categoriaLower));
    
    if (categoriaLower && categoriasValidas.includes(categoriaLower)) {
      // Construir filtros
      let filterQuery = {
        categoria: { $regex: new RegExp(categoria, 'i') }
      };

      console.log('🔍 Query de filtro inicial:', JSON.stringify(filterQuery, null, 2));

      // Filtro por marca
      if (marca) {
        filterQuery.marca = { $in: [marca] };
      }

      // Filtro por talla (compatibilidad con diferentes tipos)
      if (talla || tallaRopa || tallaZapatilla || accesorio) {
        const tallaToUse = talla || tallaRopa || tallaZapatilla || accesorio;
        filterQuery['tallas.talla'] = tallaToUse;
      }

      // Filtro por disponibilidad
      if (disponibilidad) {
        switch (disponibilidad) {
          case 'Entrega inmediata':
            filterQuery.encargo = false;
            filterQuery.tallas = { $exists: true, $ne: [] };
            break;
          case 'Disponible en 3 días':
            filterQuery.encargo = true;
            filterQuery.tallas = { $exists: true, $ne: [] };
            break;
          case 'Disponible en 20 días':
            filterQuery.tallas = { $exists: false };
            break;
        }
      }

      // Filtro por precio
      if (precioMin || precioMax) {
        filterQuery.precio = {};
        if (precioMin) filterQuery.precio.$gte = parseFloat(precioMin);
        if (precioMax) filterQuery.precio.$lte = parseFloat(precioMax);
      }

      // Filtro por búsqueda
      if (q) {
        filterQuery.$or = [
          { nombre: { $regex: new RegExp(q, 'i') } },
          { descripcion: { $regex: new RegExp(q, 'i') } }
        ];
      }

      console.log('🔍 Query de filtro final:', JSON.stringify(filterQuery, null, 2));

      // Calcular skip para paginación
      const skip = (parseInt(page) - 1) * parseInt(limit);

      console.log('📊 Paginación - Skip:', skip, 'Limit:', limit);

      // Ejecutar consulta con paginación
      const [productos, total] = await Promise.all([
        Producto.find(filterQuery)
          .select('-image.data')
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Producto.countDocuments(filterQuery)
      ]);

      console.log('📦 Productos encontrados:', productos.length);
      console.log('📊 Total de productos:', total);

      // Ordenar productos por disponibilidad y precio
      const productosOrdenados = productos.sort((a, b) => {
        // Función para determinar el grupo de disponibilidad
        const getAvailabilityGroup = (product) => {
          const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;
          
          if (hasTallas && !product.encargo) return 1; // Entrega inmediata
          if (hasTallas && product.encargo) return 2; // Disponible en 3 días
          if (!hasTallas) return 3; // Disponible en 20 días
          return 4; // Otros casos
        };

        // Primero ordenar por grupo de disponibilidad
        const aGroup = getAvailabilityGroup(a);
        const bGroup = getAvailabilityGroup(b);
        
        if (aGroup !== bGroup) {
          return aGroup - bGroup;
        }
        
        // Si están en el mismo grupo, ordenar por precio
        const aPrice = parseFloat(a.precio) || 0;
        const bPrice = parseFloat(b.precio) || 0;
        
        return aPrice - bPrice; // Ordenar de menor a mayor precio
      });

      console.log('📊 Productos ordenados por disponibilidad y precio:', {
        total: productosOrdenados.length,
        muestra: productosOrdenados.slice(0, 5).map(p => ({
          nombre: p.nombre,
          precio: p.precio,
          encargo: p.encargo,
          tieneTallas: Array.isArray(p.tallas) && p.tallas.length > 0
        }))
      });

      const totalPages = Math.ceil(total / parseInt(limit));
      
      const response = {
        productos: productosOrdenados,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          productsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      };

      console.log('📤 Enviando respuesta:', {
        productosCount: response.productos.length,
        pagination: response.pagination
      });
      
      res.status(200).json(response);
    } else {
      console.log('❌ Categoría no válida:', categoria);
      return res.status(400).json({ error: 'Categoría no válida. Las categorías permitidas son: zapatillas, ropa, accesorios.' });
    }
  } catch (error) {
    console.error('💥 Error en la ruta /categoria:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener opciones de filtro de una categoría
router.get('/categoria/:categoria/filtros', async (req, res) => {
  try {
    console.log('🔍 Ruta /categoria/:categoria/filtros llamada');
    console.log('📋 Parámetros:', req.params);
    
    const { categoria } = req.params;
    
    const categoriasValidas = ['zapatillas', 'ropa', 'accesorios'];
    const categoriaLower = categoria ? categoria.toLowerCase() : null;
    
    if (!categoriaLower || !categoriasValidas.includes(categoriaLower)) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }

    // Obtener todos los productos de la categoría para extraer opciones de filtro
    const productos = await Producto.find({
      categoria: { $regex: new RegExp(categoria, 'i') }
    }).select('marca tallas precio encargo').lean();

    // Extraer opciones de filtro
    const marcas = new Set();
    const tallas = new Set();
    const precios = [];

    productos.forEach(producto => {
      // Marca
      if (producto.marca) {
        const marcasArray = Array.isArray(producto.marca) ? producto.marca : [producto.marca];
        marcasArray.forEach(marca => marcas.add(marca));
      }

      // Tallas
      if (producto.tallas && Array.isArray(producto.tallas)) {
        producto.tallas.forEach(talla => {
          if (talla.talla) {
            tallas.add(talla.talla);
          }
        });
      }

      // Precios
      if (producto.precio) {
        precios.push(parseFloat(producto.precio));
      }
    });

    const response = {
      marcas: Array.from(marcas).sort(),
      tallas: Array.from(tallas).sort(),
      precios: {
        min: precios.length > 0 ? Math.min(...precios) : 0,
        max: precios.length > 0 ? Math.max(...precios) : 0
      },
      disponibilidad: [
        'Entrega inmediata',
        'Disponible en 3 días',
        'Disponible en 20 días'
      ]
    };

    console.log('📤 Enviando opciones de filtro:', {
      marcasCount: response.marcas.length,
      tallasCount: response.tallas.length,
      precioRange: response.precios
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('💥 Error en la ruta /categoria/:categoria/filtros:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rutas específicas después
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

// Get destacados (limit 6)
router.get('/destacados', async (req, res) => {
  try {
    const productos = await Producto.find({ destacado: true })
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    res.status(500).json({ error: 'Error al obtener productos destacados' });
  }
});

// Get destacados zapatillas (limit 6)
router.get('/destacados-zapatillas', async (req, res) => {
  try {
    const productos = await Producto.find({ destacado_zapatillas: true })
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener zapatillas destacadas:', error);
    res.status(500).json({ error: 'Error al obtener zapatillas destacadas' });
  }
});

// Get últimos en ropa (limit 6) - solo entrega inmediata
router.get('/ultimos/ropa', async (req, res) => {
  try {
    const productos = await Producto.find({ 
      categoria: 'ropa',
      encargo: false,
      tallas: { $exists: true, $ne: [] }
    })
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener últimos productos de ropa:', error);
    res.status(500).json({ error: 'Error al obtener últimos productos de ropa' });
  }
});

// Get últimos en zapatillas (limit 6) - solo entrega inmediata
router.get('/ultimos/zapatillas', async (req, res) => {
  try {
    const productos = await Producto.find({ 
      categoria: 'zapatillas',
      encargo: false,
      tallas: { $exists: true, $ne: [] }
    })
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener últimos productos de zapatillas:', error);
    res.status(500).json({ error: 'Error al obtener últimos productos de zapatillas' });
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

    // Procesar las marcas para asegurar que sean elementos individuales
    let marcasArray = [];
    try {
      // Si marca es un string JSON, intentar parsearlo
      const marcasProcesadas = typeof marca === 'string' ? JSON.parse(marca) : marca;
      
      // Asegurarse de que cada marca sea un elemento individual
      if (Array.isArray(marcasProcesadas)) {
        marcasArray = marcasProcesadas
          .map(m => m.toString().trim())
          .filter(Boolean)
          .filter((m, index, self) => self.indexOf(m) === index); // Eliminar duplicados
      } else if (typeof marcasProcesadas === 'string') {
        // Si es un string, dividirlo por comas y procesar cada parte
        marcasArray = marcasProcesadas
          .split(',')
          .map(m => m.trim())
          .filter(Boolean)
          .filter((m, index, self) => self.indexOf(m) === index); // Eliminar duplicados
      } else {
        marcasArray = [marcasProcesadas.toString().trim()];
      }
    } catch (e) {
      console.error('Error al procesar marcas:', e);
      // Si falla el parseo, tratar marca como un string simple y dividirlo
      marcasArray = marca
        .toString()
        .split(',')
        .map(m => m.trim())
        .filter(Boolean)
        .filter((m, index, self) => self.indexOf(m) === index); // Eliminar duplicados
    }

    console.log('Marcas procesadas:', marcasArray);
    
    let imageData = null;
    
    if (req.file) {
      console.log('Archivo recibido:', req.file.originalname, 'Tipo:', req.file.mimetype);
      try {
        // Leer el archivo como Buffer
        const imageBuffer = fs.readFileSync(req.file.path);
        console.log('Archivo leído correctamente, tamaño:', imageBuffer.length, 'bytes');
        
        // Subir la imagen a Supabase con optimización automática
        try {
          console.log('Intentando subir imagen a Supabase...');
          const imageUrl = await uploadToSupabase(imageBuffer, req.file.originalname);
          console.log('Imagen subida exitosamente a Supabase:', imageUrl);
          
          // Obtener metadata de la imagen optimizada
          const sharp = require('sharp');
          const optimizedBuffer = await sharp(imageBuffer)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .png({ compressionLevel: 9, quality: 60 })
            .toBuffer();
          
          // Crear objeto de imagen con metadata
          imageData = {
            url: imageUrl,
            size: optimizedBuffer.length,
            source: 'optimized',
            updatedAt: new Date()
          };
          
        } catch (error) {
          console.error('Error al subir la imagen a Supabase:', error);
          return res.status(500).json({ error: 'Error al subir la imagen a Supabase: ' + error.message });
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
      marca: marcasArray,
      categoria,
      tallas: parsedTallas,
      colores: parsedColores,
      encargo: encargo === 'true',
      destacado: destacado === 'true',
      destacado_zapatillas: destacado_zapatillas === 'true',
      image: imageData
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
    
    // Subir la imagen a Supabase con optimización automática
    let imageData = null;
    
    try {
      console.log('Intentando subir imagen a Supabase...');
      const imageUrl = await uploadToSupabase(imageBuffer, req.file.originalname);
      console.log('Imagen subida exitosamente a Supabase:', imageUrl);
      
      // Obtener metadata de la imagen optimizada
      const sharp = require('sharp');
      const optimizedBuffer = await sharp(imageBuffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 9, quality: 60 })
        .toBuffer();
      
      imageData = {
        url: imageUrl,
        size: optimizedBuffer.length,
        source: 'optimized',
        updatedAt: new Date()
      };
      
    } catch (error) {
      console.error('Error al subir la imagen a Supabase:', error);
      return res.status(500).json({ error: 'Error al subir la imagen a Supabase: ' + error.message });
    } finally {
      // Eliminar el archivo temporal
      try {
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Error al eliminar archivo temporal:', error);
      }
    }

    // Actualizar el producto con la metadata de la imagen
    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { 
        image: imageData
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
    const { image, nombre, marca, ...updatedData } = req.body;
    
    // Si se está actualizando el nombre, actualizar también el slug
    if (nombre) {
      const producto = await Producto.findById(req.params.id);
      if (producto) {
        updatedData.slug = generateUniqueSlug(nombre, req.params.id);
      }
    }

    // Asegurarse de que marca sea un array
    if (marca) {
      updatedData.marca = Array.isArray(marca) ? marca : [marca];
    }
    
    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id, 
      { ...updatedData, nombre }, 
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
    
    // Subir la imagen a Supabase
    let imageData = null;
    try {
      console.log('Intentando subir imagen a Supabase...');
      const imageUrl = await uploadToSupabase(imageBuffer, req.file.originalname);
      console.log('Imagen subida exitosamente a Supabase:', imageUrl);
      
      // Obtener metadata de la imagen optimizada
      const sharp = require('sharp');
      const optimizedBuffer = await sharp(imageBuffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 9, quality: 60 })
        .toBuffer();
      
      imageData = {
        url: imageUrl,
        size: optimizedBuffer.length,
        source: 'optimized',
        updatedAt: new Date()
      };
      
    } catch (error) {
      console.error('Error al subir la imagen a Supabase:', error);
      return res.status(500).json({ error: 'Error al subir la imagen a Supabase: ' + error.message });
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
        image: imageData
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
