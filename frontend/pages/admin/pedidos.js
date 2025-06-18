import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const estados = ['pendiente', 'pagado', 'enviado', 'recibido', 'cancelado'];

export default function PedidosAdmin() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pedidos</h1>
      {orders.length === 0 ? <div>No hay pedidos.</div> : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Productos</th>
              <th>Pago</th>
              <th>Envío</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="border-t">
                <td>
                  <div>{order.datosPersonales?.nombre}</div>
                  <div className="text-xs text-gray-500">{order.datosPersonales?.email}</div>
                  <div className="text-xs text-gray-500">{order.datosPersonales?.telefono}</div>
                </td>
                <td>
                  {order.productos.map(p => (
                    <div key={p.productoId} className="flex items-center mb-1">
                      <img src={p.imagen} alt={p.nombre} className="w-8 h-8 object-cover rounded mr-1" />
                      <span>{p.nombre} x{p.cantidad}</span>
                    </div>
                  ))}
                </td>
                <td>{order.pago}</td>
                <td>{order.envio?.tipo}{order.envio?.direccion && <div className="text-xs">{order.envio.direccion}</div>}</td>
                <td>{order.estado}</td>
                <td>
                  <select value={order.estado} onChange={e => cambiarEstado(order._id, e.target.value)}>
                    {estados.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 