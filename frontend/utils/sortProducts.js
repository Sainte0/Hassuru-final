export const sortProductsByAvailability = (products) => {
  if (!Array.isArray(products)) return [];
  
  return [...products].sort((a, b) => {
    const getDisponibilidadPrioridad = (product) => {
      // Verificar si el producto tiene tallas válidas
      const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;
      
      // Asignar prioridades
      if (hasTallas && !product.encargo) return 0;     // Entrega inmediata
      if (hasTallas && product.encargo) return 1;      // Disponible en 3 días
      return 2;                                        // Disponible en 20 días
    };

    const prioridadA = getDisponibilidadPrioridad(a);
    const prioridadB = getDisponibilidadPrioridad(b);

    return prioridadA - prioridadB;
  });
};