# Configuración de Supabase para Hassuru

## 🎯 **Objetivo**
Este proyecto utiliza **exclusivamente Supabase** para el almacenamiento de imágenes, con optimización automática para máxima eficiencia.

## ⚡ **Características**

### **Optimización Automática**
- **Redimensionamiento**: Máximo 800x800 píxeles
- **Compresión PNG**: Nivel 9 (máxima compresión)
- **Calidad**: 60% (balance perfecto calidad/tamaño)
- **Formato**: PNG para transparencia, WebP como respaldo
- **Reducción típica**: 50-80% del tamaño original

### **Metadata Automática**
- **Tamaño**: Se guarda el tamaño optimizado
- **Fuente**: 'optimized', 'original', 'converted'
- **Fecha**: Timestamp de última actualización

## 🔧 **Configuración**

### **Variables de Entorno**
```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
MONGODB_URI=tu_uri_de_mongodb
```

### **Bucket de Supabase**
- **Nombre**: `product-images`
- **Público**: Sí (para acceso directo)
- **Política**: Permitir subida autenticada

## 📁 **Estructura de Archivos**

```
backend/
├── server/
│   ├── utils/
│   │   ├── supabase.js          # Utilidad principal de Supabase
│   │   └── imageOptimizer.js    # Optimización de imágenes
│   ├── routes/
│   │   └── productos.js         # Rutas con optimización automática
│   └── models/
│       └── Producto.js          # Modelo con metadata de imagen
└── SUPABASE_SETUP.md           # Esta documentación
```

## 🚀 **Uso**

### **Crear Producto con Imagen**
```javascript
// La optimización es automática
const response = await fetch('/api/productos', {
  method: 'POST',
  body: formData // Incluye imagen
});
```

### **Actualizar Imagen de Producto**
```javascript
// La optimización es automática
const response = await fetch(`/api/productos/${id}/imagen`, {
  method: 'POST',
  body: formData // Nueva imagen
});
```

## 📊 **Beneficios**

### **Rendimiento**
- ⚡ **Carga más rápida** (imágenes 50-80% más pequeñas)
- 📱 **Mejor experiencia móvil**
- 💰 **Menor uso de ancho de banda**

### **Calidad**
- 🎯 **Transparencia preservada** en PNG
- 🔄 **Formato inteligente** (PNG/WebP)
- 📏 **Dimensiones optimizadas**

### **Mantenimiento**
- 🗑️ **Sin dependencias externas** (ImgBB eliminado)
- 🔧 **Configuración centralizada**
- 📈 **Tracking automático** de optimización

## 🔍 **Monitoreo**

### **Verificar Estado**
```bash
cd backend
node check-transparency-status.js
```

### **Estadísticas de Optimización**
- Tamaño promedio por imagen
- Porcentaje de reducción
- Formato de salida (PNG/WebP)

## 🛠️ **Troubleshooting**

### **Error de Configuración**
```bash
# Verificar variables de entorno
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### **Error de Subida**
- Verificar permisos del bucket
- Verificar tamaño máximo de archivo
- Verificar conectividad a Supabase

## 📈 **Métricas**

### **Tamaños Típicos**
- **Antes**: 500KB - 2MB por imagen
- **Después**: 50KB - 200KB por imagen
- **Reducción**: 70-90% del tamaño original

### **Formatos Soportados**
- **Entrada**: JPG, PNG, WebP, GIF
- **Salida**: PNG (transparencia), WebP (compresión máxima)

---

**¡Configuración completada!** 🎉
Todas las imágenes se optimizan automáticamente al subirse a Supabase. 