import { useEffect, useState } from 'react';

export default function PedidoExitoso() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    // Intentar recuperar el carrito del localStorage
    const lastCart = localStorage.getItem('lastCart');
    if (lastCart) {
      setProductos(JSON.parse(lastCart));
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8 bg-white dark:bg-dark-bg transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-lg w-full">
        <div className="flex flex-col items-center">
          <div className="bg-green-500 rounded-full p-4 mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center !text-gray-900 dark:!text-white">¡Pedido realizado con éxito!</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center !text-gray-700 dark:!text-gray-300">
            Te contactaremos pronto para coordinar el pago y la entrega.
          </p>
          <div className="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 !text-gray-900 dark:!text-white">Resumen de tu pedido</h2>
            {productos.length === 0 ? <p className="text-gray-600 dark:text-gray-300 !text-gray-600 dark:!text-gray-300">No hay productos.</p> : (
              <div className="space-y-2 w-full">
                {productos.map(item => (
                  <div key={item.productoId + '-' + item.talle} className="flex items-center border rounded p-2 bg-white dark:bg-gray-800">
                    <img src={item.imagen} alt={item.nombre} className="w-12 h-12 object-cover rounded mr-2" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white !text-gray-900 dark:!text-white">{item.nombre}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-300 !text-gray-500 dark:!text-gray-300">Talle: {item.talle}</div>
                      <div className="text-sm text-gray-700 dark:text-gray-200 !text-gray-700 dark:!text-gray-200">Cantidad: {item.cantidad}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white !text-gray-900 dark:!text-white">${item.precio} USD</div>
                      <div className="text-xs text-gray-500 dark:text-gray-300 !text-gray-500 dark:!text-gray-300">${Math.round(item.precioARS).toLocaleString('es-AR')} ARS</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <a
            href="/catalogo"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition mt-2"
          >
            Volver al catálogo
          </a>
        </div>
      </div>
    </div>
  );
} 