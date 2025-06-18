import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useRouter } from 'next/router';

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
  const { cart, clearCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [datos, setDatos] = useState({ nombre: '', email: '', telefono: '' });
  const [envio, setEnvio] = useState({ tipo: 'envio', direccion: '', calle: '', numero: '', piso: '', ciudad: '', provincia: '', codigoPostal: '', pais: '' });
  const [pago, setPago] = useState('usdt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [telefono, setTelefono] = useState({ prefijo: '+54', numero: '' });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos: cart,
          datosPersonales: { ...datos, telefono: telefono.prefijo + telefono.numero },
          envio,
          pago
        })
      });
      if (!res.ok) throw new Error('Error al crear el pedido');
      clearCart();
      router.push('/pedido-exitoso');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Finalizar pedido</h1>
      <div className="mb-4 flex space-x-2">
        {pasos.map((p, i) => (
          <div key={i} className={`flex-1 text-center py-2 rounded ${i === step ? 'bg-black text-white' : 'bg-gray-200'}`}>{p}</div>
        ))}
      </div>
      {step === 0 && (
        <div className="space-y-2">
          <input className="w-full border p-2" placeholder="Nombre" value={datos.nombre} onChange={e => setDatos(d => ({ ...d, nombre: e.target.value }))} />
          <input className="w-full border p-2" placeholder="Email" value={datos.email} onChange={e => setDatos(d => ({ ...d, email: e.target.value }))} />
          <div className="flex">
            <select className="border p-2" value={telefono.prefijo} onChange={e => setTelefono(t => ({ ...t, prefijo: e.target.value }))}>
              {LATAM_PREFIXES.map(p => <option key={p.code} value={p.code}>{p.country} ({p.code})</option>)}
            </select>
            <input className="flex-1 border p-2" placeholder="Teléfono" value={telefono.numero} onChange={e => setTelefono(t => ({ ...t, numero: e.target.value }))} />
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
  );
} 