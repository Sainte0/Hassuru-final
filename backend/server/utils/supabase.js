const { createClient } = require('@supabase/supabase-js');
const { optimizeImage } = require('./imageOptimizer');

// Configuración de Supabase - Claves hardcodeadas temporalmente
const SUPABASE_URL = 'https://jicmcavibffwjfgzknpq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppY21jYXZpYmZmd2pmZ3prbnBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNzU0MjYsImV4cCI6MjA2NTg1MTQyNn0.b6FtiWe8wsoZkiFedXLdztBxIJ91E4OCT3c0T1BqWI4';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppY21jYXZpYmZmd2pmZ3prbnBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI3NTQyNiwiZXhwIjoyMDY1ODUxNDI2fQ.ZAIfYDPcvC9eDOkq1GfQAiYF53_T9JIVIMw5J9eYEP8';

// Crear cliente de Supabase con service role key para operaciones de administración
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Uploads an image to Supabase Storage and returns the URL
 * @param {Buffer} imageBuffer - The image buffer to upload
 * @param {string} fileName - The name for the file
 * @param {string} bucketName - The bucket name (default: 'product-images')
 * @param {Object} optimizationOptions - Options for image optimization
 * @returns {Promise<string>} - The URL of the uploaded image
 */
const uploadToSupabase = async (imageBuffer, fileName, bucketName = 'product-images', optimizationOptions = {}) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('No se proporcionó una imagen válida');
    }

    if (!fileName) {
      throw new Error('Se requiere un nombre de archivo');
    }

    console.log('Procesando imagen para Supabase Storage...');
    console.log('Bucket:', bucketName);
    console.log('Nombre del archivo:', fileName);
    console.log('Tamaño original:', imageBuffer.length, 'bytes');

    // Optimizar la imagen automáticamente con configuración ultra ligera
    const optimizedBuffer = await optimizeImage(imageBuffer, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 60,
      ...optimizationOptions
    });

    // Determinar el tipo de contenido basado en el formato de la imagen
    const sharp = require('sharp');
    const metadata = await sharp(optimizedBuffer).metadata();
    let contentType = 'image/jpeg';
    let fileExtension = '.jpg';

    if (metadata.format === 'png') {
      contentType = 'image/png';
      fileExtension = '.png';
    } else if (metadata.format === 'webp') {
      contentType = 'image/webp';
      fileExtension = '.webp';
    }

    // Asegurar que el nombre del archivo tenga la extensión correcta
    const baseFileName = fileName.replace(/\.[^/.]+$/, ''); // Remover extensión existente
    const finalFileName = baseFileName + fileExtension;

    // Generar un nombre único para el archivo
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${finalFileName}`;

    console.log('Formato detectado:', metadata.format);
    console.log('Tipo de contenido:', contentType);
    console.log('Nombre final del archivo:', uniqueFileName);
    console.log('Tamaño optimizado:', optimizedBuffer.length, 'bytes');
    console.log('Reducción:', Math.round((1 - optimizedBuffer.length / imageBuffer.length) * 100) + '%');

    // Subir el archivo optimizado a Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, optimizedBuffer, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error al subir a Supabase:', error);
      throw new Error(`Error al subir la imagen a Supabase: ${error.message}`);
    }

    console.log('Archivo subido exitosamente:', data.path);

    // Obtener la URL pública del archivo
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFileName);

    const publicUrl = urlData.publicUrl;
    console.log('URL pública generada:', publicUrl);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Supabase:', error.message);
    throw error;
  }
};

/**
 * Deletes an image from Supabase Storage
 * @param {string} fileName - The name of the file to delete
 * @param {string} bucketName - The bucket name (default: 'product-images')
 * @returns {Promise<boolean>} - True if deletion was successful
 */
const deleteFromSupabase = async (fileName, bucketName = 'product-images') => {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    console.log('Eliminando archivo de Supabase Storage:', fileName);

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error('Error al eliminar de Supabase:', error);
      throw new Error(`Error al eliminar la imagen de Supabase: ${error.message}`);
    }

    console.log('Archivo eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('Error deleting from Supabase:', error.message);
    throw error;
  }
};

/**
 * Lists all files in a bucket
 * @param {string} bucketName - The bucket name (default: 'product-images')
 * @returns {Promise<Array>} - Array of file objects
 */
const listFiles = async (bucketName = 'product-images') => {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .list();

    if (error) {
      throw new Error(`Error al listar archivos: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error listing files:', error.message);
    throw error;
  }
};

module.exports = {
  uploadToSupabase,
  deleteFromSupabase,
  listFiles
}; 