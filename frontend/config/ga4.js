// Configuración de Google Analytics 4
export const GA4_CONFIG = {
  // ID de medición de GA4
  MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
  
  // Configuración por defecto
  DEFAULT_CONFIG: {
    currency: 'USD',
    country: 'AR',
    language: 'es'
  },
  
  // Eventos personalizados
  CUSTOM_EVENTS: {
    VIEW_PRODUCT: 'view_item',
    ADD_TO_CART: 'add_to_cart',
    REMOVE_FROM_CART: 'remove_from_cart',
    VIEW_CART: 'view_cart',
    BEGIN_CHECKOUT: 'begin_checkout',
    PURCHASE: 'purchase',
    SEARCH: 'search',
    VIEW_ITEM_LIST: 'view_item_list'
  }
};

// Función para inicializar GA4
export const initGA4 = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA4_CONFIG.MEASUREMENT_ID, {
      ...GA4_CONFIG.DEFAULT_CONFIG,
      page_title: document.title,
      page_location: window.location.href
    });
  }
};

// Función para enviar eventos personalizados
export const sendGA4Event = (eventName, parameters = {}) => {
  if (!GA4_CONFIG.MEASUREMENT_ID) {
    console.warn('GA4 no está configurado. Agrega NEXT_PUBLIC_GA4_MEASUREMENT_ID a tus variables de entorno.');
    return;
  }
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...GA4_CONFIG.DEFAULT_CONFIG,
      ...parameters
    });
    console.log('GA4 Event:', eventName, parameters);
  }
}; 