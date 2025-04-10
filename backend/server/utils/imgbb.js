const axios = require('axios');
const FormData = require('form-data');

// API key hardcodeada como respaldo
const FALLBACK_API_KEY = '7c6b4d2e62f314d959eef4a6384b8da4';

/**
 * Uploads an image to ImgBB and returns the URL
 * @param {Buffer} imageBuffer - The image buffer to upload
 * @param {string} apiKey - ImgBB API key
 * @returns {Promise<string>} - The URL of the uploaded image
 */
const uploadToImgBB = async (imageBuffer, apiKey) => {
  try {
    // Usar la API key proporcionada o la hardcodeada como respaldo
    const finalApiKey = apiKey || FALLBACK_API_KEY;
    
    if (!finalApiKey) {
      throw new Error('ImgBB API key is required');
    }

    console.log('Usando API key:', finalApiKey.substring(0, 5) + '...');

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Create form data
    const formData = new URLSearchParams();
    formData.append('key', finalApiKey);
    formData.append('image', base64Image);
    
    console.log('Enviando solicitud a ImgBB...');
    
    // Make request to ImgBB API
    const response = await axios.post(
      'https://api.imgbb.com/1/upload',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('Respuesta de ImgBB:', JSON.stringify(response.data));
    
    // Check if upload was successful
    if (response.data && response.data.success) {
      return response.data.data.url;
    } else {
      console.error('ImgBB API error:', response.data);
      throw new Error('Failed to upload image to ImgBB');
    }
  } catch (error) {
    console.error('Error uploading to ImgBB:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

module.exports = {
  uploadToImgBB
}; 