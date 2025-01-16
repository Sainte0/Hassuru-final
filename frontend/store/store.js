import { toast } from 'react-hot-toast';
import { create } from 'zustand';

const URL = process.env.NEXT_PUBLIC_URL;
const getToken = () => `Bearer ${localStorage.getItem('token')}`;

const useStore = create((set) => ({
  products: [],
  product: null,
  dolarBlue: null,
  loading: false,
  error: null,
  filteredProducts: [],
  tiktokLinks: [],

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const response = await fetch(`${URL}/api/productos`, {
        method: 'GET',
        headers: {
          'Authorization': getToken(),
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
      const response = await fetch(`${URL}/api/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getToken(),
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
        const imagenResponse = await fetch(`${URL}/api/productos/${nuevoProducto._id}/imagen`, {
          method: 'POST',
          headers: {
            'Authorization': getToken(),
          },
          body: formData,
        });
        if (!imagenResponse.ok) {
          const imagenErrorData = await imagenResponse.json();
          toast.error(`Error al subir la imagen: ${imagenErrorData.message || 'Error desconocido'}`);
          return;
        }
      }
      set((state) => ({
        products: [...state.products, nuevoProducto],
        productAdded: true,
      }));
      toast.success('Producto agregado con éxito');
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
      const response = await fetch(`${URL}/api/productos/categoria/${categoria}`);
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
      const response = await fetch(`${URL}/api/productos/${id}`);
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

  setFilteredProducts: (filtered) => set({ filteredProducts: filtered }),

  fetchTikTokLinks: async () => {
    set({ loading: true });
    try {
      const response = await fetch(`${URL}/api/tiktoks`, {
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

  fetchLogin: async (email, password, router) => {
    try {
      const response = await fetch(`${URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        toast.success("Inicio de sesión exitoso!");
        router.push("/admin");
      } else if (response.status === 400) {
        toast.error("Datos inválidos. Verifica tu email y contraseña.");
      } else {
        toast.error(data.error || "Error al iniciar sesión.");
      }
    } catch (error) {
      toast.error("Error al intentar iniciar sesión.");
      console.error(error);
    }
  },
}));

export default useStore;
