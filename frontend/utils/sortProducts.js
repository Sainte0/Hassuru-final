export const sortProductsByAvailability = (products) => {
  if (!products || !Array.isArray(products)) return [];
  
  return [...products].sort((a, b) => {
    // Función para determinar el grupo de disponibilidad
    const getAvailabilityGroup = (product) => {
      const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;
      const hasStock = product.tallas.some(talla => talla.stock > 0);
      
      if (hasTallas && !product.encargo) return 1; // Entrega inmediata
      if (hasTallas && product.encargo) return 2; // Disponible en 3 días
      if (!hasTallas) return 3; // Disponible en 20 días
      return 4; // Otros casos
    };

    // Primero ordenar por grupo de disponibilidad
    const aGroup = getAvailabilityGroup(a);
    const bGroup = getAvailabilityGroup(b);
    
    if (aGroup !== bGroup) {
      return aGroup - bGroup;
    }
    
    // Si están en el mismo grupo, ordenar por precio
    const aPrice = parseFloat(a.precio);
    const bPrice = parseFloat(b.precio);
    
    return aPrice - bPrice; // Ordenar de menor a mayor precio
  });
};

// Función para ordenar productos solo por precio (menor a mayor)
export const sortProductsByPrice = (products) => {
  if (!products || !Array.isArray(products)) return [];
  
  return [...products].sort((a, b) => {
    const aPrice = parseFloat(a.precio);
    const bPrice = parseFloat(b.precio);
    
    return aPrice - bPrice; // Ordenar de menor a mayor precio
  });
};