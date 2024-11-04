import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProductList from "../../components/ProductList";
import TiktokLinksAdmin from "../../components/TiktokLinksAdmin";
import Sidebar from "../../components/Sidebar";
import { BounceLoader } from 'react-spinners';

const URL = process.env.NEXT_PUBLIC_URL;

export default function AdminDashboard() {
  useAuth();
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [editableProducts, setEditableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${URL}/api/productos`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Error al cargar los productos");
      const data = await response.json();
      setProductos(data);
      setEditableProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

 return (
    <div className="flex w-full min-h-screen bg-gray-100">
      <Sidebar handleLogout={handleLogout} fetchProducts={fetchProducts} />
      <div className="flex-1 w-full p-4 md:p-10">
        <h2 className="mb-6 text-2xl font-semibold text-black">Bienvenido al Dashboard</h2>
        <TiktokLinksAdmin />
        {loading ? (
          <div className="flex justify-center mt-[10%]"><BounceLoader color="#BE1A1D" /></div>
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
