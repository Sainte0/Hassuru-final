const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  }
}, { timestamps: true });

adminSchema.pre('save', async function (next) {
  const admin = this;
  if (admin.isModified('password')) {
    try {
      admin.password = await bcrypt.hash(admin.password, 10);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

adminSchema.methods.compararPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
