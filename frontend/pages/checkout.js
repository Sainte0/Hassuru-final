import React, { useState } from 'react';
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
  const [datos, setDatos] = useState({ nombre: '', email: '', telefono: '' });
  const [envio, setEnvio] = useState({ tipo: 'envio', direccion: '', calle: '', numero: '', piso: '', ciudad: '', provincia: '', codigoPostal: '', pais: '' });
  const [pago, setPago] = useState('usdt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [telefono, setTelefono] = useState({ prefijo: '+54', numero: '' });
  const { dolarBlue } = useStore();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    if (!telefono.numero || telefono.numero.trim().length < 6) {
      setError('Por favor, ingresa un teléfono válido.');
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
        nombre: datos.nombre,
        email: datos.email,
        telefono: telefonoCompleto
      });
      const res = await fetch('https://web-production-73e61.up.railway.app/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos: productosToSend,
          datosPersonales: {
            nombre: datos.nombre,
            email: datos.email,
            telefono: telefonoCompleto
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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-900 tracking-tight">Finalizar pedido</h1>
        <div className="mb-8 flex space-x-2">
          {pasos.map((p, i) => (
            <div key={i} className={`flex-1 text-center py-3 rounded-lg font-semibold text-base transition-all duration-200 ${i === step ? 'bg-black text-white shadow' : 'bg-gray-200 text-gray-600'}`}>{p}</div>
          ))}
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Resumen del carrito</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">El carrito está vacío.</p>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.productoId + '-' + item.talle} className="flex items-center border rounded-lg p-3 bg-gray-50 shadow-sm">
                  <img src={item.imagen} alt={item.nombre} className="w-16 h-16 object-cover rounded-lg mr-3 border" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{item.nombre}</div>
                    <div className="text-sm text-gray-500">Talle: {item.talle}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <button className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition" onClick={() => addToCart({ ...item, cantidad: -1 })} disabled={item.cantidad <= 1}>-</button>
                      <span className="px-2 font-medium">{item.cantidad}</span>
                      <button className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition" onClick={() => addToCart({ ...item, cantidad: 1 })}>+</button>
                      <button className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition" onClick={() => removeFromCart(item.productoId, item.talle)}>Eliminar</button>
                    </div>
                  </div>
                  <div className="text-right min-w-[90px]">
                    <div className="font-bold text-gray-900">${item.precio} USD</div>
                    <div className="text-xs text-gray-500">${item.precioARS?.toFixed(2)} ARS</div>
                  </div>
                </div>
              ))}
              <div className="text-right font-bold mt-4 text-lg border-t pt-4">
                Total: <span className="text-black">${totalUSD.toFixed(2)} USD</span>{dolarBlue && <span className="text-gray-500"> / ${totalARS.toFixed(2)} ARS</span>}
              </div>
            </div>
          )}
        </div>
        {step === 0 && (
          <div className="space-y-2">
            <input className="w-full border p-2" placeholder="Nombre" value={datos.nombre} onChange={e => setDatos(d => ({ ...d, nombre: e.target.value }))} />
            <input className="w-full border p-2" placeholder="Email" value={datos.email} onChange={e => setDatos(d => ({ ...d, email: e.target.value }))} />
            <div className="flex">
              <select className="border p-2" value={telefono.prefijo} onChange={e => setTelefono(t => ({ ...t, prefijo: e.target.value }))}>
                {LATAM_PREFIXES.map(p => <option key={p.code} value={p.code}>{p.country} ({p.code})</option>)}
              </select>
              <input className="flex-1 border p-2" placeholder="Teléfono" value={telefono.numero} onChange={e => setTelefono(t => ({ ...t, numero: e.target.value }))} required />
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-2">
            <div>
              <label>
                <input type="radio" checked={envio.tipo === 'envio'} onChange={() => setEnvio({ ...envio, tipo: 'envio' })} /> Envío
              </label>
              <label className="ml-4">
                <input type="radio" checked={envio.tipo === 'retiro'} onChange={() => setEnvio({ ...envio, tipo: 'retiro' })} /> Retiro en persona
              </label>
            </div>
            {envio.tipo === 'envio' && (
              <div className="space-y-2">
                <input className="w-full border p-2" placeholder="Calle" value={envio.calle} onChange={e => setEnvio({ ...envio, calle: e.target.value })} />
                <input className="w-full border p-2" placeholder="Número" value={envio.numero} onChange={e => setEnvio({ ...envio, numero: e.target.value })} />
                <input className="w-full border p-2" placeholder="Piso/Depto (opcional)" value={envio.piso} onChange={e => setEnvio({ ...envio, piso: e.target.value })} />
                <input className="w-full border p-2" placeholder="Ciudad" value={envio.ciudad} onChange={e => setEnvio({ ...envio, ciudad: e.target.value })} />
                <input className="w-full border p-2" placeholder="Provincia/Estado" value={envio.provincia} onChange={e => setEnvio({ ...envio, provincia: e.target.value })} />
                <input className="w-full border p-2" placeholder="Código Postal" value={envio.codigoPostal} onChange={e => setEnvio({ ...envio, codigoPostal: e.target.value })} />
                <input className="w-full border p-2" placeholder="País" value={envio.pais} onChange={e => setEnvio({ ...envio, pais: e.target.value })} />
              </div>
            )}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-2">
            <div>
              <label><input type="radio" checked={pago === 'usdt'} onChange={() => setPago('usdt')} /> USDT</label>
              <label className="ml-4"><input type="radio" checked={pago === 'transferencia'} onChange={() => setPago('transferencia')} /> Transferencia</label>
              <label className="ml-4"><input type="radio" checked={pago === 'efectivo'} onChange={() => setPago('efectivo')} /> Efectivo</label>
            </div>
          </div>
        )}
        {error && <div className="text-red-500 mt-2">{error}</div>}
        <div className="flex justify-between mt-6">
          {step > 0 && <button className="px-4 py-2 bg-gray-200 rounded" onClick={handleBack}>Atrás</button>}
          {step < 2 && <button className="px-4 py-2 bg-black text-white rounded" onClick={handleNext}>Siguiente</button>}
          {step === 2 && <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleSubmit} disabled={loading}>{loading ? 'Enviando...' : 'Confirmar pedido'}</button>}
        </div>
      </div>
    </div>
  );
} 