import React from 'react';
import { useCartStore } from '../store/cartStore';
import useStore from '../store/store';

export default function CartDrawer({ open, onClose, cart, onProceed }) {
  const { removeFromCart } = useCartStore();
  const { dolarBlue } = useStore();

  // Calcular totales
  const totalUSD = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const totalARS = dolarBlue ? (totalUSD * dolarBlue) : null;

  return (
    <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">Carrito</h2>
        <button onClick={onClose}>&times;</button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <p>El carrito está vacío.</p>
        ) : (
          cart.map(item => (
            <div key={item.productoId + '-' + (item.talle || '')} className="flex items-center mb-4 border-b pb-2">
              <img src={item.imagen} alt={item.nombre} className="w-16 h-16 object-cover rounded mr-2" />
              <div className="flex-1">
                <div className="font-semibold">{item.nombre}</div>
                {item.talle && <div className="text-sm text-gray-500">Talle: {item.talle}</div>}
                <div className="text-sm">Cantidad: {item.cantidad}</div>
                <div className="text-sm text-gray-800 font-bold">${item.precio} USD</div>
                {dolarBlue && <div className="text-xs text-gray-500">${(item.precio * dolarBlue).toFixed(2)} ARS</div>}
              </div>
              <button
                className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => removeFromCart(item.productoId, item.talle)}
                title="Eliminar"
              >
                &times;
              </button>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t">
        <div className="mb-2 text-right font-bold">
          Total: ${totalUSD.toFixed(2)} USD{dolarBlue && ` / $${totalARS.toFixed(2)} ARS`}
        </div>
        <button className="w-full bg-black text-white py-2 rounded" onClick={onProceed} disabled={cart.length === 0}>
          Proceder al pedido
        </button>
      </div>
    </div>
  );
} 