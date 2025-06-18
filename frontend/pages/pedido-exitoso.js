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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">¡Pedido realizado con éxito!</h1>
      <p className="mb-4">Te contactaremos pronto para coordinar el pago y la entrega.</p>
      <h2 className="text-lg font-bold mb-2">Resumen de tu pedido</h2>
      {productos.length === 0 ? <p>No hay productos.</p> : (
        <div className="space-y-2 w-full max-w-md">
          {productos.map(item => (
            <div key={item.productoId + '-' + item.talle} className="flex items-center border rounded p-2">
              <img src={item.imagen} alt={item.nombre} className="w-12 h-12 object-cover rounded mr-2" />
              <div className="flex-1">
                <div className="font-semibold">{item.nombre}</div>
                <div className="text-sm text-gray-500">Talle: {item.talle}</div>
                <div className="text-sm">Cantidad: {item.cantidad}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">${item.precio} USD</div>
                <div className="text-xs text-gray-500">${item.precioARS?.toFixed(2)} ARS</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <a href="/catalogo" className="text-blue-600 underline mt-6">Volver al catálogo</a>
    </div>
  );
} 