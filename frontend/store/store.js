import { toast } from 'react-hot-toast';
import { create } from 'zustand';

const useStore = create((set) => ({
  products: [],
  product: null,
  dolarBlue: null,
  loading: false,
  error: null,
  productAdded: false,
  filteredProducts: [],
  tiktokLinks: [],

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const response = await fetch(`http://localhost:5000/api/productos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error al cargar los productos');
      }
      const data = await response.json();
      set({ products: data });
    } catch (error) {
      set({ error: error.message });
      console.error('Error al cargar los productos:', error);
    } finally {
      set({ loading: false });
    }
  },

  addProduct: async (productoAEnviar, imagenFile) => {
    set({ loading: true });
    try {
      const response = await fetch(`http://localhost:5000/api/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(productoAEnviar),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta del servidor:', errorData);
        toast.error(`Error al agregar el producto: ${errorData.message || 'Error desconocido'}`);
        return;
      }
      const nuevoProducto = await response.json();
      if (imagenFile) {
        const formData = new FormData();
        formData.append('image', imagenFile);
        const imagenResponse = await fetch(`http://localhost:5000/api/productos/${nuevoProducto._id}/imagen`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
        if (!imagenResponse.ok) {
          const imagenErrorData = await imagenResponse.json();
          toast.error(`Error al subir la imagen: ${imagenErrorData.message || 'Error desconocido'}`);
          return;
        }
      }
      toast.success('Producto agregado con éxito');
      set({ productAdded: true });
      await useStore.getState().fetchProducts();
    } catch (error) {
      set({ error: error.message });
      console.error('Error al agregar el producto:', error);
      toast.error('Error al agregar el producto');
    } finally {
      set({ loading: false });
    }
  },

  fetchProductsByCategory: async (categoria) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`http://localhost:5000/api/productos/categoria/${categoria}`);
      if (!response.ok) {
        throw new Error("Error al cargar los productos");
      }
      const data = await response.json();
      set({ products: data, filteredProducts: data });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchProductById: async (id) => {
    set({ loading: true });
    try {
      const response = await fetch(`http://localhost:5000/api/productos/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener el producto');
      }
      const data = await response.json();
      set({ product: data });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchDolarBlue: async () => {
    set({ loading: true });
    try {
      const response = await fetch('https://dolarapi.com/v1/dolares/blue');
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      set({ dolarBlue: data.venta });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
  setFilteredProducts: (filtered) => set({ filteredProducts: filtered }),

  fetchTikTokLinks: async () => {
    set({ loading: true });
    try {
      const response = await fetch(`http://localhost:5000/api/tiktoks`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Error al cargar los enlaces de TikTok');
      }
      const data = await response.json();
      set({ tiktokLinks: data });
    } catch (error) {
      set({ error: error.message });
      console.error('Error al cargar los enlaces de TikTok:', error);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useStore;
