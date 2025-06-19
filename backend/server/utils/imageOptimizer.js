const sharp = require('sharp');

/**
 * Optimiza una imagen antes de subirla a Supabase
 * @param {Buffer} imageBuffer - El buffer de la imagen original
 * @param {Object} options - Opciones de optimización
 * @returns {Promise<Buffer>} - El buffer de la imagen optimizada
 */
const optimizeImage = async (imageBuffer, options = {}) => {
  try {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 80
    } = options;

    console.log('Optimizando imagen...');
    console.log('Tamaño original:', imageBuffer.length, 'bytes');

    // Obtener metadatos de la imagen
    const metadata = await sharp(imageBuffer).metadata();
    console.log('Dimensiones originales:', metadata.width, 'x', metadata.height);
    console.log('Formato original:', metadata.format);

    // Determinar el formato de salida basado en el formato original
    let outputFormat = 'jpeg';
    let outputOptions = { quality };

    // Si la imagen original es PNG, mantener PNG para preservar transparencia
    if (metadata.format === 'png') {
      outputFormat = 'png';
      outputOptions = { 
        quality,
        compressionLevel: 9, // Máxima compresión PNG
        adaptiveFiltering: true
      };
      console.log('Detectado PNG - preservando transparencia');
    } else if (metadata.format === 'webp') {
      outputFormat = 'webp';
      outputOptions = { quality };
      console.log('Detectado WebP - preservando transparencia');
    } else {
      console.log('Usando JPEG para optimización');
    }

    // Optimizar la imagen
    let optimizedImage = sharp(imageBuffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });

    // Aplicar formato y calidad según el tipo de imagen
    if (outputFormat === 'jpeg') {
      optimizedImage = optimizedImage.jpeg(outputOptions);
    } else if (outputFormat === 'png') {
      optimizedImage = optimizedImage.png(outputOptions);
    } else if (outputFormat === 'webp') {
      optimizedImage = optimizedImage.webp(outputOptions);
    }

    const optimizedBuffer = await optimizedImage.toBuffer();
    
    console.log('Tamaño optimizado:', optimizedBuffer.length, 'bytes');
    console.log('Formato de salida:', outputFormat);
    console.log('Reducción:', Math.round((1 - optimizedBuffer.length / imageBuffer.length) * 100) + '%');

    return optimizedBuffer;
  } catch (error) {
    console.error('Error optimizando imagen:', error);
    // Si falla la optimización, devolver la imagen original
    return imageBuffer;
  }
};

/**
 * Genera diferentes tamaños de una imagen para diferentes usos
 * @param {Buffer} imageBuffer - El buffer de la imagen original
 * @returns {Promise<Object>} - Objeto con diferentes tamaños de imagen
 */
const generateImageVariants = async (imageBuffer) => {
  try {
    const variants = {};

    // Obtener metadatos para determinar el formato
    const metadata = await sharp(imageBuffer).metadata();
    const isTransparent = metadata.format === 'png' || metadata.format === 'webp';
    const outputFormat = isTransparent ? 'png' : 'jpeg';

    // Thumbnail (150x150)
    variants.thumbnail = await sharp(imageBuffer)
      .resize(150, 150, { fit: 'cover' })
      [outputFormat]({ quality: 70 })
      .toBuffer();

    // Medium (600x600)
    variants.medium = await sharp(imageBuffer)
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      [outputFormat]({ quality: 80 })
      .toBuffer();

    // Large (1200x1200)
    variants.large = await sharp(imageBuffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      [outputFormat]({ quality: 85 })
      .toBuffer();

    return variants;
  } catch (error) {
    console.error('Error generando variantes de imagen:', error);
    throw error;
  }
};

module.exports = {
  optimizeImage,
  generateImageVariants
}; 