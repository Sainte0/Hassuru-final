const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const productosRoutes = require('./routes/productos');
const stockRoutes = require('./routes/stock');
const adminRoutes = require('./routes/admin');
const tiktokRoutes = require('./routes/tiktoks');
const suscriptoresRoutes = require('./routes/suscriptores');

const app = express();
const PORT = process.env.PORT || 5001;
const PRODUCTION = process.env.PRODUCTION

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/api/productos', productosRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tiktoks', tiktokRoutes);
app.use('/api/suscriptores', suscriptoresRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Backend corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error de conexión a MongoDB:', err);
    process.exit(1);
  });
