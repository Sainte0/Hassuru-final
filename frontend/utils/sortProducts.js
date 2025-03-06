export const sortProductsByAvailability = (products) => {
  if (!Array.isArray(products)) return [];

  const sortOrder = {
    'Entrega inmediata': 1,
    'Disponible en 3 días': 2,
    'Disponible en 20 días': 3
  };

  const getProductAvailability = (product) => {
    const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;
    
    if (hasTallas && !product.encargo) return 'Entrega inmediata';
    if (hasTallas && product.encargo) return 'Disponible en 3 días';
    return 'Disponible en 20 días';
  };

  return [...products].sort((a, b) => {
    const availabilityA = getProductAvailability(a);
    const availabilityB = getProductAvailability(b);
    return sortOrder[availabilityA] - sortOrder[availabilityB];
  });
};