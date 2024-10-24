import { useAuth } from "../../../frontend/hooks/useAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProductList from "../../../frontend/components/ProductList";
import TiktokLinksAdmin from "../../../frontend/components/TiktokLinksAdmin";
import Sidebar from "../../../frontend/components/Sidebar";
import { API_URL } from "@/config";

export default function AdminDashboard() {
  useAuth();
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [editableProducts, setEditableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://web-production-780d.up.railway.app/api/productos`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al cargar los productos");
      }
      const data = await response.json();
      setProductos(data);
      setEditableProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProductsFiltered = async (categoria) => {
    setLoading(true);
    try {
      const response = await fetch(`https://web-production-780d.up.railway.app/api/productos/categoria/${categoria}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
    
      if (!response.ok) {
        throw new Error("Error al cargar los productos filtrados por categoría");
      }
      const data = await response.json();
      setEditableProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-100">
      <Sidebar
        handleLogout={handleLogout}
        fetchProducts={fetchProducts}
      />
      <div className="flex-1 w-full p-4 md:p-10">
        <h2 className="mb-6 text-2xl font-semibold text-black">Bienvenido al Dashboard</h2>

        <TiktokLinksAdmin />

        {loading ? (
          <p>Cargando productos...</p>
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
