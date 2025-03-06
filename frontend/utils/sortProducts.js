export const sortProductsByAvailability = (products) => {
  if (!Array.isArray(products)) return [];
  
  const getPriority = (product) => {
    const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;
    if (!hasTallas) return 3; // Sin tallas (20 días)
    if (product.encargo) return 2; // Con tallas y encargo (3 días)
    return 1; // Con tallas sin encargo (inmediato)
  };

  return [...products].sort((a, b) => {
        const priorityA = getPriority(a);
    const priorityB = getPriority(b);
    return priorityA - priorityB;
  });
};