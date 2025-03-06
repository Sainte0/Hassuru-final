import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Card from "../../../components/Card";
import Filter from "../../../components/Filtro";
import Pagination from "../../../components/Pagination";
import { BounceLoader } from 'react-spinners';
import { sortProductsByAvailability } from '../../../utils/sortProducts';

export default function Categoria() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const router = useRouter();
  const { categoria } = router.query;

  // Nueva función para ordenar productos
  const orderProducts = useCallback((products) => {
    if (!Array.isArray(products)) return [];
    
    return [...products].sort((a, b) => {
      const getValue = (product) => {
        const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;
        if (!hasTallas) return 3;                    // Sin tallas (20 días)
        return product.encargo ? 2 : 1;              // Con encargo (3 días) : Inmediato
      };
      
      return getValue(a) - getValue(b);
    });
  }, []);

  const fetchProductsByCategory = async () => {
    setLoading(true);
    setError(null);
    }
  };

  // Modificamos el manejador de filtros
  const handleFilteredProducts = (newFilteredProducts) => {
    // Aplicamos el ordenamiento después del filtro
    const sortedFiltered = sortProductsByAvailability(newFilteredProducts);
    setFilteredProducts(sortedFiltered);
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

  // Efecto para cargar productos cuando cambia la categoría
  useEffect(() => {
    if (categoria) {
      fetchProductsByCategory();
      setCurrentPage(1);
    }
  }, [categoria]);

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
            const sortedProducts = sortProductsByAvailability(newProducts);
            setFilteredProducts(sortedProducts);
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
          onPageChange={(page) => setCurrentPage(page)}
        />
      </section>
    </div>
  );
}
