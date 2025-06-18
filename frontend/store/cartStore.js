import { create } from 'zustand';

export const useCartStore = create(set => ({
  cart: [],
  addToCart: (producto) => set(state => {
    const idx = state.cart.findIndex(p => p.productoId === producto.productoId);
    if (idx > -1) {
      // Si ya está, suma cantidad
      const newCart = [...state.cart];
      newCart[idx].cantidad += producto.cantidad;
      return { cart: newCart };
    }
    return { cart: [...state.cart, producto] };
  }),
  removeFromCart: (productoId) => set(state => ({
    cart: state.cart.filter(p => p.productoId !== productoId)
  })),
  clearCart: () => set({ cart: [] })
})); 