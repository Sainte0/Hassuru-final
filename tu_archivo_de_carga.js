const uploadImage = async (image, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Tu código actual de carga de imagen
      const response = await fetch('https://api.imgbb.com/1/upload', {
        // ... tus opciones de fetch
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`Error al subir la imagen después de ${maxRetries} intentos: ${error.message}`);
      }
      // Esperar antes de reintentar (tiempo exponencial)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

try {
  const response = await uploadImage(image);
  console.log('Respuesta completa:', response);
} catch (error) {
  console.error('Error detallado:', {
    mensaje: error.message,
    código: error.code,
    timestamp: new Date().toISOString(),
    detalles: error
  });
} 