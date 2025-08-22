import React, { useState, useEffect } from 'react';

export default function GA4Metrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Aquí podrías hacer una llamada a tu API para obtener métricas de GA4
    // Por ahora, mostramos información básica
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-bg rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Métricas de GA4
      </h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Eventos Implementados
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• <strong>view_item</strong> - Ver producto individual</li>
            <li>• <strong>add_to_cart</strong> - Agregar al carrito</li>
            <li>• <strong>remove_from_cart</strong> - Quitar del carrito</li>
            <li>• <strong>view_cart</strong> - Ver carrito</li>
            <li>• <strong>begin_checkout</strong> - Iniciar checkout</li>
            <li>• <strong>purchase</strong> - Completar compra</li>
            <li>• <strong>search</strong> - Búsqueda de productos</li>
            <li>• <strong>view_item_list</strong> - Ver lista de productos</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
            Métricas Clave Disponibles
          </h4>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
            <li>• <strong>Tasa de conversión</strong> - purchase / sessions</li>
            <li>• <strong>Tasa de agregar al carrito</strong> - add_to_cart / sessions</li>
            <li>• <strong>Tasa de inicio de checkout</strong> - begin_checkout / add_to_cart</li>
            <li>• <strong>Tasa de completar compra</strong> - purchase / begin_checkout</li>
            <li>• <strong>Productos más vistos</strong> - view_item events</li>
            <li>• <strong>Búsquedas populares</strong> - search events</li>
            <li>• <strong>Valor promedio del carrito</strong> - add_to_cart value</li>
            <li>• <strong>Valor promedio de compra</strong> - purchase value</li>
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
            Cómo Ver las Métricas
          </h4>
          <ol className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
            <li>1. Ve a <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Analytics</a></li>
            <li>2. Selecciona tu propiedad: <strong>{process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'No configurado'}</strong></li>
            <li>3. Ve a <strong>Informes</strong> → <strong>Engagement</strong> → <strong>Events</strong></li>
            <li>4. Filtra por los eventos de comercio electrónico</li>
            <li>5. Ve a <strong>Monetization</strong> para ver métricas de ventas</li>
          </ol>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
            Embudo de Conversión
          </h4>
          <div className="text-sm text-purple-800 dark:text-purple-200">
            <p className="mb-2">Flujo típico de conversión:</p>
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-purple-200 dark:bg-purple-700 rounded-full flex items-center justify-center text-xs font-bold mr-2">1</span>
                <span>Sesión → Ver productos</span>
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-purple-200 dark:bg-purple-700 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
                <span>Agregar al carrito (add_to_cart)</span>
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-purple-200 dark:bg-purple-700 rounded-full flex items-center justify-center text-xs font-bold mr-2">3</span>
                <span>Iniciar checkout (begin_checkout)</span>
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-purple-200 dark:bg-purple-700 rounded-full flex items-center justify-center text-xs font-bold mr-2">4</span>
                <span>Completar compra (purchase)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 