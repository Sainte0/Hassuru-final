import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../components/AdminLayout';
import { FaRegCopy, FaFilter, FaTimes } from 'react-icons/fa';

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
  const [showFilters, setShowFilters] = useState(false);
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
      // Si no hay filtro de estado, ocultar cancelados por defecto
      if (!filtros.estado && order.estado === 'cancelado') return false;
      
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
    <div className="mb-6 bg-gray-50 dark:bg-dark-bg p-4 rounded-lg border border-gray-200 dark:border-dark-border">
      {/* Mobile filter toggle */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
        >
          <FaFilter className="mr-2" />
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
        {Object.values(filtros).some(f => f !== '') && (
          <button
            onClick={() => setFiltros({ estado: '', search: '', fechaDesde: '', fechaHasta: '', pago: '', envio: '', dni: '' })}
            className="flex items-center px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium"
          >
            <FaTimes className="mr-2" />
            Limpiar
          </button>
        )}
      </div>

      {/* Desktop filters always visible, mobile filters conditional */}
      <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Estado</label>
            <select 
              className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" 
              value={filtros.estado} 
              onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))}
            >
              <option value="">Todos</option>
              {estados.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Nombre/Email</label>
            <input 
              className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" 
              value={filtros.search} 
              onChange={e => setFiltros(f => ({ ...f, search: e.target.value }))} 
              placeholder="Buscar..." 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Pago</label>
            <select 
              className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" 
              value={filtros.pago} 
              onChange={e => setFiltros(f => ({ ...f, pago: e.target.value }))}
            >
              <option value="">Todos</option>
              {pagos.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Envío</label>
            <select 
              className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" 
              value={filtros.envio} 
              onChange={e => setFiltros(f => ({ ...f, envio: e.target.value }))}
            >
              <option value="">Todos</option>
              {tiposEnvio.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">DNI</label>
            <input 
              className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" 
              value={filtros.dni} 
              onChange={e => setFiltros(f => ({ ...f, dni: e.target.value.replace(/\D/g, '').slice(0, 12) }))} 
              placeholder="DNI..." 
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Fecha desde</label>
            <input 
              type="date" 
              className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" 
              value={filtros.fechaDesde} 
              onChange={e => setFiltros(f => ({ ...f, fechaDesde: e.target.value }))} 
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Fecha hasta</label>
            <input 
              type="date" 
              className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" 
              value={filtros.fechaHasta} 
              onChange={e => setFiltros(f => ({ ...f, fechaHasta: e.target.value }))} 
            />
          </div>
        </div>
        
        {/* Desktop clear button */}
        <div className="hidden lg:flex justify-end mt-4">
          <button 
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium" 
            onClick={() => setFiltros({ estado: '', search: '', fechaDesde: '', fechaHasta: '', pago: '', envio: '', dni: '' })}
          >
            Limpiar filtros
          </button>
        </div>
      </div>
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
        
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-dark-text">Gestión de Pedidos</h1>
            <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Mostrando {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} de {filteredOrders.length} pedidos
            </div>
          </div>
          
          {filteredOrders.length === 0 ? (
            <div className="text-gray-600 dark:text-dark-text-secondary text-center py-8">No hay pedidos.</div>
          ) : (
            <>
              {/* Mobile card view */}
              <div className="lg:hidden space-y-4">
                {currentOrders.map(order => (
                  <div key={order._id} className="border border-gray-200 dark:border-dark-border rounded-lg p-4 bg-white dark:bg-dark-card">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {order.datosPersonales?.nombre || 'Sin nombre'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.datosPersonales?.email || 'Sin email'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800' : 
                          order.estado === 'pagado' ? 'bg-green-200 text-green-800' : 
                          order.estado === 'enviado' ? 'bg-blue-200 text-blue-800' : 
                          order.estado === 'recibido' ? 'bg-gray-200 text-gray-800' : 
                          'bg-red-200 text-red-800'
                        }`}>
                          {order.estado}
                        </span>
                        <button
                          className="text-xs p-1 text-gray-500 hover:text-blue-600"
                          title="Copiar info"
                          onClick={() => {
                            const info = `Nombre y apellido: ${order.datosPersonales?.nombre || ''}\nDomicilio (calle y número): ${order.envio?.direccion?.split(',')[0] || ''}\nCasa o Departamento: ${order.envio?.direccion?.split(',')[1]?.trim() || ''}\nLocalidad: ${order.envio?.direccion?.split(',')[2]?.trim() || ''}\nCódigo postal: ${order.envio?.direccion?.split(',')[3]?.trim() || ''}\nProvincia: ${order.envio?.direccion?.split(',')[4]?.trim() || ''}\nTeléfono: ${order.datosPersonales?.telefono || ''}\nDNI: ${order.datosPersonales?.dni || ''}\nMail: ${order.datosPersonales?.email || ''}`;
                            navigator.clipboard.writeText(info);
                          }}
                        >
                          <FaRegCopy size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="text-xs">
                        <span className="font-semibold">Pago:</span> {order.pago}
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold">Envío:</span> 
                        <span 
                          className="cursor-help" 
                          title={order.envio?.tipo || ''}
                        >
                          {order.envio?.tipo ? 
                            (order.envio.tipo.length > 8 ? `${order.envio.tipo.substring(0, 8)}...` : order.envio.tipo) 
                            : 'Sin envío'
                          }
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold">Fecha:</span> {new Date(order.fechaCreacion).toLocaleDateString('es-AR')}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold mb-2">Productos:</h4>
                      <div className="space-y-2">
                        {order.productos.map(p => (
                          <div key={p.productoId + (p.talle || '')} className="flex flex-col gap-2 text-xs">
                            <div className="flex items-start gap-2">
                              {p.imagen ? (
                                <img src={p.imagen} alt={p.nombre} className="w-6 h-6 object-cover rounded" />
                              ) : (
                                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                                  <span className="text-xs">📦</span>
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="font-medium">{p.nombre}</div>
                                {p.talle && <div>Talle: {p.talle}</div>}
                                {p.color && <div>Color: {p.color}</div>}
                                <div>Cantidad: {p.cantidad} - ${p.precio} USD</div>
                                {p.link && (
                                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    Ver link
                                  </a>
                                )}
                                {p.detalles && <div className="italic text-gray-600 dark:text-gray-400">"{p.detalles}"</div>}
                              </div>
                            </div>
                            {/* Fotos del producto */}
                            {p.fotos && p.fotos.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {p.fotos.map((foto, idx) => (
                                  <a 
                                    key={idx} 
                                    href={foto.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <img 
                                      src={foto.url} 
                                      alt={`Foto ${idx + 1}`} 
                                      className="w-16 h-16 object-cover rounded border border-gray-300 hover:border-blue-500 transition-colors cursor-pointer"
                                    />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <select
                        value={order.estado}
                        onChange={e => cambiarEstado(order._id, e.target.value)}
                        className="w-full border border-gray-300 dark:border-dark-border rounded px-2 py-1 bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text text-xs"
                        disabled={changing === order._id}
                      >
                        {estados.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                      
                      {order.estado === 'enviado' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            className="w-full border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Link o número de trackeo"
                            value={trackingInputs[order._id] !== undefined ? trackingInputs[order._id] : (order.tracking || '')}
                            onChange={e => setTrackingInputs(inputs => ({ ...inputs, [order._id]: e.target.value }))}
                            disabled={savingTracking === order._id}
                          />
                          <button
                            className="w-full px-2 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50"
                            onClick={() => guardarTracking(order._id)}
                            disabled={savingTracking === order._id || !trackingInputs[order._id]}
                          >
                            {savingTracking === order._id ? 'Guardando...' : 'Guardar tracking'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden lg:block">
                <table className="w-full border border-gray-200 dark:border-dark-border text-sm bg-white dark:bg-dark-card shadow rounded">
                  <thead className="bg-gray-50 dark:bg-dark-bg">
                    <tr>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold w-[15%]">Cliente</th>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold w-[25%]">Productos</th>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold w-[8%]">Pago</th>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold w-[12%]">Envío</th>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold w-[10%]">Fecha</th>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold w-[8%]">Estado</th>
                      <th className="p-3 text-left text-gray-900 dark:text-dark-text font-semibold w-[12%]">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map(order => (
                      <tr key={order._id} className="border-t border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg">
                        <td className="p-3 align-top">
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
                            <div className="space-y-0.5 pr-5 text-gray-900 dark:text-white text-xs">
                              <div 
                                className="font-semibold cursor-help" 
                                title={order.datosPersonales?.nombre || 'Sin nombre'}
                              >
                                {order.datosPersonales?.nombre ? 
                                  (order.datosPersonales.nombre.length > 20 ? `${order.datosPersonales.nombre.substring(0, 20)}...` : order.datosPersonales.nombre) 
                                  : 'Sin nombre'
                                }
                              </div>
                              <div 
                                className="text-gray-600 dark:text-white cursor-help" 
                                title={`Tel: ${order.datosPersonales?.telefono || 'Sin teléfono'}`}
                              >
                                Tel: {order.datosPersonales?.telefono ? 
                                  (order.datosPersonales.telefono.length > 15 ? `${order.datosPersonales.telefono.substring(0, 15)}...` : order.datosPersonales.telefono) 
                                  : 'Sin teléfono'
                                }
                              </div>
                              <div 
                                className="text-gray-600 dark:text-white cursor-help" 
                                title={`Email: ${order.datosPersonales?.email || 'Sin email'}`}
                              >
                                Email: {order.datosPersonales?.email ? 
                                  (order.datosPersonales.email.length > 20 ? `${order.datosPersonales.email.substring(0, 20)}...` : order.datosPersonales.email) 
                                  : 'Sin email'
                                }
                              </div>
                              <div 
                                className="text-gray-600 dark:text-white cursor-help" 
                                title={`DNI: ${order.datosPersonales?.dni || 'Sin DNI'}`}
                              >
                                DNI: {order.datosPersonales?.dni || 'Sin DNI'}
                              </div>
                              <div 
                                className="text-gray-600 dark:text-white cursor-help" 
                                title={`Domicilio: ${order.envio?.direccion?.split(',')[0] || ''}`}
                              >
                                Domicilio: {order.envio?.direccion?.split(',')[0] ? 
                                  (order.envio.direccion.split(',')[0].length > 18 ? `${order.envio.direccion.split(',')[0].substring(0, 18)}...` : order.envio.direccion.split(',')[0]) 
                                  : ''
                                }
                              </div>
                              <div 
                                className="text-gray-600 dark:text-white cursor-help" 
                                title={`Casa/Depto: ${order.envio?.direccion?.split(',')[1]?.trim() || ''}`}
                              >
                                Casa/Depto: {order.envio?.direccion?.split(',')[1]?.trim() ? 
                                  (order.envio.direccion.split(',')[1].trim().length > 15 ? `${order.envio.direccion.split(',')[1].trim().substring(0, 15)}...` : order.envio.direccion.split(',')[1].trim()) 
                                  : ''
                                }
                              </div>
                              <div 
                                className="text-gray-600 dark:text-white cursor-help" 
                                title={`Localidad: ${order.envio?.direccion?.split(',')[2]?.trim() || ''}`}
                              >
                                Localidad: {order.envio?.direccion?.split(',')[2]?.trim() ? 
                                  (order.envio.direccion.split(',')[2].trim().length > 15 ? `${order.envio.direccion.split(',')[2].trim().substring(0, 15)}...` : order.envio.direccion.split(',')[2].trim()) 
                                  : ''
                                }
                              </div>
                              <div 
                                className="text-gray-600 dark:text-white cursor-help" 
                                title={`CP: ${order.envio?.direccion?.split(',')[3]?.trim() || ''}`}
                              >
                                CP: {order.envio?.direccion?.split(',')[3]?.trim() ? 
                                  (order.envio.direccion.split(',')[3].trim().length > 12 ? `${order.envio.direccion.split(',')[3].trim().substring(0, 12)}...` : order.envio.direccion.split(',')[3].trim()) 
                                  : ''
                                }
                              </div>
                              <div 
                                className="text-gray-600 dark:text-white cursor-help" 
                                title={`Provincia: ${order.envio?.direccion?.split(',')[4]?.trim() || ''}`}
                              >
                                Provincia: {order.envio?.direccion?.split(',')[4]?.trim() ? 
                                  (order.envio.direccion.split(',')[4].trim().length > 12 ? `${order.envio.direccion.split(',')[4].trim().substring(0, 12)}...` : order.envio.direccion.split(',')[4].trim()) 
                                  : ''
                                }
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {order.productos.map(p => (
                              <div key={p.productoId + (p.talle || '')} className="flex flex-col gap-2 border-b border-gray-100 dark:border-gray-700 pb-2 last:border-b-0">
                                <div className="flex items-start gap-2">
                                  {p.imagen ? (
                                    <img src={p.imagen} alt={p.nombre} className="w-6 h-6 object-cover rounded flex-shrink-0" />
                                  ) : (
                                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">📦</span>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div 
                                      className="font-medium text-gray-900 dark:text-white text-xs cursor-help" 
                                      title={p.nombre}
                                    >
                                      {p.nombre.length > 25 ? `${p.nombre.substring(0, 25)}...` : p.nombre}
                                      {p.encargo && (
                                        <span className="ml-1 px-1 py-0.5 rounded bg-blue-200 text-blue-800 text-xs font-semibold">Encargo</span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-300">
                                      {p.talle && <span>Talle: {p.talle} </span>}
                                      {p.color && <span>Color: {p.color} </span>}
                                      <span>Cant: {p.cantidad} - ${p.precio} USD</span>
                                    </div>
                                    {p.link && (
                                      <a 
                                        href={p.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                        title={p.link}
                                      >
                                        {p.link.length > 25 ? `${p.link.substring(0, 25)}...` : p.link}
                                      </a>
                                    )}
                                    {p.detalles && (
                                      <div 
                                        className="text-xs text-gray-600 dark:text-gray-400 italic cursor-help" 
                                        title={`"${p.detalles}"`}
                                      >
                                        "{p.detalles.length > 30 ? `${p.detalles.substring(0, 30)}...` : p.detalles}"
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {/* Fotos del producto */}
                                {p.fotos && p.fotos.length > 0 && (
                                  <div className="flex flex-wrap gap-1 ml-8">
                                    {p.fotos.map((foto, idx) => (
                                      <a 
                                        key={idx} 
                                        href={foto.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block"
                                        title={`Click para ver imagen completa`}
                                      >
                                        <img 
                                          src={foto.url} 
                                          alt={`Foto ${idx + 1} de ${p.nombre}`} 
                                          className="w-12 h-12 object-cover rounded border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer hover:scale-110 transform"
                                        />
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 align-top text-gray-900 dark:text-dark-text text-xs capitalize">
                          {order.pago}
                        </td>
                        <td className="p-3 align-top">
                          <div 
                            className="capitalize font-medium text-gray-900 dark:text-dark-text text-xs cursor-help" 
                            title={order.envio?.tipo || ''}
                          >
                            {order.envio?.tipo ? 
                              (order.envio.tipo.length > 8 ? `${order.envio.tipo.substring(0, 8)}...` : order.envio.tipo) 
                              : 'Sin envío'
                            }
                          </div>
                          {order.envio?.direccion && (
                            <div 
                              className="text-xs text-gray-500 dark:text-dark-text-secondary truncate mt-1 cursor-help" 
                              title={order.envio.direccion}
                            >
                              {order.envio.direccion.split(',')[0].length > 12 ? 
                                `${order.envio.direccion.split(',')[0].substring(0, 12)}...` : 
                                order.envio.direccion.split(',')[0]
                              }
                            </div>
                          )}
                        </td>
                        <td className="p-3 align-top text-gray-900 dark:text-white text-xs">
                          {(() => {
                            const fecha = new Date(order.fechaCreacion);
                            const ahora = new Date();
                            const diffMs = ahora - fecha;
                            const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                            const fechaStr = fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                            return (
                              <div>
                                <div>{fechaStr}</div>
                                <div className="text-gray-500 dark:text-gray-300">Hace {diffDias} día{diffDias !== 1 ? 's' : ''}</div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="p-3 align-top">
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
                        <td className="p-3 align-top">
                          <div className="space-y-2">
                            <select
                              value={order.estado}
                              onChange={e => cambiarEstado(order._id, e.target.value)}
                              className="w-full border border-gray-300 dark:border-dark-border rounded px-2 py-1 bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text text-xs"
                              disabled={changing === order._id}
                            >
                              {estados.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                            {changing === order._id && <div className="text-xs text-blue-500">Actualizando...</div>}
                            {/* Tracking input si estado es enviado */}
                            {order.estado === 'enviado' && (
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  className="w-full border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Tracking"
                                  value={trackingInputs[order._id] !== undefined ? trackingInputs[order._id] : (order.tracking || '')}
                                  onChange={e => setTrackingInputs(inputs => ({ ...inputs, [order._id]: e.target.value }))}
                                  disabled={savingTracking === order._id}
                                />
                                <button
                                  className="w-full px-2 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50"
                                  onClick={() => guardarTracking(order._id)}
                                  disabled={savingTracking === order._id || !trackingInputs[order._id]}
                                >
                                  {savingTracking === order._id ? 'Guardando...' : 'Guardar'}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-dark-card dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-dark-bg"
                  >
                    Anterior
                  </button>
                  
                  <div className="flex flex-wrap justify-center gap-1">
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
                  </div>
                  
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