import React, { useState } from "react";
import Link from "next/link";
import SEOHead from "../../components/SEOHead";

const LATAM_PREFIXES = [
  { code: '+54', country: 'Argentina' },
  { code: '+55', country: 'Brasil' },
  { code: '+56', country: 'Chile' },
  { code: '+57', country: 'Colombia' },
  { code: '+52', country: 'México' },
  { code: '+51', country: 'Perú' },
  { code: '+58', country: 'Venezuela' },
  { code: '+53', country: 'Cuba' },
  { code: '+507', country: 'Panamá' },
  { code: '+598', country: 'Uruguay' },
  { code: '+593', country: 'Ecuador' },
  { code: '+595', country: 'Paraguay' },
  { code: '+502', country: 'Guatemala' },
  { code: '+504', country: 'Honduras' },
  { code: '+505', country: 'Nicaragua' },
  { code: '+506', country: 'Costa Rica' },
  { code: '+503', country: 'El Salvador' },
  { code: '+592', country: 'Guyana' },
  { code: '+592', country: 'Surinam' },
  { code: '+509', country: 'Haití' },
  { code: '+1', country: 'Rep. Dominicana' }
];

const pasos = ['Productos', 'Datos personales', 'Pago'];

const tiposPago = [
  { value: 'usdt', label: 'USDT/Crypto' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'efectivo', label: 'Efectivo' }
];

const tallesRopa = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const tallesZapatillas = [
  { us: '3.5', ar: '34.5' }, { us: '4', ar: '35' }, { us: '4.5', ar: '35.5' },
  { us: '5', ar: '36' }, { us: '5.5', ar: '37' }, { us: '6', ar: '37.5' },
  { us: '6.5', ar: '38' }, { us: '7', ar: '39' }, { us: '7.5', ar: '39.5' },
  { us: '8', ar: '40' }, { us: '8.5', ar: '41' }, { us: '9', ar: '41.5' },
  { us: '9.5', ar: '42' }, { us: '10', ar: '43' }, { us: '10.5', ar: '43.5' },
  { us: '11', ar: '44' }, { us: '11.5', ar: '44.5' }, { us: '12', ar: '45' },
  { us: '12.5', ar: '45.5' }, { us: '13', ar: '46.5' }
];

const images = [
  '/images/encargos/1.jpeg',
  '/images/encargos/2.jpeg',
  '/images/encargos/3.jpeg',
  '/images/encargos/4.jpeg',
  '/images/encargos/5.jpeg',
  '/images/encargos/6.jpeg'
];

export default function Encargos() {
  const [step, setStep] = useState(0);
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({ 
    nombre: '', 
    link: '', 
    detalles: '', 
    talle: '', 
    color: '',
    tipoProducto: 'ropa'
  });
  const [datos, setDatos] = useState({ 
    nombre: '', 
    apellido: '',
    email: '', 
    dni: ''
  });
  const [telefono, setTelefono] = useState({ prefijo: '+54', numero: '' });
  const [envio, setEnvio] = useState({ 
    tipo: 'retiro', 
    direccion: 'Córdoba Capital'
  });
  const [pago, setPago] = useState('usdt');
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  
  // Estados para validaciones
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddProducto = () => {
    if (!nuevoProducto.nombre) return;
    setProductos([...productos, nuevoProducto]);
    setNuevoProducto({ nombre: '', link: '', detalles: '', talle: '', color: '', tipoProducto: 'ropa' });
  };

  const handleRemoveProducto = idx => {
    setProductos(productos.filter((_, i) => i !== idx));
  };

  // Función de validación
  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) return 'El nombre solo puede contener letras';
        return '';
      
      case 'apellido':
        if (!value.trim()) return 'El apellido es obligatorio';
        if (value.trim().length < 2) return 'El apellido debe tener al menos 2 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) return 'El apellido solo puede contener letras';
        return '';
      
      case 'email':
        if (!value.trim()) return 'El email es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Ingresa un email válido';
        return '';
      
      case 'dni':
        if (!value.trim()) return 'El DNI es obligatorio';
        if (!/^\d{8}$/.test(value.replace(/\D/g, ''))) return 'El DNI debe tener exactamente 8 números';
        return '';
      
      case 'telefono':
        if (!value.trim()) return 'El teléfono es obligatorio';
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length < 8) return 'El teléfono debe tener al menos 8 dígitos';
        if (cleanPhone.length > 15) return 'El teléfono no puede tener más de 15 dígitos';
        return '';
      
      default:
        return '';
    }
  };

  // Función para manejar cambios en los campos
  const handleFieldChange = (name, value) => {
    let processedValue = value;
    
    // Procesamiento específico por campo
    switch (name) {
      case 'dni':
        // Solo permitir números y limitar a 8 dígitos
        processedValue = value.replace(/\D/g, '').slice(0, 8);
        break;
      
      case 'telefono':
        // Limpiar formato y solo permitir números
        processedValue = value.replace(/\D/g, '');
        break;
      
      case 'nombre':
      case 'apellido':
        // Capitalizar primera letra
        processedValue = value.charAt(0).toUpperCase() + value.slice(1);
        break;
    }

    // Actualizar el estado
    if (name === 'telefono') {
      setTelefono(prev => ({ ...prev, numero: processedValue }));
    } else {
      setDatos(prev => ({ ...prev, [name]: processedValue }));
    }

    // Validar el campo
    const fieldError = validateField(name, processedValue);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  // Función para manejar el blur (cuando el usuario sale del campo)
  const handleFieldBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleChangeDatos = e => {
    handleFieldChange(e.target.name, e.target.value);
  };

  const handleChangeProducto = e => {
    const { name, value } = e.target;
    setNuevoProducto({ ...nuevoProducto, [name]: value });
    if (name === 'tipoProducto') {
      setNuevoProducto(prev => ({ ...prev, [name]: value, talle: '' }));
    }
  };


  const handleNext = () => {
    if (step === 0 && productos.length === 0) {
      setError('Debes agregar al menos un producto');
      return;
    }
    if (step === 1) {
      // Validar todos los campos de datos personales
      const newErrors = {};
      newErrors.nombre = validateField('nombre', datos.nombre);
      newErrors.apellido = validateField('apellido', datos.apellido);
      newErrors.email = validateField('email', datos.email);
      newErrors.dni = validateField('dni', datos.dni);
      newErrors.telefono = validateField('telefono', telefono.numero);
      
      setErrors(newErrors);
      
      // Marcar todos los campos como tocados
      setTouched({
        nombre: true,
        apellido: true,
        email: true,
        dni: true,
        telefono: true
      });
      
      // Verificar si hay errores
      if (Object.values(newErrors).some(error => error !== '')) {
        setError('Completa todos los campos obligatorios correctamente');
        return;
      }
    }
    setError('');
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  // Función para generar mensaje de WhatsApp para encargos
  const generateWhatsAppMessage = () => {
    const telefonoCompleto = telefono.prefijo + telefono.numero;
    const nombreCompleto = `${datos.nombre} ${datos.apellido}`;
    
    let mensaje = `¡Hola! Hice este encargo en Hassuru:\n\n`;
    mensaje += `👤 *Datos del cliente:*\n`;
    mensaje += `• Nombre: ${nombreCompleto}\n`;
    mensaje += `• Email: ${datos.email}\n`;
    mensaje += `• Teléfono: ${telefonoCompleto}\n`;
    mensaje += `• DNI: ${datos.dni}\n\n`;
    
    mensaje += `🛍️ *Productos a encargar:*\n`;
    productos.forEach((producto, index) => {
      mensaje += `${index + 1}. ${producto.nombre}`;
      if (producto.talle) mensaje += ` (Talle: ${producto.talle})`;
      if (producto.color) mensaje += ` (Color: ${producto.color})`;
      mensaje += ` - ${producto.tipoProducto}`;
      if (producto.detalles) mensaje += `\n   Detalles: ${producto.detalles}`;
      if (producto.link) mensaje += `\n   Link: ${producto.link}`;
      mensaje += `\n`;
    });
    
    mensaje += `\n📦 *Retiro en Córdoba Capital*`;
    mensaje += `\n💳 *Método de pago: ${pago === 'usdt' ? 'USDT/Crypto' : pago === 'transferencia' ? 'Transferencia Bancaria' : 'Efectivo'}*`;
    mensaje += `\n⏰ *Tiempo estimado: 20 días*`;
    
    return encodeURIComponent(mensaje);
  };

  const handleSubmit = async () => {
    setEnviando(true);
    setError('');
    setExito(false);
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos: productos.map(p => ({ 
            productoId: `encargo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            nombre: p.nombre,
            cantidad: 1,
            precio: 0,
            imagen: '',
            talle: p.talle,
            encargo: true,
            detalles: p.detalles,
            link: p.link,
            color: p.color,
            tipoProducto: p.tipoProducto
          })),
          datosPersonales: {
            nombre: `${datos.nombre} ${datos.apellido}`,
            email: datos.email,
            telefono: telefono.prefijo + telefono.numero,
            dni: datos.dni
          },
          envio: { 
            tipo: 'retiro', 
            direccion: 'Córdoba Capital'
          },
          pago: pago,
        })
      });
      if (!res.ok) throw new Error('Error al enviar el encargo');
      
      // Abrir WhatsApp con el mensaje del encargo
      const whatsappMessage = generateWhatsAppMessage();
      const whatsappUrl = `https://wa.me/543512595858?text=${whatsappMessage}`;
      window.open(whatsappUrl, '_blank');
      
      setExito(true);
      setProductos([]);
      setDatos({ nombre: '', apellido: '', email: '', dni: '' });
      setTelefono({ prefijo: '+54', numero: '' });
      setEnvio({ tipo: 'retiro', direccion: 'Córdoba Capital' });
      setPago('usdt');
      setStep(0);
      setErrors({});
      setTouched({});
    } catch (e) {
      setError('Error al enviar el encargo. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="Encargos Personalizados - Hassuru | Ropa y Zapatillas a Pedido"
        description="¿No encontrás lo que buscás? Hacé tu encargo personalizado en Hassuru. Zapatillas, ropa, tecnología y accesorios. Envío a todo Argentina."
        keywords="encargos, personalizado, pedido, ropa, zapatillas, sneakers, marca, Argentina, online, tienda"
        url="https://hassuru.ar/encargos"
      />
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-dark-bg py-8 transition-colors duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-dark-bg rounded-2xl shadow-2xl p-4 sm:p-8 border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 text-center text-gray-900 dark:text-white tracking-tight">Encarga lo que quieras</h1>
        
        {/* Carousel */}
        <div className="mb-6 relative">
          <div className="overflow-hidden rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800">
            <img 
              src={images[currentImage]} 
              alt={`Encargo ${currentImage + 1}`} 
              className="w-full h-80 sm:h-96 md:h-[500px] lg:h-[600px] object-contain transition-transform duration-500"
            />
          </div>
          <button 
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all text-xl font-bold shadow-lg"
            aria-label="Imagen anterior"
          >
            ‹
          </button>
          <button 
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all text-xl font-bold shadow-lg"
            aria-label="Siguiente imagen"
          >
            ›
          </button>
          <div className="flex justify-center mt-6 space-x-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-4 h-4 rounded-full transition-all ${
                  index === currentImage ? 'bg-blue-600 scale-110' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
                aria-current={index === currentImage ? 'true' : 'false'}
              />
            ))}
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">Desde zapatillas y ropa hasta tecnología y accesorios.</p>

        {/* Pasos */}
        <div className="mb-6 sm:mb-8 flex space-x-2">
          {pasos.map((p, i) => (
            <div key={i} className={`flex-1 text-center py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-base transition-all duration-200 ${i === step ? 'bg-black dark:bg-blue-600 text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{p}</div>
          ))}
        </div>

        {/* Productos añadidos - Siempre visible */}
        {productos.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Productos a encargar ({productos.length})</h2>
            <div className="space-y-3 overflow-x-auto">
              {productos.map((p, i) => (
                <div key={i} className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white break-words">{p.nombre}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {p.talle && `Talle: ${p.talle}`}
                      {p.color && ` | Color: ${p.color}`}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{p.detalles}</div>
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline text-sm">Ver link</a>
                    )}
                  </div>
                  <button onClick={() => handleRemoveProducto(i)} className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded">Eliminar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 0: Formulario de productos */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 shadow flex flex-col gap-3">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Producto a encargar</h2>
              <input name="nombre" value={nuevoProducto.nombre} onChange={handleChangeProducto} placeholder="Nombre del producto*" className="w-full border border-gray-300 focus:border-blue-500 rounded-lg p-3 text-base bg-white dark:bg-gray-600 text-gray-900 dark:text-white" required />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select name="tipoProducto" value={nuevoProducto.tipoProducto} onChange={handleChangeProducto} className="border border-gray-300 focus:border-blue-500 rounded-lg p-3 text-base bg-white dark:bg-gray-600 text-gray-900 dark:text-white">
                  <option value="ropa">Ropa</option>
                  <option value="zapatillas">Zapatillas</option>
                  <option value="accesorios">Accesorios</option>
                  <option value="tecnologia">Tecnología</option>
                </select>
                
                {nuevoProducto.tipoProducto !== 'accesorios' && nuevoProducto.tipoProducto !== 'tecnologia' && (
                  <select name="talle" value={nuevoProducto.talle} onChange={handleChangeProducto} className="border border-gray-300 focus:border-blue-500 rounded-lg p-3 text-base bg-white dark:bg-gray-600 text-gray-900 dark:text-white">
                    <option value="">Seleccionar talle</option>
                    {nuevoProducto.tipoProducto === 'ropa' ? (
                      tallesRopa.map(talle => (
                        <option key={talle} value={talle}>{talle}</option>
                      ))
                    ) : (
                      tallesZapatillas.map(talle => (
                        <option key={talle.us} value={`${talle.us} US / ${talle.ar} AR`}>
                          {talle.us} US / {talle.ar} AR
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>
              
              <input name="color" value={nuevoProducto.color} onChange={handleChangeProducto} placeholder="Color (opcional)" className="w-full border border-gray-300 focus:border-blue-500 rounded-lg p-3 text-base bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
              <input name="link" value={nuevoProducto.link} onChange={handleChangeProducto} placeholder="Link (opcional)" className="w-full border border-gray-300 focus:border-blue-500 rounded-lg p-3 text-base bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
              <textarea name="detalles" value={nuevoProducto.detalles} onChange={handleChangeProducto} placeholder="Detalles adicionales (opcional)" className="w-full border border-gray-300 focus:border-blue-500 rounded-lg p-3 text-base bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
              <button type="button" onClick={handleAddProducto} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all text-base mt-2">
                Agregar producto
              </button>
            </div>
          </div>
        )}

        {/* Paso 1: Datos personales */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <input 
                name="nombre" 
                value={datos.nombre} 
                onChange={handleChangeDatos} 
                onBlur={() => handleFieldBlur('nombre')}
                placeholder="Nombre*" 
                className={`w-full border rounded-lg p-3 text-base bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors ${
                  errors.nombre && touched.nombre
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required 
              />
              {errors.nombre && touched.nombre && (
                <p className="text-red-500 text-sm">{errors.nombre}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <input 
                name="apellido" 
                value={datos.apellido} 
                onChange={handleChangeDatos} 
                onBlur={() => handleFieldBlur('apellido')}
                placeholder="Apellido*" 
                className={`w-full border rounded-lg p-3 text-base bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors ${
                  errors.apellido && touched.apellido
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required 
              />
              {errors.apellido && touched.apellido && (
                <p className="text-red-500 text-sm">{errors.apellido}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <input 
                name="email" 
                value={datos.email} 
                onChange={handleChangeDatos} 
                onBlur={() => handleFieldBlur('email')}
                placeholder="Email*" 
                type="email" 
                className={`w-full border rounded-lg p-3 text-base bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors ${
                  errors.email && touched.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required 
              />
              {errors.email && touched.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex">
                <select 
                  className={`border rounded-lg p-3 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors ${
                    errors.telefono && touched.telefono
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  value={telefono.prefijo} 
                  onChange={e => setTelefono(t => ({ ...t, prefijo: e.target.value }))}
                >
                  {LATAM_PREFIXES.map(p => <option key={p.code} value={p.code}>{p.country} ({p.code})</option>)}
                </select>
                <input 
                  type="tel"
                  name="telefono"
                  className={`flex-1 border rounded-lg p-3 bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
                    errors.telefono && touched.telefono
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Teléfono (ej: 3513341366)" 
                  value={telefono.numero} 
                  onChange={e => handleFieldChange('telefono', e.target.value)}
                  onBlur={() => handleFieldBlur('telefono')}
                />
              </div>
              {errors.telefono && touched.telefono && (
                <p className="text-red-500 text-sm">{errors.telefono}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <input 
                name="dni" 
                value={datos.dni} 
                onChange={handleChangeDatos} 
                onBlur={() => handleFieldBlur('dni')}
                placeholder="DNI (8 números)*" 
                className={`w-full border rounded-lg p-3 text-base bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors ${
                  errors.dni && touched.dni
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required 
              />
              {errors.dni && touched.dni && (
                <p className="text-red-500 text-sm">{errors.dni}</p>
              )}
            </div>
          </div>
        )}


        {/* Paso 2: Pago */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Método de pago</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${pago === 'usdt' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`} onClick={() => setPago('usdt')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <span className="text-xl">₮</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">USDT / Crypto</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pago en criptomonedas</p>
                    </div>
                  </div>
                  <input type="radio" checked={pago === 'usdt'} onChange={() => setPago('usdt')} className="w-5 h-5 text-green-500" />
                </div>
              </div>

              <div className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${pago === 'transferencia' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`} onClick={() => setPago('transferencia')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-xl">💸</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Transferencia Bancaria</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pago en USD o ARS</p>
                    </div>
                  </div>
                  <input type="radio" checked={pago === 'transferencia'} onChange={() => setPago('transferencia')} className="w-5 h-5 text-blue-500" />
                </div>
              </div>

              <div className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${pago === 'efectivo' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`} onClick={() => setPago('efectivo')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <span className="text-xl">💵</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Efectivo</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pago en persona</p>
                    </div>
                  </div>
                  <input type="radio" checked={pago === 'efectivo'} onChange={() => setPago('efectivo')} className="w-5 h-5 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Información importante</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Los productos de encargo se piden especialmente para vos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Tiempo de entrega estimado: 20 días</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Te contactaremos para coordinar el pago y la entrega</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {error && <div className="text-red-600 dark:text-red-400 text-sm text-center font-semibold mt-4">{error}</div>}
        {exito && (
          <div className="flex flex-col items-center gap-2 text-green-600 dark:text-green-400 text-lg font-semibold mt-4">
            <span className="text-3xl">✓</span>
            ¡Encargo enviado! Te contactaremos pronto.
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 0 && <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors" onClick={handleBack}>Atrás</button>}
          {step < 2 && <button className="px-4 py-2 bg-black dark:bg-blue-600 text-white rounded hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors" onClick={handleNext}>Siguiente</button>}
          {step === 2 && pago && (
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors" 
              onClick={handleSubmit} 
              disabled={enviando}
            >
              {enviando ? 'Enviando...' : 'Enviar encargo'}
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
