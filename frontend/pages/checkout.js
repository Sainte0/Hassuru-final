import React, { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { useRouter } from 'next/router';
import useStore from '../store/store';

const pasos = ['Datos personales', 'Envío o retiro', 'Pago'];

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

export default function Checkout() {
  const { cart, clearCart, addToCart, removeFromCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [datos, setDatos] = useState({ 
    nombre: '', 
    apellido: '', 
    email: '', 
    dni: '' 
  });
  const [envio, setEnvio] = useState({ tipo: 'envio', direccion: '', calle: '', numero: '', piso: '', ciudad: '', provincia: '', codigoPostal: '', pais: '' });
  const [pago, setPago] = useState('usdt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [telefono, setTelefono] = useState({ prefijo: '+54', numero: '' });
  const { dolarBlue, fetchDolarBlue } = useStore();
  
  // Estados para validaciones
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    fetchDolarBlue();
    
    // Actualizar el valor cada 5 minutos
    const interval = setInterval(() => {
      fetchDolarBlue();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchDolarBlue]);

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

  // Función para validar todo el formulario
  const validateForm = () => {
    const newErrors = {};
    
    // Validar todos los campos
    newErrors.nombre = validateField('nombre', datos.nombre);
    newErrors.apellido = validateField('apellido', datos.apellido);
    newErrors.email = validateField('email', datos.email);
    newErrors.dni = validateField('dni', datos.dni);
    newErrors.telefono = validateField('telefono', telefono.numero);
    
    setErrors(newErrors);
    
    // Verificar si hay errores
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleNext = () => {
    if (step === 0) {
      // Validar formulario antes de continuar
      if (!validateForm()) {
        // Marcar todos los campos como tocados para mostrar errores
        setTouched({
          nombre: true,
          apellido: true,
          email: true,
          dni: true,
          telefono: true
        });
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      setError('Por favor, corrige los errores en el formulario.');
      setLoading(false);
      return;
    }

    try {
      let envioData;
      if (envio.tipo === 'envio') {
        envioData = {
          tipo: 'envio',
          direccion: `${envio.calle} ${envio.numero}${envio.piso ? ', ' + envio.piso : ''}, ${envio.ciudad}, ${envio.provincia}, ${envio.codigoPostal}, ${envio.pais}`
        };
      } else {
        envioData = { tipo: 'retiro', direccion: '' };
      }
      const productosToSend = cart.map(item => ({
        productoId: item.productoId,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio,
        imagen: item.imagen,
        ...(item.talle && { talle: item.talle })
      }));
      console.log('Checkout - productos en cart:', cart);
      console.log('Checkout - datos personales:', datos);
      console.log('Checkout - telefono:', telefono);
      console.log('Checkout - envio:', envio);
      console.log('Checkout - pago:', pago);
      console.log('Checkout - productosToSend:', productosToSend);
      console.log('Checkout - envioData:', envioData);
      const telefonoCompleto = telefono.prefijo + telefono.numero;
      console.log('Enviando datosPersonales:', {
        nombre: `${datos.nombre} ${datos.apellido}`,
        email: datos.email,
        telefono: telefonoCompleto,
        dni: datos.dni
      });
      const res = await fetch('https://web-production-ffe2.up.railway.app/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos: productosToSend,
          datosPersonales: {
            nombre: `${datos.nombre} ${datos.apellido}`,
            email: datos.email,
            telefono: telefonoCompleto,
            dni: datos.dni
          },
          envio: envioData,
          pago
        })
      });
      if (!res.ok) throw new Error('Error al crear el pedido');
      localStorage.setItem('lastCart', JSON.stringify(cart));
      clearCart();
      router.push('/pedido-exitoso');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales
  const totalUSD = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const totalARS = dolarBlue ? (totalUSD * dolarBlue) : null;

  // Función para renderizar campo con validación
  const renderField = (name, placeholder, type = 'text') => {
    const value = name === 'telefono' ? telefono.numero : datos[name];
    const error = errors[name];
    const isTouched = touched[name];
    const showError = isTouched && error;

    return (
      <div className="space-y-1">
        <input 
          type={type}
          className={`w-full border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
            showError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
          }`}
          placeholder={placeholder} 
          value={value} 
          onChange={e => handleFieldChange(name, e.target.value)}
          onBlur={() => handleFieldBlur(name)}
        />
        {showError && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-8 border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 text-center text-gray-900 dark:text-white tracking-tight">Finalizar pedido</h1>
        <div className="mb-6 sm:mb-8 flex space-x-2">
          {pasos.map((p, i) => (
            <div key={i} className={`flex-1 text-center py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-base transition-all duration-200 ${i === step ? 'bg-black dark:bg-blue-600 text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{p}</div>
          ))}
        </div>
        <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <p className="ml-2 text-sm text-green-700 dark:text-green-300 font-medium">¡Envío gratis a todo Argentina!</p>
          </div>
        </div>
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-gray-800 dark:text-white">Resumen del carrito</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">El carrito está vacío.</p>
          ) : (
            <div className="space-y-3 sm:space-y-4 overflow-x-auto">
              {cart.map(item => (
                <div key={item.productoId + '-' + item.talle} className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 shadow-sm min-w-[260px] sm:min-w-0">
                  <img src={item.imagen} alt={item.nombre} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg mr-2 sm:mr-3 border border-gray-200 dark:border-gray-600" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white break-words text-xs sm:text-base">{item.nombre}</div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words">Talle: {item.talle}</div>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1">
                      <button 
                        className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition text-xs sm:text-base text-gray-700 dark:text-gray-300" 
                        onClick={() => {
                          if (item.cantidad > 1) {
                            addToCart({ ...item, cantidad: -1 });
                          }
                        }}
                      >-</button>
                      <span className="px-2 font-medium text-xs sm:text-base text-gray-900 dark:text-white">{item.cantidad}</span>
                      <button 
                        className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition text-xs sm:text-base text-gray-700 dark:text-gray-300" 
                        onClick={() => addToCart({ ...item, cantidad: 1 })}
                      >+</button>
                      <button 
                        className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs sm:text-base" 
                        onClick={() => removeFromCart(item.productoId, item.talle)}
                      >Eliminar</button>
                    </div>
                  </div>
                  <div className="text-right min-w-[70px] sm:min-w-[90px]">
                    <div className="font-bold text-gray-900 dark:text-white text-xs sm:text-base">${item.precio} USD</div>
                    {dolarBlue && (
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ${(item.precio * dolarBlue).toFixed(2)} ARS
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="text-right font-bold mt-3 sm:mt-4 text-base sm:text-lg border-t border-gray-200 dark:border-gray-600 pt-3 sm:pt-4">
                <div className="text-gray-900 dark:text-white">Total: <span className="text-black dark:text-white">${totalUSD.toFixed(2)} USD</span></div>
                {dolarBlue && (
                  <div className="text-gray-500 dark:text-gray-400 mt-1">${totalARS.toFixed(2)} ARS</div>
                )}
              </div>
            </div>
          )}
        </div>
       
        {step === 0 && (
          <div className="space-y-4">
            {renderField('nombre', 'Nombre')}
            {renderField('apellido', 'Apellido')}
            {renderField('email', 'Email', 'email')}
            {renderField('dni', 'DNI (8 números)')}
            <div className="space-y-1">
              <div className="flex">
                <select 
                  className={`border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
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
                  className={`flex-1 border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
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
          </div>
        )}
        {step === 1 && (
          <div className="space-y-2">
            <div className="text-gray-900 dark:text-white">
              <label className="flex items-center">
                <input type="radio" checked={envio.tipo === 'envio'} onChange={() => setEnvio({ ...envio, tipo: 'envio' })} className="mr-2" /> Envío
              </label>
              <label className="flex items-center ml-4">
                <input type="radio" checked={envio.tipo === 'retiro'} onChange={() => setEnvio({ ...envio, tipo: 'retiro' })} className="mr-2" /> Retiro en persona
              </label>
            </div>
            {envio.tipo === 'envio' && (
              <div className="space-y-2">
                <input 
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                  placeholder="Calle" 
                  value={envio.calle} 
                  onChange={e => setEnvio({ ...envio, calle: e.target.value })} 
                />
                <input 
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                  placeholder="Número" 
                  value={envio.numero} 
                  onChange={e => setEnvio({ ...envio, numero: e.target.value })} 
                />
                <input 
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                  placeholder="Piso/Depto (opcional)" 
                  value={envio.piso} 
                  onChange={e => setEnvio({ ...envio, piso: e.target.value })} 
                />
                <input 
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                  placeholder="Ciudad" 
                  value={envio.ciudad} 
                  onChange={e => setEnvio({ ...envio, ciudad: e.target.value })} 
                />
                <input 
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                  placeholder="Provincia/Estado" 
                  value={envio.provincia} 
                  onChange={e => setEnvio({ ...envio, provincia: e.target.value })} 
                />
                <input 
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                  placeholder="Código Postal" 
                  value={envio.codigoPostal} 
                  onChange={e => setEnvio({ ...envio, codigoPostal: e.target.value })} 
                />
                <input 
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                  placeholder="País" 
                  value={envio.pais} 
                  onChange={e => setEnvio({ ...envio, pais: e.target.value })} 
                />
              </div>
            )}
          </div>
        )}
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
                {pago === 'usdt' && (
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                    <p>• Aceptamos USDT en las redes TRC20 y BEP20</p>
                    <p>• También aceptamos otras criptomonedas principales</p>
                    <p>• El precio se fija al momento del pago</p>
                  </div>
                )}
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
                {pago === 'transferencia' && (
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                    <p>• Transferencia en USD desde cuentas internacionales</p>
                    <p>• Transferencia en pesos argentinos</p>
                    <p>• Zelle y Cashapp disponibles</p>
                  </div>
                )}
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
                {pago === 'efectivo' && (
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                    <p>• Disponible en Córdoba Capital</p>
                    <p>• Disponible en Buenos Aires</p>
                    <p>• Coordinamos punto de encuentro seguro</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Información importante</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Los precios están en USD y se convierten a ARS al momento del pago</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Te contactaremos para coordinar el pago y la entrega</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Envíos gratis a todo el país</span>
                </li>
              </ul>
            </div>
          </div>
        )}
        {error && <div className="text-red-500 dark:text-red-400 mt-2">{error}</div>}
        <div className="flex justify-between mt-6">
          {step > 0 && <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors" onClick={handleBack}>Atrás</button>}
          {step < 2 && <button className="px-4 py-2 bg-black dark:bg-blue-600 text-white rounded hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors" onClick={handleNext}>Siguiente</button>}
          {step === 2 && pago && (
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors" 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Realizar pedido'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 