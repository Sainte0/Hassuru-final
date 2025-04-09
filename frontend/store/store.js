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
      const formData = new FormData();
      
      Object.keys(productoAEnviar).forEach(key => {
        if (key === 'tallas' || key === 'colores') {
          formData.append(key, JSON.stringify(productoAEnviar[key]));
        } else if (key === 'encargo' || key === 'destacado' || key === 'destacado_zapatillas') {
          formData.append(key, productoAEnviar[key].toString());
        } else {
          formData.append(key, productoAEnviar[key]);
        }
      });
      
      if (imagenFile) {
        formData.append('image', imagenFile);
      }
      
      const response = await fetch(`${URL}/api/productos`, {
        method: 'POST',
        headers: {
          'Authorization': getToken(),
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta del servidor:', errorData);
        throw new Error(errorData.error || 'Error al agregar el producto ');
      }
      
      const nuevoProducto = await response.json();
      
      set((state) => ({
        products: [...state.products, nuevoProducto],
      }));
      
      toast.success('Producto agregado con éxito');
      
      return nuevoProducto;
    } catch (error) {
      set({ error: error.message });
      console.error('Error al agregar el producto:', error);
      toast.error(error.message || 'Error al agregar el producto');
      throw error;
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
    // Si ya tenemos un valor para dolarBlue y la última actualización fue hace menos de 5 minutos, no hacer la solicitud
    const now = Date.now();
    const lastUpdate = localStorage.getItem('dolarBlueLastUpdate');
    const cachedValue = localStorage.getItem('dolarBlueValue');
    
    if (lastUpdate && cachedValue && now - parseInt(lastUpdate) < 5 * 60 * 1000) {
      set({ dolarBlue: parseFloat(cachedValue) });
      return;
    }
    
    set({ loading: true });
    
    // Implementar un mecanismo de reintento
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const response = await fetch('https://dolarapi.com/v1/dolares/blue');
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        
        // Guardar en caché
        localStorage.setItem('dolarBlueValue', data.venta.toString());
        localStorage.setItem('dolarBlueLastUpdate', now.toString());
        
        set({ dolarBlue: data.venta });
        break;
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          set({ error: error.message });
          // Si tenemos un valor en caché, usarlo como fallback
          if (cachedValue) {
            set({ dolarBlue: parseFloat(cachedValue) });
          }
        } else {
          // Esperar antes de reintentar (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        }
      }
    }
    
    set({ loading: false });
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
