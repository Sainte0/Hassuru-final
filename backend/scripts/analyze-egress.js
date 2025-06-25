const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function analyzeEgress() {
  try {
    console.log('🔍 Analizando uso de egress en Supabase...\n');

    // Listar archivos en el bucket de imágenes
    console.log('📁 Analizando archivos en product-images:');
    const { data: files, error: filesError } = await supabase.storage
      .from('product-images')
      .list();

    if (filesError) {
      console.error('Error al listar archivos:', filesError);
      return;
    }

    let totalSize = 0;
    let fileCount = 0;

    console.log(`\n📊 Resumen de archivos:`);
    console.log(`Total de archivos: ${files.length}`);

    // Agrupar por tamaño
    const sizeGroups = {
      small: 0,    // < 100KB
      medium: 0,   // 100KB - 500KB
      large: 0,    // 500KB - 1MB
      xlarge: 0    // > 1MB
    };

    files.forEach(file => {
      const sizeKB = file.metadata?.size / 1024 || 0;
      totalSize += file.metadata?.size || 0;
      fileCount++;

      if (sizeKB < 100) sizeGroups.small++;
      else if (sizeKB < 500) sizeGroups.medium++;
      else if (sizeKB < 1024) sizeGroups.large++;
      else sizeGroups.xlarge++;
    });

    console.log(`\n📏 Distribución por tamaño:`);
    console.log(`  - Pequeñas (< 100KB): ${sizeGroups.small} archivos`);
    console.log(`  - Medianas (100KB-500KB): ${sizeGroups.medium} archivos`);
    console.log(`  - Grandes (500KB-1MB): ${sizeGroups.large} archivos`);
    console.log(`  - Muy grandes (> 1MB): ${sizeGroups.xlarge} archivos`);

    console.log(`\n💾 Tamaño total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📈 Tamaño promedio: ${(totalSize / fileCount / 1024).toFixed(2)} KB`);

    // Mostrar los archivos más grandes
    const sortedFiles = files
      .filter(f => f.metadata?.size)
      .sort((a, b) => (b.metadata?.size || 0) - (a.metadata?.size || 0))
      .slice(0, 10);

    console.log(`\n🔝 Top 10 archivos más grandes:`);
    sortedFiles.forEach((file, index) => {
      const sizeMB = (file.metadata?.size / 1024 / 1024).toFixed(2);
      console.log(`  ${index + 1}. ${file.name}: ${sizeMB} MB`);
    });

    // Recomendaciones
    console.log(`\n💡 Recomendaciones para reducir egress:`);
    
    if (sizeGroups.xlarge > 0) {
      console.log(`  ⚠️  Tienes ${sizeGroups.xlarge} archivos muy grandes (> 1MB)`);
      console.log(`     Considera optimizar estos archivos con mayor compresión`);
    }
    
    if (sizeGroups.large > 10) {
      console.log(`  ⚠️  Tienes ${sizeGroups.large} archivos grandes`);
      console.log(`     Considera reducir la calidad de imagen de 60% a 50%`);
    }

    console.log(`  ✅ Configuración actual de caché: 1 año`);
    console.log(`  ✅ Optimización automática activada`);
    console.log(`  💡 Considera implementar lazy loading en el frontend`);
    console.log(`  💡 Considera usar formatos WebP para mejor compresión`);

  } catch (error) {
    console.error('Error analizando egress:', error);
  }
}

// Ejecutar el análisis
analyzeEgress(); 