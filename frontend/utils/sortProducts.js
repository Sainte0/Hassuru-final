export const sortProductsByAvailability = (products) => {
  return [...products].sort((a, b) => {
    const getDisponibilidadPrioridad = (product) => {
      const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;
      
      if (hasTallas && !product.encargo) return 0;     // Entrega inmediata
      if (hasTallas && product.encargo) return 1;      // 3 días
      return 2;                                        // 20 días
    };

    return getDisponibilidadPrioridad(a) - getDisponibilidadPrioridad(b);
  });
};