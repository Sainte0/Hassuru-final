const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
  },
  descripcion: {
    type: String,
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
  },
  marca: {
    type: String,
    required: [true, 'La marca del producto es obligatoria'],
  },
  categoria: {
    type: String,
    enum: ['zapatillas', 'ropa', 'accesorios'],
    required: true,
  },
  tallas: [
    {
      talla: {
        type: String,
        required: true,
      },
      precioTalla: {
        type: Number,
        required: true,
      },
    },
  ],
  colores: [
    {
      color: {
        type: String,
        required: true,
      },
    },
  ],
  image: {
    data: {
      type: Buffer,
      required: false,
    },
    contentType: {
      type: String,
      required: false,
    }
  },
  encargo: {
    type: Boolean,
    default: false,
  },
  destacado: {
    type: Boolean,
    default: false,
  },
  destacado_zapatillas: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Producto || mongoose.model('Producto', ProductoSchema);
