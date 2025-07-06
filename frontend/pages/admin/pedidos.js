import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../components/AdminLayout';
import { FaRegCopy } from 'react-icons/fa';

const estados = ['pendiente', 'pagado', 'enviado', 'recibido', 'cancelado'];
const pagos = ['usdt', 'transferencia', 'efectivo'];
const tiposEnvio = ['envio', 'retiro'];

export default function PedidosAdmin() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [changing, setChanging] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Filtros
  const [filtros, setFiltros] = useState({
    estado: '',
    search: '',
    fechaDesde: '',
    fechaHasta: '',
    pago: '',
    envio: '',
    dni: ''
  });

  const [trackingInputs, setTrackingInputs] = useState({});
  const [savingTracking, setSavingTracking] = useState(null);

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
      // Si el nuevo estado es 'enviado', mostrar input de tracking
      if (estado === 'enviado') {
        setTrackingInputs(inputs => ({ ...inputs, [id]: '' }));
      }
    } catch {
      alert('Error al cambiar estado');
    } finally {
      setChanging(null);
    }
  };

  const guardarTracking = async (id) => {
    setSavingTracking(id);
    try {
      const tracking = trackingInputs[id] || '';
      const res = await fetch(`https://web-production-ffe2.up.railway.app/api/orders/${id}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tracking })
      });
      if (!res.ok) throw new Error('Error al guardar tracking');
      const updated = await res.json();
      setOrders(orders => orders.map(o => o._id === id ? { ...o, tracking: updated.tracking } : o));
      setTrackingInputs(inputs => ({ ...inputs, [id]: updated.tracking }));
      alert('Tracking guardado y email enviado');
    } catch {
      alert('Error al guardar tracking');
    } finally {
      setSavingTracking(null);
    }
  };

  // Filtrado frontend
  const filteredOrders = orders
    .filter(order => {
      if (filtros.estado && order.estado !== filtros.estado) return false;
      if (filtros.search) {
        const search = filtros.search.toLowerCase();
        const nombre = order.datosPersonales?.nombre?.toLowerCase() || '';
        const email = order.datosPersonales?.email?.toLowerCase() || '';
        if (!nombre.includes(search) && !email.includes(search)) return false;
      }
      if (filtros.fechaDesde) {
        const fecha = new Date(order.fechaCreacion);
        if (fecha < new Date(filtros.fechaDesde)) return false;
      }
      if (filtros.fechaHasta) {
        const fecha = new Date(order.fechaCreacion);
        if (fecha > new Date(filtros.fechaHasta + 'T23:59:59')) return false;
      }
      if (filtros.pago && order.pago !== filtros.pago) return false;
      if (filtros.envio && order.envio?.tipo !== filtros.envio) return false;
      if (filtros.dni && order.datosPersonales?.dni !== filtros.dni) return false;
      return true;
    })
    // Cancelados siempre al final
    .sort((a, b) => {
      if (a.estado === 'cancelado' && b.estado !== 'cancelado') return 1;
      if (a.estado !== 'cancelado' && b.estado === 'cancelado') return -1;
      return 0;
    });

  // Paginación
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  // Panel de filtros
  const renderFiltros = () => (
    <div className="mb-6 flex flex-wrap gap-4 items-end bg-gray-50 dark:bg-dark-bg p-4 rounded-lg border border-gray-200 dark:border-dark-border">
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Estado</label>
        <select className="border rounded p-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={filtros.estado} onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))}>
          <option value="">Todos</option>
          {estados.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Nombre/Email</label>
        <input className="border rounded p-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={filtros.search} onChange={e => setFiltros(f => ({ ...f, search: e.target.value }))} placeholder="Buscar..." />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Pago</label>
        <select className="border rounded p-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={filtros.pago} onChange={e => setFiltros(f => ({ ...f, pago: e.target.value }))}>
          <option value="">Todos</option>
          {pagos.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Envío</label>
        <select className="border rounded p-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={filtros.envio} onChange={e => setFiltros(f => ({ ...f, envio: e.target.value }))}>
          <option value="">Todos</option>
          {tiposEnvio.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">DNI</label>
        <input className="border rounded p-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={filtros.dni} onChange={e => setFiltros(f => ({ ...f, dni: e.target.value.replace(/\D/g, '').slice(0, 12) }))} placeholder="DNI..." />
      </div>
      <button className="ml-auto px-3 py-1 bg-gray-200 dark:bg-dark-card rounded hover:bg-gray-300 dark:hover:bg-dark-border text-gray-900 dark:text-white" onClick={() => setFiltros({ estado: '', search: '', fechaDesde: '', fechaHasta: '', pago: '', envio: '', dni: '' })}>Limpiar</button>
    </div>
  );

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
        {renderFiltros()}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Gestión de Pedidos</h1>
            <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Mostrando {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} de {filteredOrders.length} pedidos
            </div>
          </div>
          {filteredOrders.length === 0 ? (
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
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold">Fecha</th>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold">Estado</th>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map(order => (
                      <tr key={order._id} className="border-t border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg">
                        <td className="p-3 align-top min-w-[140px]">
                          <div className="relative group">
                            <button
                              className="absolute right-0 top-0 text-xs p-1 text-gray-500 hover:text-blue-600 focus:outline-none"
                              title="Copiar info"
                              onClick={() => {
                                const info = `Nombre y apellido: ${order.datosPersonales?.nombre || ''}\nDomicilio (calle y número): ${order.envio?.direccion?.split(',')[0] || ''}\nCasa o Departamento: ${order.envio?.direccion?.split(',')[1]?.trim() || ''}\nLocalidad: ${order.envio?.direccion?.split(',')[2]?.trim() || ''}\nCódigo postal: ${order.envio?.direccion?.split(',')[3]?.trim() || ''}\nProvincia: ${order.envio?.direccion?.split(',')[4]?.trim() || ''}\nTeléfono: ${order.datosPersonales?.telefono || ''}\nDNI: ${order.datosPersonales?.dni || ''}\nMail: ${order.datosPersonales?.email || ''}`;
                                navigator.clipboard.writeText(info);
                              }}
                              tabIndex={-1}
                            >
                              <FaRegCopy size={14} />
                            </button>
                            <div className="space-y-0.5 pr-5 text-gray-900 dark:text-white">
                              <div><span className="font-semibold">Nombre y apellido:</span> {order.datosPersonales?.nombre || ''}</div>
                              <div><span className="font-semibold">Domicilio (calle y número):</span> {order.envio?.direccion?.split(',')[0] || ''}</div>
                              <div><span className="font-semibold">Casa o Departamento:</span> {order.envio?.direccion?.split(',')[1]?.trim() || ''}</div>
                              <div><span className="font-semibold">Localidad:</span> {order.envio?.direccion?.split(',')[2]?.trim() || ''}</div>
                              <div><span className="font-semibold">Código postal:</span> {order.envio?.direccion?.split(',')[3]?.trim() || ''}</div>
                              <div><span className="font-semibold">Provincia:</span> {order.envio?.direccion?.split(',')[4]?.trim() || ''}</div>
                              <div><span className="font-semibold">Teléfono:</span> {order.datosPersonales?.telefono || ''}</div>
                              <div><span className="font-semibold">DNI:</span> {order.datosPersonales?.dni || ''}</div>
                              <div><span className="font-semibold">Mail:</span> {order.datosPersonales?.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 align-top min-w-[220px]">
                          {order.productos.map(p => (
                            <div key={p.productoId + (p.talle || '')} className="flex items-center mb-1 gap-2">
                              <img src={p.imagen} alt={p.nombre} className="w-8 h-8 object-cover rounded" />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                  {p.nombre}
                                  {p.encargo && (
                                    <span className="ml-1 px-2 py-0.5 rounded bg-blue-200 text-blue-800 text-xs font-semibold">Encargo</span>
                                  )}
                                </div>
                                {p.talle && <div className="text-xs text-gray-500 dark:text-gray-300">Talle: <span className="font-semibold">{p.talle}</span></div>}
                                <div className="text-xs text-gray-700 dark:text-gray-200">Cantidad: <span className="font-semibold">{p.cantidad}</span></div>
                                <div className="text-xs text-gray-500 dark:text-gray-300">${p.precio} USD</div>
                              </div>
                            </div>
                          ))}
                        </td>
                        <td className="p-3 align-top min-w-[80px] text-gray-900 dark:text-dark-text">{order.pago}</td>
                        <td className="p-3 align-top min-w-[120px]">
                          <div className="capitalize font-medium text-gray-900 dark:text-dark-text">{order.envio?.tipo}</div>
                          {order.envio?.direccion && <div className="text-xs text-gray-500 dark:text-dark-text-secondary break-words">{order.envio.direccion}</div>}
                        </td>
                        <td className="p-3 align-top min-w-[100px] text-gray-900 dark:text-white">
                          {(() => {
                            const fecha = new Date(order.fechaCreacion);
                            const ahora = new Date();
                            const diffMs = ahora - fecha;
                            const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                            const fechaStr = fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                            return (
                              <div>
                                <div>{fechaStr}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-300">Hace {diffDias} día{diffDias !== 1 ? 's' : ''}</div>
                              </div>
                            );
                          })()}
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
                          {/* Tracking input si estado es enviado */}
                          {order.estado === 'enviado' && (
                            <div className="mt-2">
                              <input
                                type="text"
                                className="border rounded px-2 py-1 w-full text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Pega aquí el link o número de trackeo"
                                value={trackingInputs[order._id] !== undefined ? trackingInputs[order._id] : (order.tracking || '')}
                                onChange={e => setTrackingInputs(inputs => ({ ...inputs, [order._id]: e.target.value }))}
                                disabled={savingTracking === order._id}
                              />
                              <button
                                className="mt-1 px-2 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50"
                                onClick={() => guardarTracking(order._id)}
                                disabled={savingTracking === order._id || !trackingInputs[order._id]}
                              >
                                {savingTracking === order._id ? 'Guardando...' : 'Guardar tracking y enviar email'}
                              </button>
                            </div>
                          )}
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