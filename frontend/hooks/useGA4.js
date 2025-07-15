import { sendGA4Event, GA4_CONFIG } from '../config/ga4';

// Hook personalizado para eventos de GA4
export const useGA4 = () => {
  // Verificar si GA4 está configurado
  const isGA4Configured = !!GA4_CONFIG.MEASUREMENT_ID;
  
  // Función para enviar eventos a GA4
  const sendEvent = (eventName, parameters = {}) => {
    if (isGA4Configured) {
      sendGA4Event(eventName, parameters);
    } else {
      console.warn('GA4 no está configurado. Agrega NEXT_PUBLIC_GA4_MEASUREMENT_ID a tus variables de entorno.');
    }
  };

  // Evento: Ver producto
  const viewItem = (item) => {
    sendEvent('view_item', {
      currency: 'USD',
      value: item.precio,
      items: [{
        item_id: item.productoId,
        item_name: item.nombre,
        price: item.precio,
        currency: 'USD',
        item_category: item.categoria || 'general',
        ...(item.talle && { item_variant: item.talle })
      }]
    });
  };

  // Evento: Agregar al carrito
  const addToCart = (item) => {
    sendEvent('add_to_cart', {
      currency: 'USD',
      value: item.precio * item.cantidad,
      items: [{
        item_id: item.productoId,
        item_name: item.nombre,
        price: item.precio,
        quantity: item.cantidad,
        currency: 'USD',
        item_category: item.categoria || 'general',
        ...(item.talle && { item_variant: item.talle })
      }]
    });
  };

  // Evento: Quitar del carrito
  const removeFromCart = (item) => {
    sendEvent('remove_from_cart', {
      currency: 'USD',
      value: item.precio * item.cantidad,
      items: [{
        item_id: item.productoId,
        item_name: item.nombre,
        price: item.precio,
        quantity: item.cantidad,
        currency: 'USD',
        item_category: item.categoria || 'general',
        ...(item.talle && { item_variant: item.talle })
      }]
    });
  };

  // Evento: Ver carrito
  const viewCart = (items, total) => {
    sendEvent('view_cart', {
      currency: 'USD',
      value: total,
      items: items.map(item => ({
        item_id: item.productoId,
        item_name: item.nombre,
        price: item.precio,
        quantity: item.cantidad,
        currency: 'USD',
        item_category: item.categoria || 'general',
        ...(item.talle && { item_variant: item.talle })
      }))
    });
  };

  // Evento: Iniciar checkout
  const beginCheckout = (items, total) => {
    sendEvent('begin_checkout', {
      currency: 'USD',
      value: total,
      items: items.map(item => ({
        item_id: item.productoId,
        item_name: item.nombre,
        price: item.precio,
        quantity: item.cantidad,
        currency: 'USD',
        item_category: item.categoria || 'general',
        ...(item.talle && { item_variant: item.talle })
      }))
    });
  };

  // Evento: Completar compra
  const purchase = (orderData, items, total) => {
    sendEvent('purchase', {
      transaction_id: orderData.transactionId || `order_${Date.now()}`,
      value: total,
      currency: 'USD',
      tax: 0, // Si aplica impuestos
      shipping: 0, // Envío gratis
      items: items.map(item => ({
        item_id: item.productoId,
        item_name: item.nombre,
        price: item.precio,
        quantity: item.cantidad,
        currency: 'USD',
        item_category: item.categoria || 'general',
        ...(item.talle && { item_variant: item.talle })
      }))
    });
  };

  // Evento: Buscar productos
  const search = (searchTerm) => {
    sendEvent('search', {
      search_term: searchTerm
    });
  };

  // Evento: Ver lista de productos
  const viewItemList = (items, listName) => {
    sendEvent('view_item_list', {
      item_list_name: listName,
      items: items.map(item => ({
        item_id: item.productoId,
        item_name: item.nombre,
        price: item.precio,
        currency: 'USD',
        item_category: item.categoria || 'general',
        ...(item.talle && { item_variant: item.talle })
      }))
    });
  };

  return {
    sendEvent,
    viewItem,
    addToCart,
    removeFromCart,
    viewCart,
    beginCheckout,
    purchase,
    search,
    viewItemList
  };
}; 