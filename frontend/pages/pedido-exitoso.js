export default function PedidoExitoso() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">¡Pedido realizado con éxito!</h1>
      <p className="mb-4">Te contactaremos pronto para coordinar el pago y la entrega.</p>
      <a href="/catalogo" className="text-blue-600 underline">Volver al catálogo</a>
    </div>
  );
} 