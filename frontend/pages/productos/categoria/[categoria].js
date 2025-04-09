import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Card from "../../../components/Card";
import Filter from "../../../components/Filtro";
import Pagination from "../../../components/Pagination";
import { BounceLoader } from 'react-spinners';
import { sortProductsByAvailability } from '../../../utils/sortProducts';

export default function Categoria() {
  const router = useRouter();
  
  if (router.isFallback) {
    return <div>Cargando...</div>;
  }

  if (!router.query.categoria) {
    return <div>No se encontró la categoría</div>;
  }

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const { categoria } = router.query;

  const orderProducts = useCallback((products) => {
    if (!Array.isArray(products)) return [];
    
    return [...products].sort((a, b) => {
      const getValue = (product) => {
        const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;
        if (!hasTallas) return 3;
        return product.encargo ? 2 : 1;
      };
      
      return getValue(a) - getValue(b);
    });
  }, []);

  const fetchProductsByCategory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/categoria/${categoria}`);
      if (!response.ok) throw new Error("Error al cargar los productos");
      
      const data = await response.json();
      const orderedData = orderProducts(data);
      
      setProducts(orderedData);
      setFilteredProducts(orderedData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (products.length > 0) {
      const orderedProducts = orderProducts(products);
      setFilteredProducts(orderedProducts);
    }
  }, [products, orderProducts]);

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
    if (categoria) {
      fetchProductsByCategory();
      // Set current page from URL or default to 1
      setCurrentPage(router.query.page ? parseInt(router.query.page) : 1);
    }
  }, [categoria]);

  // Handle page changes by updating URL
  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    // Update URL with page parameter while preserving other query parameters
    const queryParams = { ...router.query, page };
    router.push(
      {
        pathname: router.pathname,
        query: queryParams,
      },
      undefined,
      { shallow: true }
    );
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="container flex flex-col py-10 mx-auto lg:flex-row pb-20">
      <aside className="w-full mb-6 lg:w-1/4 lg:mb-0">
        <Filter
          products={products}
          setFilteredProducts={(newProducts) => {
            const orderedProducts = orderProducts(newProducts);
            setFilteredProducts(orderedProducts);
            // Reset to page 1 when filters change
            if (currentPage !== 1) {
              handlePageChange(1);
            }
          }}
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
          onPageChange={handlePageChange}
        />
      </section>
    </div>
  );
}
