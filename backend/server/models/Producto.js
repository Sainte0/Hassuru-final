const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  descripcion: {
    type: String,
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
  },
  marca: {
    type: [String],
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
    url: {
      type: String,
      required: false,
    },
    size: {
      type: Number,
      required: false,
    },
    source: {
      type: String,
      enum: ['original', 'optimized', 'converted'],
      required: false,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
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

ProductoSchema.index({ categoria: 1, destacado: 1 });

module.exports = mongoose.models.Producto || mongoose.model('Producto', ProductoSchema);
