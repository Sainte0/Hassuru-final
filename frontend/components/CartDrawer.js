import React from 'react';
import { useCartStore } from '../store/cartStore';
import useStore from '../store/store';

export default function CartDrawer({ open, onClose, cart, onProceed }) {
  const { removeFromCart, addToCart } = useCartStore();
  const { dolarBlue } = useStore();

  // Calcular totales
  const totalUSD = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const totalARS = cart.reduce((acc, item) => {
    const itemTotal = item.precio * item.cantidad;
    return acc + (dolarBlue ? itemTotal * dolarBlue : 0);
  }, 0);

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      addToCart(itemId, newQuantity);
    } else {
      removeFromCart(itemId);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`fixed inset-y-0 right-0 max-w-full flex transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl transition-colors duration-300">
            <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Carrito de compras</h2>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  onClick={onClose}
                >
                  <span className="sr-only">Cerrar panel</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-8">
                <div className="flow-root">
                  <ul className="-my-6 divide-y divide-gray-200 dark:divide-gray-700">
                    {cart.map((item) => (
                      <li key={item._id} className="py-6 flex">
                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden">
                          <img
                            src={item.imagen || '/placeholder.jpg'}
                            alt={item.nombre}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>

                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                              <h3>{item.nombre}</h3>
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.marca}</p>
                            {item.talle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Talle: {item.talle}</p>}
                          </div>
                          <div className="flex-1 flex items-end justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => {
                                  if (item.cantidad > 1) {
                                    addToCart({ ...item, cantidad: -1 });
                                  }
                                }}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                disabled={item.cantidad <= 1}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="text-gray-500 dark:text-gray-400">Cantidad: {item.cantidad}</span>
                              <button
                                onClick={() => addToCart({ ...item, cantidad: 1 })}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                              <button
                                onClick={() => removeFromCart(item.productoId, item.talle)}
                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Eliminar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <p className="text-gray-900 dark:text-white font-medium">${(item.precio * item.cantidad).toFixed(2)} USD</p>
                              {dolarBlue && (
                                <p className="text-gray-500 dark:text-gray-400 text-xs">${(item.precio * item.cantidad * dolarBlue).toFixed(2)} ARS</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 py-6 px-4 sm:px-6">
              <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                <p>Subtotal</p>
                <div className="flex flex-col items-end">
                  <p>${cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0).toFixed(2)} USD</p>
                  {dolarBlue && (
                    <p>${totalARS.toFixed(2)} ARS</p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={onProceed}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black dark:bg-gray-900 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                >
                  Realizar pedido
                </button>
              </div>
              <div className="mt-6 flex justify-center text-sm text-center text-gray-500 dark:text-gray-400">
                <p>
                  o{' '}
                  <button
                    type="button"
                    className="text-black dark:text-white font-medium hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                    onClick={onClose}
                  >
                    Continuar comprando<span aria-hidden="true"> &rarr;</span>
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 