import React from 'react';

export default function CartDrawer({ open, onClose, cart, onProceed }) {
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
            <div key={item.productoId} className="flex items-center mb-4">
              <img src={item.imagen} alt={item.nombre} className="w-16 h-16 object-cover rounded mr-2" />
              <div className="flex-1">
                <div className="font-semibold">{item.nombre}</div>
                <div>Cantidad: {item.cantidad}</div>
                <div className="text-sm text-gray-500">${item.precio}</div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t">
        <button className="w-full bg-black text-white py-2 rounded" onClick={onProceed} disabled={cart.length === 0}>
          Proceder al pedido
        </button>
      </div>
    </div>
  );
} 