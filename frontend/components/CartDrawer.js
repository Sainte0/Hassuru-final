import React from 'react';
import { useCartStore } from '../store/cartStore';
import useStore from '../store/store';

export default function CartDrawer({ open, onClose, cart, onProceed }) {
  const { removeFromCart } = useCartStore();
  const { dolarBlue } = useStore();

  // Calcular totales
  const totalUSD = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const totalARS = cart.reduce((acc, item) => {
    const itemTotal = item.precio * item.cantidad;
    return acc + (dolarBlue ? itemTotal * dolarBlue : 0);
  }, 0);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`fixed inset-y-0 right-0 max-w-full flex transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900">Carrito de compras</h2>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
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
                  <ul className="-my-6 divide-y divide-gray-200">
                    {cart.map((item) => (
                      <li key={item._id} className="py-6 flex">
                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                          <img
                            src={item.imagen || '/placeholder.jpg'}
                            alt={item.nombre}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>

                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>{item.nombre}</h3>
                              <p className="ml-4">${item.precio} USD</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{item.marca}</p>
                          </div>
                          <div className="flex-1 flex items-end justify-between text-sm">
                            <div className="flex items-center">
                              <button
                                onClick={() => onUpdateQuantity(item._id, Math.max(0, item.cantidad - 1))}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                -
                              </button>
                              <span className="mx-2 text-gray-500">Cantidad: {item.cantidad}</span>
                              <button
                                onClick={() => onUpdateQuantity(item._id, item.cantidad + 1)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                +
                              </button>
                            </div>
                            <div className="flex flex-col items-end">
                              <p className="text-gray-500">${(item.precio * item.cantidad).toFixed(2)} USD</p>
                              {dolarBlue && (
                                <p className="text-gray-500">${(item.precio * item.cantidad * dolarBlue).toFixed(2)} ARS</p>
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

            <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <div className="flex flex-col items-end">
                  <p>${cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0).toFixed(2)} USD</p>
                  {dolarBlue && (
                    <p>${totalARS.toFixed(2)} ARS</p>
                  )}
                </div>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">Envío e impuestos calculados al finalizar la compra.</p>
              <div className="mt-6">
                <button
                  onClick={onProceed}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800"
                >
                  Realizar pedido
                </button>
              </div>
              <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                <p>
                  o{' '}
                  <button
                    type="button"
                    className="text-black font-medium hover:text-gray-800"
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