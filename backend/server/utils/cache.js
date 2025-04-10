/**
 * Simple in-memory cache utility
 */

const NodeCache = require('node-cache');

// Crear una instancia de caché con un TTL de 5 minutos por defecto
const cache = new NodeCache({ stdTTL: 300 });

// Middleware para cachear las respuestas
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.json(cachedResponse);
      return;
    }

    res.originalJson = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.originalJson(body);
    };
    next();
  };
};

module.exports = {
  cache,
  cacheMiddleware
}; 