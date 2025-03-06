export const sortProductsByAvailability = (products) => {
  if (!Array.isArray(products)) return [];

  return [...products].sort((a, b) => {
    const getPriority = (product) => {
      const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;
      
      // Prioridad:
      // 0: Entrega inmediata (con tallas, sin encargo)
      // 1: 3 días (con tallas, con encargo)
      // 2: 20 días (sin tallas)
      if (hasTallas && !product.encargo) return 0;
      if (hasTallas && product.encargo) return 1;
      return 2;
    };

    const priorityA = getPriority(a);
    const priorityB = getPriority(b);
    return priorityA - priorityB;
  });
};