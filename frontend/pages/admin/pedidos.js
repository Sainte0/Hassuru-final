import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const estados = ['pendiente', 'pagado', 'enviado', 'recibido', 'cancelado'];

export default function PedidosAdmin() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [changing, setChanging] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch('/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setOrders)
      .catch(e => setError('Error al cargar pedidos'))
      .finally(() => setLoading(false));
  }, [token]);

  const cambiarEstado = async (id, estado) => {
    setChanging(id);
    try {
      await fetch(`/api/orders/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado })
      });
      setOrders(orders => orders.map(o => o._id === id ? { ...o, estado } : o));
    } catch {
      alert('Error al cambiar estado');
    } finally {
      setChanging(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Pedidos</h1>
      {orders.length === 0 ? <div>No hay pedidos.</div> : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm bg-white shadow rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Cliente</th>
                <th className="p-2">Productos</th>
                <th className="p-2">Pago</th>
                <th className="p-2">Envío</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-t hover:bg-gray-50">
                  <td className="p-2 align-top min-w-[140px]">
                    <div className="font-semibold">{order.datosPersonales?.nombre}</div>
                    <div className="text-xs text-gray-500">{order.datosPersonales?.email}</div>
                    <div className="text-xs text-gray-500">{order.datosPersonales?.telefono}</div>
                  </td>
                  <td className="p-2 align-top min-w-[220px]">
                    {order.productos.map(p => (
                      <div key={p.productoId + (p.talle || '')} className="flex items-center mb-1 gap-2">
                        <img src={p.imagen} alt={p.nombre} className="w-8 h-8 object-cover rounded" />
                        <div>
                          <div className="font-medium">{p.nombre}</div>
                          {p.talle && <div className="text-xs">Talle: <span className="font-semibold">{p.talle}</span></div>}
                          <div className="text-xs">Cantidad: <span className="font-semibold">{p.cantidad}</span></div>
                          <div className="text-xs text-gray-500">${p.precio} USD</div>
                        </div>
                      </div>
                    ))}
                  </td>
                  <td className="p-2 align-top min-w-[80px]">{order.pago}</td>
                  <td className="p-2 align-top min-w-[120px]">
                    <div className="capitalize font-medium">{order.envio?.tipo}</div>
                    {order.envio?.direccion && <div className="text-xs text-gray-500 break-words">{order.envio.direccion}</div>}
                  </td>
                  <td className="p-2 align-top min-w-[100px]">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${order.estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800' : order.estado === 'pagado' ? 'bg-green-200 text-green-800' : order.estado === 'enviado' ? 'bg-blue-200 text-blue-800' : order.estado === 'recibido' ? 'bg-gray-200 text-gray-800' : 'bg-red-200 text-red-800'}`}>{order.estado}</span>
                  </td>
                  <td className="p-2 align-top min-w-[120px]">
                    <select
                      value={order.estado}
                      onChange={e => cambiarEstado(order._id, e.target.value)}
                      className="border rounded px-2 py-1"
                      disabled={changing === order._id}
                    >
                      {estados.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    {changing === order._id && <div className="text-xs text-blue-500 mt-1">Actualizando...</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 