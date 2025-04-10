export const sortProductsByAvailability = (products) => {
  if (!products || !Array.isArray(products)) return [];
  
  return [...products].sort((a, b) => {
    // Primero ordenar por disponibilidad
    const aHasStock = a.tallas.some(talla => talla.stock > 0);
    const bHasStock = b.tallas.some(talla => talla.stock > 0);
    
    if (aHasStock && !bHasStock) return -1;
    if (!aHasStock && bHasStock) return 1;
    
    // Si ambos tienen stock o ambos no tienen stock, ordenar por precio
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