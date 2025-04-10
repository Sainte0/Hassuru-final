const axios = require('axios');
const FormData = require('form-data');

/**
 * Uploads an image to ImgBB and returns the URL
 * @param {Buffer} imageBuffer - The image buffer to upload
 * @param {string} apiKey - ImgBB API key
 * @returns {Promise<string>} - The URL of the uploaded image
 */
const uploadToImgBB = async (imageBuffer, apiKey) => {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Create form data
    const formData = new FormData();
    formData.append('image', base64Image);
    
    console.log('Enviando solicitud a ImgBB con API key:', apiKey);
    
    // Make request to ImgBB API
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
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
    }
    throw error;
  }
};

module.exports = {
  uploadToImgBB
}; 