const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const productosRoutes = require('./routes/productos');
const stockRoutes = require('./routes/stock');
const adminRoutes = require('./routes/admin');
const tiktokRoutes = require('./routes/tiktoks');
const suscriptoresRoutes = require('./routes/suscriptores');
const imagesRoutes = require('./routes/images');
const ordersRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0'; // Use 0.0.0.0 to listen on all network interfaces

// Verificar variables de entorno críticas
console.log('Verificando variables de entorno...');
console.log('IMGBB_API_KEY disponible:', !!process.env.FALLBACK_API_KEY);
console.log('MONGODB_URI disponible:', !!process.env.MONGODB_URI);

// No es necesario verificar IMGBB_API_KEY ya que ahora usamos una hardcodeada como respaldo

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/api/productos', productosRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tiktoks', tiktokRoutes);
app.use('/api/suscriptores', suscriptoresRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/orders', ordersRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, HOST, () => {
      console.log(`Backend corriendo en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error de conexión a MongoDB:', err);
    process.exit(1);
  });
