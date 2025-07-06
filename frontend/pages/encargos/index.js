import React, { useState } from "react";
import Link from "next/link";

const tiposEnvio = [
  { value: 'envio', label: 'Envío a domicilio' },
  { value: 'retiro', label: 'Retiro en persona' }
];
const tiposPago = [
  { value: 'usdt', label: 'USDT/Crypto' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'efectivo', label: 'Efectivo' }
];

export default function Encargos() {
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', link: '', detalles: '' });
  const [datos, setDatos] = useState({ nombre: '', email: '', telefono: '', dni: '', direccion: '', tipoEnvio: 'envio', tipoPago: 'usdt' });
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  const handleAddProducto = () => {
    if (!nuevoProducto.nombre || !nuevoProducto.detalles) return;
    setProductos([...productos, nuevoProducto]);
    setNuevoProducto({ nombre: '', link: '', detalles: '' });
  };

  const handleRemoveProducto = idx => {
    setProductos(productos.filter((_, i) => i !== idx));
  };

  const handleChangeDatos = e => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleChangeProducto = e => {
    setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    setExito(false);
    // Validación
    if (
      !datos.nombre.trim() ||
      !datos.email.trim() ||
      !datos.telefono.trim() ||
      !datos.dni.trim() ||
      !datos.direccion.trim() ||
      !datos.tipoEnvio ||
      !datos.tipoPago ||
      productos.length === 0
    ) {
      setError('Por favor, completa todos los campos y agrega al menos un producto.');
      setEnviando(false);
      return;
    }
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos: productos.map(p => ({ ...p, encargo: true })),
          datosPersonales: {
            nombre: datos.nombre,
            email: datos.email,
            telefono: datos.telefono,
            dni: datos.dni
          },
          envio: { tipo: datos.tipoEnvio, direccion: datos.direccion },
          pago: datos.tipoPago,
        })
      });
      if (!res.ok) throw new Error('Error al enviar el encargo');
      setExito(true);
      setProductos([]);
      setDatos({ nombre: '', email: '', telefono: '', dni: '', direccion: '', tipoEnvio: 'envio', tipoPago: 'usdt' });
    } catch (e) {
      setError('Error al enviar el encargo. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white dark:bg-gray-900 rounded-lg shadow mt-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Encarga lo que quieras</h1>
      <p className="mb-4 text-center text-gray-700 dark:text-gray-300">Agrega uno o más productos que quieras encargar. ¡Nosotros te lo conseguimos!</p>
      <div className="mb-6 bg-blue-50 dark:bg-blue-900 rounded p-4">
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">Producto a encargar</h2>
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input name="nombre" value={nuevoProducto.nombre} onChange={handleChangeProducto} placeholder="Nombre del producto*" className="flex-1 border rounded p-2" required />
          <input name="link" value={nuevoProducto.link} onChange={handleChangeProducto} placeholder="Link (opcional)" className="flex-1 border rounded p-2" />
        </div>
        <textarea name="detalles" value={nuevoProducto.detalles} onChange={handleChangeProducto} placeholder="Detalles, color, talla, etc.*" className="w-full border rounded p-2 mb-2" required />
        <button type="button" onClick={handleAddProducto} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">Agregar producto</button>
      </div>
      {productos.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">Productos a encargar:</h2>
          <ul className="mb-2">
            {productos.map((p, i) => (
              <li key={i} className="flex items-center gap-2 mb-1 bg-blue-100 dark:bg-blue-800 rounded p-2">
                <span className="flex-1 font-medium">{p.nombre} {p.link && (<a href={p.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">(ver link)</a>)}<br /><span className="text-xs text-gray-600 dark:text-gray-300">{p.detalles}</span></span>
                <button onClick={() => handleRemoveProducto(i)} className="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">Tus datos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="nombre" value={datos.nombre} onChange={handleChangeDatos} placeholder="Nombre y apellido*" className="border rounded p-2" required />
          <input name="email" value={datos.email} onChange={handleChangeDatos} placeholder="Email*" className="border rounded p-2" required />
          <input name="telefono" value={datos.telefono} onChange={handleChangeDatos} placeholder="Teléfono*" className="border rounded p-2" required />
          <input name="dni" value={datos.dni} onChange={handleChangeDatos} placeholder="DNI*" className="border rounded p-2" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select name="tipoEnvio" value={datos.tipoEnvio} onChange={handleChangeDatos} className="border rounded p-2" required>
            {tiposEnvio.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <input name="direccion" value={datos.direccion} onChange={handleChangeDatos} placeholder="Dirección*" className="border rounded p-2" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select name="tipoPago" value={datos.tipoPago} onChange={handleChangeDatos} className="border rounded p-2" required>
            {tiposPago.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {exito && <div className="text-green-600 text-sm">¡Encargo enviado! Te contactaremos pronto.</div>}
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all text-lg" disabled={enviando || productos.length === 0}>
          {enviando ? 'Enviando...' : 'Enviar encargo'}
        </button>
      </form>
    </div>
  );
}
