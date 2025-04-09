/**
 * Script para ejecutar la migración de slugs
 * 
 * Uso:
 * node scripts/runMigration.js
 */

const { exec } = require('child_process');
const path = require('path');

console.log('Iniciando migración de slugs...');

// Ejecutar el script de generación de slugs
const generateSlugsScript = path.join(__dirname, 'generateSlugs.js');

exec(`node ${generateSlugsScript}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error al ejecutar el script: ${error}`);
    return;
  }
  
  console.log(stdout);
  
  if (stderr) {
    console.error(`Errores durante la ejecución: ${stderr}`);
  }
  
  console.log('Migración completada');
}); 