const mongoose = require('mongoose');

const ProductoPedidoSchema = new mongoose.Schema({
  productoId: { type: String, required: true },
  nombre: String,
  cantidad: Number,
  precio: Number,
  imagen: String,
  talle: String
});

const OrderSchema = new mongoose.Schema({
  productos: [ProductoPedidoSchema],
  datosPersonales: {
    nombre: String,
    email: String,
    telefono: String
  },
  envio: {
    tipo: { type: String, enum: ['envio', 'retiro'], required: true },
    direccion: String
  },
  pago: { type: String, enum: ['usdt', 'transferencia', 'efectivo'], required: true },
  estado: { type: String, enum: ['pendiente', 'pagado', 'enviado', 'recibido', 'cancelado'], default: 'pendiente' },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema); 