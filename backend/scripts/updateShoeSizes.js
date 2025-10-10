const mongoose = require('mongoose');
require('dotenv').config();

// Tabla de conversión de talles
const sizeMappingTable = {
  '4 usa | 35 arg': '4 usa | 5.5 W | 35 arg | 23 cm',
  '4.5 usa | 35.5 arg': '4.5 usa | 6 W | 35.5 arg | 23.5 cm',
  '5 usa | 36 arg': '5 usa | 6.5 W | 36 arg | 23.5 cm',
  '5.5 usa | 37 arg': '5.5 usa | 7 W | 37 arg | 24 cm',
  '6 usa | 37.5 arg': '6 usa | 7.5 W | 37.5 arg | 24 cm',
  '6.5 usa | 38 arg': '6.5 usa | 8 W | 38 arg | 24.5 cm',
  '7 usa | 39 arg': '7 usa | 8.5 W | 39 arg | 25 cm',
  '7.5 usa | 39.5 arg': '7.5 usa | 9 W | 39.5 arg | 25.5 cm',
  '8 usa | 40 arg': '8 usa | 9.5 W | 40 arg | 26 cm',
  '8.5 usa | 41 arg': '8.5 usa | 10 W | 41 arg | 26.5 cm',
  '9 usa | 41.5 arg': '9 usa | 10.5 W | 41.5 arg | 27 cm',
  '9.5 usa | 42 arg': '9.5 usa | 11 W | 42 arg | 27.5 cm',
  '10 usa | 43 arg': '10 usa | 11.5 W | 43 arg | 28 cm',
  '10.5 usa | 43.5 arg': '10.5 usa | 12 W | 43.5 arg | 28.5 cm',
  '11 usa | 44 arg': '11 usa | 44 arg | 29 cm',
  '11.5 usa | 44.5 arg': '11.5 usa | 44.5 arg | 29.5 cm',
  '12 usa | 45 arg': '12 usa | 45 arg | 30 cm',
  '12.5 usa | 45.5 arg': '12.5 usa | 46 arg | 30.5 cm',
  '13 usa | 46.5 arg': '13 usa | 46.5 arg | 31 cm',
  // Variaciones adicionales que puedan existir
  '3.5 usa | 34.5 arg': '3.5 usa | 5 W | 34.5 arg | 22.5 cm',
  '13.5 usa | 47 arg': '13.5 usa | 47 arg | 31.5 cm',
  '14 usa | 47.5 arg': '14 usa | 47.5 arg | 32 cm'
};

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ssanto2004_db_user:Sainte0@cursos.bna2brn.mongodb.net/';

async function updateShoeSizes() {
  console.log('🚀 Iniciando actualización de talles de zapatillas...\n');
  
  try {
    // Conectar a MongoDB
    console.log('📦 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB\n');

    // Obtener el modelo de Producto
    const Producto = mongoose.model('Producto', new mongoose.Schema({
      nombre: String,
      categoria: String,
      tallas: [{
        talla: String,
        stock: Number,
        precioTalla: Number,
        _id: mongoose.Schema.Types.ObjectId
      }]
    }, { strict: false }));

    // Buscar todos los productos de zapatillas
    console.log('🔍 Buscando productos de zapatillas...');
    const zapatillas = await Producto.find({ categoria: 'zapatillas' });
    console.log(`✅ Encontrados ${zapatillas.length} productos de zapatillas\n`);

    let totalProductosActualizados = 0;
    let totalTallasActualizadas = 0;

    // Actualizar cada producto
    for (const producto of zapatillas) {
      let productoModificado = false;
      
      if (producto.tallas && producto.tallas.length > 0) {
        for (let i = 0; i < producto.tallas.length; i++) {
          const tallaActual = producto.tallas[i].talla;
          const tallaNueva = sizeMappingTable[tallaActual];
          
          if (tallaNueva && tallaNueva !== tallaActual) {
            console.log(`   📝 ${producto.nombre}`);
            console.log(`      "${tallaActual}" → "${tallaNueva}"`);
            producto.tallas[i].talla = tallaNueva;
            productoModificado = true;
            totalTallasActualizadas++;
          }
        }
        
        if (productoModificado) {
          await producto.save();
          totalProductosActualizados++;
          console.log(`   ✅ Guardado\n`);
        }
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ¡Actualización completada!');
    console.log(`   Productos actualizados: ${totalProductosActualizados}`);
    console.log(`   Tallas actualizadas: ${totalTallasActualizadas}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (totalProductosActualizados === 0) {
      console.log('ℹ️  No se encontraron tallas para actualizar.');
      console.log('   Esto puede significar que:');
      console.log('   - Ya se actualizaron previamente');
      console.log('   - No hay productos de zapatillas en la BD');
      console.log('   - Las tallas ya tienen el formato nuevo\n');
    }

  } catch (error) {
    console.error('\n❌ Error durante la actualización:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
    process.exit(0);
  }
}

// Ejecutar el script
updateShoeSizes();

