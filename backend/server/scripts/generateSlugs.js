/**
 * Script para generar slugs para todos los productos existentes
 * 
 * Uso:
 * node scripts/generateSlugs.js
 */

const mongoose = require('mongoose');
const Producto = require('../models/Producto');
const { generateUniqueSlug } = require('../utils/slugify');
require('dotenv').config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hassuru', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => {
  console.error('Error al conectar a MongoDB:', err);
  process.exit(1);
});

async function generateSlugsForAllProducts() {
  try {
    console.log('Iniciando generación de slugs para productos existentes...');
    
    // Obtener todos los productos sin slug
    const productos = await Producto.find({ slug: { $exists: false } });
    console.log(`Se encontraron ${productos.length} productos sin slug`);
    
    // Generar slugs para cada producto
    let updatedCount = 0;
    for (const producto of productos) {
      const slug = generateUniqueSlug(producto.nombre, producto._id.toString());
      
      // Actualizar el producto con el nuevo slug
      await Producto.findByIdAndUpdate(producto._id, { slug });
      updatedCount++;
      
      if (updatedCount % 10 === 0) {
        console.log(`Progreso: ${updatedCount}/${productos.length} productos actualizados`);
      }
    }
    
    console.log(`Se actualizaron ${updatedCount} productos con slugs`);
    
    // Verificar si hay productos con nombres duplicados que podrían causar conflictos
    const allProductos = await Producto.find();
    const slugCounts = {};
    
    allProductos.forEach(producto => {
      if (producto.slug) {
        slugCounts[producto.slug] = (slugCounts[producto.slug] || 0) + 1;
      }
    });
    
    const duplicateSlugs = Object.entries(slugCounts)
      .filter(([_, count]) => count > 1)
      .map(([slug]) => slug);
    
    if (duplicateSlugs.length > 0) {
      console.log(`ADVERTENCIA: Se encontraron ${duplicateSlugs.length} slugs duplicados:`);
      duplicateSlugs.forEach(slug => {
        console.log(`- ${slug}`);
      });
    } else {
      console.log('No se encontraron slugs duplicados');
    }
    
    console.log('Proceso completado');
  } catch (error) {
    console.error('Error al generar slugs:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    mongoose.connection.close()
      .then(() => console.log('Conexión a MongoDB cerrada'))
      .catch(err => console.error('Error al cerrar la conexión:', err));
  }
}

// Ejecutar la función
generateSlugsForAllProducts(); 