import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import ProductList from "../../components/ProductList";
import TiktokLinksAdmin from "../../components/TiktokLinksAdmin";
import Sidebar from "../../components/Sidebar";
import { BounceLoader } from 'react-spinners';
import useStore from "../../store/store";

const URL = process.env.NEXT_PUBLIC_URL;

export default function AdminDashboard() {
  useAuth();
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [editableProducts, setEditableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchDolarBlue, dolarBlue } = useStore();
  const fetchTimeoutRef = useRef(null);
  const isFetchingRef = useRef(false);
  const fetchCountRef = useRef(0);

  const fetchProducts = useCallback(async () => {
    // If already fetching, don't start another fetch
    if (isFetchingRef.current) {
      console.log('Already fetching products, skipping this request');
      return;
    }

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Set a timeout to prevent multiple rapid fetches
    fetchTimeoutRef.current = setTimeout(async () => {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        // Verificar autenticación antes de hacer la petición
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No hay token de autenticación");
        }
        
        console.log('Fetching products from:', `${URL}/api/productos`);
        const response = await fetch(`${URL}/api/productos`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        console.log('Response status:', response.status);
        
        // Si el token expiró, redirigir al login
        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        
        if (!response.ok) throw new Error("Error al cargar los productos");
        const data = await response.json();
        console.log('Fetched products:', data);
        setProductos(data);
        setEditableProducts(data);
        
        // Increment fetch count to track updates
        fetchCountRef.current += 1;
        console.log('Product list updated, fetch count:', fetchCountRef.current);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        
        // Si el error es de autenticación, redirigir al login
        if (err.message.includes('token') || err.message.includes('autenticación')) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    }, 100); // Reducir el debounce a 100ms para una respuesta más rápida
  }, [router]);

  const fetchProductsFiltered = async (categoria) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${URL}/api/productos/categoria/${categoria}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Error al cargar productos por categoría");
      const data = await response.json();
      setEditableProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Cargar productos
        await fetchProducts();
        
        // Obtener el valor del dólar blue
        await fetchDolarBlue();
        
        // Configurar un intervalo para actualizar el valor del dólar cada 5 minutos
        const interval = setInterval(() => {
          fetchDolarBlue();
        }, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error("Error al inicializar datos:", error);
        setError(error.message);
      }
    };
    
    initializeData();
  }, [fetchDolarBlue]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-100">
      <Sidebar fetchProducts={fetchProducts} />
      <div className="flex-1 w-full p-4 md:p-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-black">Bienvenido al Dashboard </h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white transition duration-300 bg-red-500 rounded hover:bg-red-600 md:text-base"
          >
            Logout
          </button>
        </div>
        <TiktokLinksAdmin />
        {loading ? (
          <div className="flex justify-center mt-[10%]">
            <BounceLoader color="#BE1A1D" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ProductList
            editableProducts={editableProducts}
            setEditableProducts={setEditableProducts}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            fetchProducts={fetchProducts}
            fetchProductsFiltered={fetchProductsFiltered}
          />
        )}
      </div>
    </div>
  );
}
