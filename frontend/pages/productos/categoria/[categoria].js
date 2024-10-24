import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Card from "../../../../frontend/components/Card";
import Filter from "../../../../frontend/components/Filtro";
import Pagination from "../../../../frontend/components/Pagination";
import { BounceLoader } from 'react-spinners';
import { API_URL } from "@/config";

export default function Categoria() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const router = useRouter();
  const { categoria } = router.query;

  const fetchProductsByCategory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://web-production-780d.up.railway.app//api/productos/categoria/${categoria}`);
      if (!response.ok) {
        throw new Error("Error al cargar los productos");
      }
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoria) {
      fetchProductsByCategory();
    }
  }, [categoria]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="container flex flex-col py-10 mx-auto lg:flex-row">
      <aside className="w-full mb-6 lg:w-1/4 lg:mb-0">
        <Filter
          products={products}
          setFilteredProducts={setFilteredProducts}
        />
      </aside>
      <section className="flex flex-col w-full lg:w-3/4">
        {loading ? (
          <div className="flex items-center justify-center mt-[5%]"><BounceLoader color="#BE1A1D" /></div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : currentProducts.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          <Card currentProducts={currentProducts} />
        )}
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </section>
    </div>
  );
}
