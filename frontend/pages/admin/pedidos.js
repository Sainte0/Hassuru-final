import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../components/AdminLayout';

const estados = ['pendiente', 'pagado', 'enviado', 'recibido', 'cancelado'];

export default function PedidosAdmin() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [changing, setChanging] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    if (!token) return;
    fetch('https://web-production-ffe2.up.railway.app/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data && data.error) {
          setError(data.error);
        } else {
          setError('Error inesperado al cargar pedidos');
        }
      })
      .catch(e => setError('Error al cargar pedidos'))
      .finally(() => setLoading(false));
  }, [token]);

  const cambiarEstado = async (id, estado) => {
    setChanging(id);
    try {
      await fetch(`https://web-production-ffe2.up.railway.app/api/orders/${id}/estado`, {
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

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading) return (
    <AdminLayout title="Pedidos">
      <div className="flex justify-center py-12">
        <div className="text-gray-600 dark:text-dark-text-secondary">Cargando...</div>
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout title="Pedidos">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Pedidos">
      <div className="space-y-6">
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Gestión de Pedidos</h1>
            <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Mostrando {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, orders.length)} de {orders.length} pedidos
            </div>
          </div>
          
          {orders.length === 0 ? (
            <div className="text-gray-600 dark:text-dark-text-secondary">No hay pedidos.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 dark:border-dark-border text-sm bg-white dark:bg-dark-card shadow rounded">
                  <thead className="bg-gray-50 dark:bg-dark-bg">
                    <tr>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold">Cliente</th>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold">Productos</th>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold">Pago</th>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold">Envío</th>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold">Estado</th>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map(order => (
                      <tr key={order._id} className="border-t border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg">
                        <td className="p-3 align-top min-w-[140px]">
                          <div className="font-semibold text-gray-900 dark:text-dark-text">{order.datosPersonales?.nombre}</div>
                          <div className="text-xs text-gray-500 dark:text-dark-text-secondary">{order.datosPersonales?.email}</div>
                          <div className="text-xs text-gray-500 dark:text-dark-text-secondary">{order.datosPersonales?.telefono}</div>
                          <div className="text-xs text-gray-500 dark:text-dark-text-secondary">DNI: {order.datosPersonales?.dni}</div>
                        </td>
                        <td className="p-3 align-top min-w-[220px]">
                          {order.productos.map(p => (
                            <div key={p.productoId + (p.talle || '')} className="flex items-center mb-1 gap-2">
                              <img src={p.imagen} alt={p.nombre} className="w-8 h-8 object-cover rounded" />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-dark-text">{p.nombre}</div>
                                {p.talle && <div className="text-xs">Talle: <span className="font-semibold">{p.talle}</span></div>}
                                <div className="text-xs">Cantidad: <span className="font-semibold">{p.cantidad}</span></div>
                                <div className="text-xs text-gray-500 dark:text-dark-text-secondary">${p.precio} USD</div>
                              </div>
                            </div>
                          ))}
                        </td>
                        <td className="p-3 align-top min-w-[80px] text-gray-900 dark:text-dark-text">{order.pago}</td>
                        <td className="p-3 align-top min-w-[120px]">
                          <div className="capitalize font-medium text-gray-900 dark:text-dark-text">{order.envio?.tipo}</div>
                          {order.envio?.direccion && <div className="text-xs text-gray-500 dark:text-dark-text-secondary break-words">{order.envio.direccion}</div>}
                        </td>
                        <td className="p-3 align-top min-w-[100px]">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800' : 
                            order.estado === 'pagado' ? 'bg-green-200 text-green-800' : 
                            order.estado === 'enviado' ? 'bg-blue-200 text-blue-800' : 
                            order.estado === 'recibido' ? 'bg-gray-200 text-gray-800' : 
                            'bg-red-200 text-red-800'
                          }`}>
                            {order.estado}
                          </span>
                        </td>
                        <td className="p-3 align-top min-w-[120px]">
                          <select
                            value={order.estado}
                            onChange={e => cambiarEstado(order._id, e.target.value)}
                            className="border border-gray-300 dark:border-dark-border rounded px-2 py-1 bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-dark-card dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-dark-bg"
                  >
                    Anterior
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-dark-card dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-dark-bg'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-dark-card dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-dark-bg"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 