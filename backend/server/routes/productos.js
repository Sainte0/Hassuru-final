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

// Ruta para el catálogo con filtros y paginación (DEBE IR PRIMERO)
router.get('/catalogo', async (req, res) => {
  try {
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
      accesorio,
      categoria,
      sort
    } = req.query;
    
    // Construir filtros
    let filterQuery = {};

    // Filtro por categoría
    if (categoria) {
      if (categoria.toLowerCase() === 'accesorios') {
        // Para accesorios, incluir tanto productos de categoría accesorios como productos de ropa con talla "accesorios"
        filterQuery.$or = [
          { categoria: { $regex: new RegExp(categoria, 'i') } },
          { 
            categoria: 'ropa',
            'tallas.talla': { $regex: /accesorios/i }
          }
        ];
      } else {
        filterQuery.categoria = { $regex: new RegExp(categoria, 'i') };
      }
    }

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
        case 'Disponible en 5 días':
          filterQuery.encargo = true;
          filterQuery.tallas = { $exists: true, $ne: [] };
          break;
        case 'Disponible en 20 días':
          filterQuery.tallas = { $size: 0 };
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
        { descripcion: { $regex: new RegExp(q, 'i') } },
        { marca: { $regex: new RegExp(q, 'i') } }
      ];
    }

    // Obtener TODOS los productos que coincidan con los filtros
    const todosLosProductos = await Producto.find(filterQuery)
      .select('-image.data')
      .lean();

    // Ordenar TODOS los productos por disponibilidad y precio
    const todosLosProductosOrdenados = todosLosProductos.sort((a, b) => {
      // Si hay un parámetro de ordenamiento específico, usarlo
      if (sort === 'asc' || sort === 'desc') {
        const aPrice = parseFloat(a.precio) || 0;
        const bPrice = parseFloat(b.precio) || 0;
        
        if (sort === 'asc') {
          return aPrice - bPrice; // Menor a mayor
        } else {
          return bPrice - aPrice; // Mayor a menor
        }
      }

      // Ordenamiento por defecto: primero por disponibilidad, luego por precio
      // Función para determinar el grupo de disponibilidad
      const getAvailabilityGroup = (product) => {
        const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;
        
        if (hasTallas && !product.encargo) return 1; // Entrega inmediata
        if (hasTallas && product.encargo) return 2; // Disponible en 5 días
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

    // Calcular skip para paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const productosDeLaPagina = todosLosProductosOrdenados.slice(skip, skip + parseInt(limit));

    const total = todosLosProductosOrdenados.length;
    const totalPages = Math.ceil(total / parseInt(limit));

    const response = {
      productos: productosDeLaPagina,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        productsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error en la ruta /catalogo: ', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener opciones de filtro del catálogo (DEBE IR DESPUÉS DE /catalogo)
router.get('/catalogo/filtros', async (req, res) => {
  try {
    // Obtener todos los productos para extraer opciones de filtro
    const productos = await Producto.find({})
      .select('marca categoria tallas precio encargo')
      .lean();

    // Extraer marcas únicas
    const marcasSet = new Set();
    productos.forEach(producto => {
      if (producto.marca) {
        const marcas = Array.isArray(producto.marca) ? producto.marca : [producto.marca];
        marcas.forEach(marca => marcasSet.add(marca));
      }
    });

    // Extraer tallas únicas por categoría
    const tallasPorCategoria = {
      zapatillas: new Set(),
      ropa: new Set(),
      accesorios: new Set()
    };

    productos.forEach(producto => {
      if (producto.categoria && Array.isArray(producto.tallas)) {
        producto.tallas.forEach(talla => {
          if (talla.talla) {
            if (producto.categoria === 'zapatillas') {
              tallasPorCategoria.zapatillas.add(talla.talla);
            } else if (producto.categoria === 'ropa') {
              // Excluir "accesorios" de las tallas de ropa ya que no es una talla válida
              if (talla.talla.toLowerCase() !== 'accesorios') {
                tallasPorCategoria.ropa.add(talla.talla);
              } else {
                // Agregar "accesorios" a la categoría de accesorios
                tallasPorCategoria.accesorios.add(talla.talla);
              }
            } else if (producto.categoria === 'accesorios') {
              tallasPorCategoria.accesorios.add(talla.talla);
            }
          }
        });
      }
    });

    // Ordenar tallas de mayor a menor
    const ordenarTallas = (tallas) => {
      return Array.from(tallas).sort((a, b) => {
        // Orden específico para tallas de ropa (de mayor a menor)
        const tallaOrder = ["XXL", "XL", "L", "M", "S", "XS", "OS"];
        const aIndex = tallaOrder.indexOf(a);
        const bIndex = tallaOrder.indexOf(b);
        
        // Si ambas tallas están en el orden específico, usar ese orden
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        
        // Si solo una está en el orden específico, priorizarla
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // Para tallas numéricas (zapatillas), ordenar de mayor a menor
        const parseTalla = (talla) => {
          const match = talla.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        };

        const aNum = parseTalla(a);
        const bNum = parseTalla(b);

        if (aNum !== bNum) {
          return bNum - aNum; // Cambiado de aNum - bNum a bNum - aNum para mayor a menor
        }

        return b.localeCompare(a); // Cambiado para orden descendente
      });
    };

    const response = {
      marcas: Array.from(marcasSet).sort(),
      tallas: {
        zapatillas: ordenarTallas(tallasPorCategoria.zapatillas),
        ropa: ordenarTallas(tallasPorCategoria.ropa),
        accesorios: ordenarTallas(tallasPorCategoria.accesorios)
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('💥 Error en la ruta /catalogo/filtros:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta de categoría PRIMERO (antes de buscar)
router.get('/categoria/:categoria', async (req, res) => {
  try {
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
      accesorio,
      sort
    } = req.query;
    
    const categoriasValidas = ['zapatillas', 'ropa', 'accesorios'];
    const categoriaLower = categoria ? categoria.toLowerCase() : null;
    
    if (categoriaLower && categoriasValidas.includes(categoriaLower)) {
      // Construir filtros
      let filterQuery = {};
      
      if (categoriaLower === 'accesorios') {
        // Para accesorios, incluir tanto productos de categoría accesorios como productos de ropa con talla "accesorios"
        filterQuery.$or = [
          { categoria: { $regex: new RegExp(categoria, 'i') } },
          { 
            categoria: 'ropa',
            'tallas.talla': { $regex: /accesorios/i }
          }
        ];
      } else {
        filterQuery.categoria = { $regex: new RegExp(categoria, 'i') };
      }

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
          case 'Disponible en 5 días':
            filterQuery.encargo = true;
            filterQuery.tallas = { $exists: true, $ne: [] };
            break;
          case 'Disponible en 20 días':
            filterQuery.tallas = { $size: 0 };
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
          { descripcion: { $regex: new RegExp(q, 'i') } },
          { marca: { $regex: new RegExp(q, 'i') } }
        ];
      }

      // Obtener TODOS los productos de la categoría para ordenamiento correcto
      const todosLosProductos = await Producto.find(filterQuery)
        .select('-image.data')
        .lean();

      // Ordenar TODOS los productos por disponibilidad y precio
      const todosLosProductosOrdenados = todosLosProductos.sort((a, b) => {
        // Si hay un parámetro de ordenamiento específico, usarlo
        if (sort === 'asc' || sort === 'desc') {
          const aPrice = parseFloat(a.precio) || 0;
          const bPrice = parseFloat(b.precio) || 0;
          
          if (sort === 'asc') {
            return aPrice - bPrice; // Menor a mayor
          } else {
            return bPrice - aPrice; // Mayor a menor
          }
        }

        // Ordenamiento por defecto: primero por disponibilidad, luego por precio
        // Función para determinar el grupo de disponibilidad
        const getAvailabilityGroup = (product) => {
          const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;
          
          if (hasTallas && !product.encargo) return 1; // Entrega inmediata
          if (hasTallas && product.encargo) return 2; // Disponible en 5 días
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

      // Calcular skip para paginación
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const productosDeLaPagina = todosLosProductosOrdenados.slice(skip, skip + parseInt(limit));

      const total = todosLosProductosOrdenados.length;
      const totalPages = Math.ceil(total / parseInt(limit));

      const response = {
        productos: productosDeLaPagina,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          productsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      };
      
      res.status(200).json(response);
    } else {
      return res.status(400).json({ error: 'Categoría no válida. Las categorías permitidas son: zapatillas, ropa, accesorios.' });
    }
  } catch (error) {
    console.error('Error en la ruta /categoria:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener todas las tallas de una categoría (sin paginación)
router.get('/categoria/:categoria/tallas', async (req, res) => {
  try {
    const { categoria } = req.params;
    
    const categoriasValidas = ['zapatillas', 'ropa', 'accesorios'];
    const categoriaLower = categoria ? categoria.toLowerCase() : null;
    
    if (!categoriaLower || !categoriasValidas.includes(categoriaLower)) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }

    // Construir filtro para la categoría
    const filterQuery = {
      categoria: { $regex: new RegExp(categoria, 'i') }
    };

    // Obtener todos los productos de la categoría
    const productos = await Producto.find(filterQuery)
      .select('-image.data')
      .lean();

    // Extraer todas las tallas únicas
    const tallasSet = new Set();
    productos.forEach(producto => {
      if (Array.isArray(producto.tallas)) {
        producto.tallas.forEach(talla => {
          if (talla.talla) {
            tallasSet.add(talla.talla);
          }
        });
      }
    });

    // Convertir a array y ordenar de mayor a menor
    const tallasArray = Array.from(tallasSet).sort((a, b) => {
      // Orden específico para tallas de ropa (de mayor a menor)
      const tallaOrder = ["XXL", "XL", "L", "M", "S", "XS", "OS"];
      const aIndex = tallaOrder.indexOf(a);
      const bIndex = tallaOrder.indexOf(b);
      
      // Si ambas tallas están en el orden específico, usar ese orden
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // Si solo una está en el orden específico, priorizarla
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // Para tallas numéricas (zapatillas), ordenar de mayor a menor
      const parseTalla = (talla) => {
        const match = talla.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      };

      const aNum = parseTalla(a);
      const bNum = parseTalla(b);

      if (aNum !== bNum) {
        return bNum - aNum; // Cambiado para mayor a menor
      }

      // Si los números son iguales, ordenar alfabéticamente descendente
      return b.localeCompare(a);
    });

    res.status(200).json(tallasArray);
  } catch (error) {
    console.error('💥 Error en la ruta /categoria/:categoria/tallas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener opciones de filtro de una categoría específica
router.get('/categoria/:categoria/filtros', async (req, res) => {
  try {
    const { categoria } = req.params;
    
    const categoriasValidas = ['zapatillas', 'ropa', 'accesorios'];
    const categoriaLower = categoria ? categoria.toLowerCase() : null;
    
    if (!categoriaLower || !categoriasValidas.includes(categoriaLower)) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }

    // Construir filtro para la categoría
    const filterQuery = {
      categoria: { $regex: new RegExp(categoria, 'i') }
    };

    // Obtener todos los productos de la categoría
    const productos = await Producto.find(filterQuery)
      .select('marca tallas')
      .lean();

    // Extraer marcas únicas
    const marcasSet = new Set();
    productos.forEach(producto => {
      if (producto.marca) {
        const marcas = Array.isArray(producto.marca) ? producto.marca : [producto.marca];
        marcas.forEach(marca => marcasSet.add(marca));
      }
    });

    // Extraer tallas únicas
    const tallasSet = new Set();
    productos.forEach(producto => {
      if (Array.isArray(producto.tallas)) {
        producto.tallas.forEach(talla => {
          if (talla.talla) {
            tallasSet.add(talla.talla);
          }
        });
      }
    });

    // Ordenar tallas de mayor a menor
    const tallasArray = Array.from(tallasSet).sort((a, b) => {
      // Orden específico para tallas de ropa (de mayor a menor)
      const tallaOrder = ["XXL", "XL", "L", "M", "S", "XS", "OS"];
      const aIndex = tallaOrder.indexOf(a);
      const bIndex = tallaOrder.indexOf(b);
      
      // Si ambas tallas están en el orden específico, usar ese orden
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // Si solo una está en el orden específico, priorizarla
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // Para tallas numéricas (zapatillas), ordenar de mayor a menor
      const parseTalla = (talla) => {
        const match = talla.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      };

      const aNum = parseTalla(a);
      const bNum = parseTalla(b);

      if (aNum !== bNum) {
        return bNum - aNum; // Cambiado para mayor a menor
      }

      return b.localeCompare(a); // Cambiado para orden descendente
    });

    const response = {
      marcas: Array.from(marcasSet).sort(),
      tallas: tallasArray
    };

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
    const { nombre, descripcion, precio, marca, categoria, tallas, colores, encargo, destacado, destacado_zapatillas } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !precio || !marca || !categoria) {
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
      // Si falla el parseo, tratar marca como un string simple y dividirlo
      marcasArray = marca
        .toString()
        .split(',')
        .map(m => m.trim())
        .filter(Boolean)
        .filter((m, index, self) => self.indexOf(m) === index); // Eliminar duplicados
    }

    let imageData = null;
    
    if (req.file) {
      try {
        // Leer el archivo como Buffer
        const imageBuffer = fs.readFileSync(req.file.path);
        
        // Subir la imagen a Supabase con optimización automática
        try {
          const imageUrl = await uploadToSupabase(imageBuffer, req.file.originalname);
          
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
          return res.status(500).json({ error: 'Error al subir la imagen a Supabase: ' + error.message });
        } finally {
          // Eliminar el archivo temporal
          if (req.file && req.file.path) {
            try {
              fs.unlinkSync(req.file.path);
            } catch (error) {
              console.error('Error al eliminar archivo temporal:', error);
            }
          }
        }
      } catch (error) {
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
    } catch (e) {
      return res.status(400).json({ error: 'Formato de tallas inválido' });
    }
    
    try {
      parsedColores = colores ? JSON.parse(colores) : [];
    } catch (e) {
      return res.status(400).json({ error: 'Formato de colores inválido' });
    }

    // Generar un slug único para el producto
    const slug = generateUniqueSlug(nombre);

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

    const productoGuardado = await nuevoProducto.save();
    
    res.status(201).json(productoGuardado);
  } catch (error) {
    // Asegurarse de eliminar el archivo temporal si existe
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
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
      const imageUrl = await uploadToSupabase(imageBuffer, req.file.originalname);
      
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
      const imageUrl = await uploadToSupabase(imageBuffer, req.file.originalname);
      
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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
