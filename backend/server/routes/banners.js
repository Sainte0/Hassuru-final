const express = require('express');
const multer = require('multer');
const Banner = require('../models/Banner');
const { uploadToSupabase, deleteFromSupabase } = require('../utils/supabase');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Configuración de multer para manejar archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  },
});

// Obtener todos los banners activos (público)
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(3);
    
    res.json(banners);
  } catch (error) {
    console.error('Error al obtener banners:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los banners (admin)
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({ order: 1, createdAt: -1 });
    
    res.json(banners);
  } catch (error) {
    console.error('Error al obtener banners:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo banner
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, link, order } = req.body;
    
    if (!title || !req.file) {
      return res.status(400).json({ error: 'Título e imagen son requeridos' });
    }

    // Subir imagen a Supabase
    const fileName = `banner-${Date.now()}-${req.file.originalname}`;
    const imageUrl = await uploadToSupabase(
      req.file.buffer,
      fileName,
      'banners'
    );

    // Crear el banner
    const banner = new Banner({
      title,
      description,
      imageUrl,
      link,
      order: order || 0,
      active: true
    });

    await banner.save();
    
    res.status(201).json(banner);
  } catch (error) {
    console.error('Error al crear banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un banner
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, link, order, active } = req.body;
    
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner no encontrado' });
    }

    // Si se subió una nueva imagen, eliminar la anterior y subir la nueva
    if (req.file) {
      // Extraer el nombre del archivo de la URL actual
      const currentFileName = banner.imageUrl.split('/').pop().split('?')[0];
      
      try {
        // Eliminar imagen anterior
        await deleteFromSupabase(currentFileName, 'banners');
      } catch (deleteError) {
        console.warn('No se pudo eliminar la imagen anterior:', deleteError.message);
      }

      // Subir nueva imagen
      const fileName = `banner-${Date.now()}-${req.file.originalname}`;
      const imageUrl = await uploadToSupabase(
        req.file.buffer,
        fileName,
        'banners'
      );
      
      banner.imageUrl = imageUrl;
    }

    // Actualizar otros campos
    if (title !== undefined) banner.title = title;
    if (description !== undefined) banner.description = description;
    if (link !== undefined) banner.link = link;
    if (order !== undefined) banner.order = order;
    if (active !== undefined) banner.active = active === 'true';

    await banner.save();
    
    res.json(banner);
  } catch (error) {
    console.error('Error al actualizar banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un banner
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner no encontrado' });
    }

    // Eliminar imagen de Supabase
    try {
      const fileName = banner.imageUrl.split('/').pop().split('?')[0];
      await deleteFromSupabase(fileName, 'banners');
    } catch (deleteError) {
      console.warn('No se pudo eliminar la imagen de Supabase:', deleteError.message);
    }

    await Banner.findByIdAndDelete(id);
    
    res.json({ message: 'Banner eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar banner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cambiar orden de los banners
router.put('/reorder', authMiddleware, async (req, res) => {
  try {
    const { banners } = req.body;
    
    if (!Array.isArray(banners)) {
      return res.status(400).json({ error: 'Se requiere un array de banners con sus IDs y órdenes' });
    }

    // Actualizar el orden de cada banner
    for (const { id, order } of banners) {
      await Banner.findByIdAndUpdate(id, { order });
    }

    res.json({ message: 'Orden actualizado correctamente' });
  } catch (error) {
    console.error('Error al reordenar banners:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 