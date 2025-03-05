import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Card from "./Card";
import Filter from "./Filtro";
import Pagination from "./Pagination";
import { BounceLoader } from 'react-spinners';

export default function Catalogo() {
  const router = useRouter();
  const { search } = router.query;
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/productos');
      const data = await response.json();

      // Ordenar productos por disponibilidad
      const sortedProducts = data.sort((a, b) => {
        const disponibilidadOrder = {
          "Entrega inmediata": 0,
          "Disponible en 3 días": 1,
          "Disponible en 20 días": 2
        };

        const dispA = getDisponibilidad(a);
        const dispB = getDisponibilidad(b);

        return disponibilidadOrder[dispA] - disponibilidadOrder[dispB];
      });

      setProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
    } catch (error) {
      setError("No pudimos cargar los productos. Por favor, intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const getDisponibilidad = (product) => {
    const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;

    if (hasTallas && product.encargo) {
      return "Disponible en 3 días";
    } else if (hasTallas) {
      return "Entrega inmediata";
    } else {
      return "Disponible en 20 días";
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (search) {
      const searchQuery = search.toLowerCase();
      const filtered = products.filter(product =>
        product.nombre.toLowerCase().includes(searchQuery)
      );
      setFilteredProducts(filtered);
      setCurrentPage(1);
    } else {
      setFilteredProducts(products);
    }
  }, [search, products]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="container flex flex-col py-10 mx-auto lg:flex-row">
      <aside className="w-full mb-6 lg:w-1/4 lg:mb-0">
        <Filter
          products={products}
          setFilteredProducts={setFilteredProducts}
        />
      </aside>
      <section className="w-full lg:w-3/4">
        {loading ? (
          <div className="flex items-center justify-center mt-[15%]">
            <BounceLoader color="#BE1A1D" />
          </div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : currentProducts.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          <>
            <Card currentProducts={currentProducts} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>
    </div>
  );
}
