import { create } from 'zustand';

const getInitialCart = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('cart');
    if (stored) return JSON.parse(stored);
  }
  return [];
};

export const useCartStore = create(set => ({
  cart: getInitialCart(),
  addToCart: (producto) => set(state => {
    const idx = state.cart.findIndex(p => p.productoId === producto.productoId && p.talle === producto.talle);
    let newCart;
    if (idx > -1) {
      newCart = [...state.cart];
      newCart[idx].cantidad += producto.cantidad;
      if (newCart[idx].cantidad <= 0) {
        newCart.splice(idx, 1);
      }
    } else if (producto.cantidad > 0) {
      newCart = [...state.cart, producto];
    } else {
      newCart = [...state.cart];
    }
    if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(newCart));
    return { cart: newCart };
  }),
  removeFromCart: (productoId, talle) => set(state => {
    const newCart = state.cart.filter(p => !(p.productoId === productoId && p.talle === talle));
    if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(newCart));
    return { cart: newCart };
  }),
  clearCart: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('cart');
    return { cart: [] };
  }
})); 