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
    return <div>No se encontró la categoría </div>;
  }

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const { categoria } = router.query;

  // Actualizar currentPage cuando cambia la URL
  useEffect(() => {
    if (router.isReady) {
      const page = parseInt(router.query.page) || 1;
      setCurrentPage(page);
    }
  }, [router.query.page, router.isReady]);

  const fetchProductsByCategory = async () => {
    if (!categoria) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/categoria/${categoria}`);
      if (!response.ok) throw new Error("Error al cargar los productos");
      
      const data = await response.json();
      const sortedData = sortProductsByAvailability(data);
      
      setProducts(sortedData);
      setFilteredProducts(sortedData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para aplicar los filtros
  const applyFilters = useCallback((productsToFilter, filters) => {
    if (!productsToFilter || !Array.isArray(productsToFilter)) return [];

    let filtered = [...productsToFilter];

    // Filtro de marca
    if (filters.marca) {
      filtered = filtered.filter(product => 
        product.marca === filters.marca
      );
    }

    // Filtro de talla de ropa
    if (filters.tallaRopa) {
      filtered = filtered.filter(product => 
        product.categoria === "ropa" && 
        product.tallas.some(talla => talla.talla === filters.tallaRopa)
      );
    }

    // Filtro de talla de zapatilla
    if (filters.tallaZapatilla) {
      filtered = filtered.filter(product => 
        product.categoria === "zapatillas" && 
        product.tallas.some(talla => talla.talla === filters.tallaZapatilla)
      );
    }

    // Filtro de accesorio
    if (filters.accesorio) {
      filtered = filtered.filter(product => 
        product.categoria === "accesorios" && 
        product.tallas.some(talla => talla.talla === filters.accesorio)
      );
    }

    // Filtro de precio
    if (filters.precioMin || filters.precioMax) {
      filtered = filtered.filter(product => {
        const precio = parseFloat(product.precio);
        const min = filters.precioMin ? parseFloat(filters.precioMin) : -Infinity;
        const max = filters.precioMax ? parseFloat(filters.precioMax) : Infinity;
        return precio >= min && precio <= max;
      });
    }

    // Filtro de stock
    if (filters.stock) {
      filtered = filtered.filter(product => 
        product.tallas.some(talla => talla.stock > 0)
      );
    }

    // Filtro de disponibilidad - Invertido: 20 días con inmediata
    if (filters.disponibilidad) {
      filtered = filtered.filter(product => {
        const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;
        const hasStock = product.tallas.some(talla => talla.stock > 0);
        
        switch (filters.disponibilidad) {
          case "Entrega inmediata":
            return hasTallas && !product.encargo;
          case "Disponible en 3 días":
            return hasTallas && product.encargo;
          case "Disponible en 20 días":
            return !hasTallas;
          default:
            return true;
        }
      });
    }

    return sortProductsByAvailability(filtered);
  }, []);

  // Cargar productos cuando cambia la categoría
  useEffect(() => {
    if (router.isReady) {
      fetchProductsByCategory();
    }
  }, [categoria, router.isReady]);

  // Función para manejar el cambio de página
  const handlePageChange = (pageNumber) => {
    const newQuery = { ...router.query };
    if (pageNumber === 1) {
      delete newQuery.page;
    } else {
      newQuery.page = pageNumber.toString();
    }

    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  // Efecto para manejar los filtros de URL
  useEffect(() => {
    if (!products.length || !router.isReady) return;

    const filters = {
      marca: router.query.marca,
      disponibilidad: router.query.disponibilidad,
      tallaRopa: router.query.tallaRopa,
      tallaZapatilla: router.query.tallaZapatilla,
      accesorio: router.query.accesorio,
      precioMin: router.query.precioMin,
      precioMax: router.query.precioMax,
      stock: router.query.stock === 'true'
    };

    const filteredResults = applyFilters(products, filters);
    setFilteredProducts(filteredResults);
    
    // Solo resetear la página si hay filtros activos y no estamos en una página específica
    const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');
    if (hasActiveFilters && !router.query.page) {
      setCurrentPage(1);
    }
  }, [router.query, products, router.isReady]);

  // Calcular productos para la página actual
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (!router.isReady) return null;

  return (
    <div className="container flex flex-col py-10 mx-auto lg:flex-row pb-20">
      <aside className="w-full mb-6 lg:w-1/4 lg:mb-0">
        <Filter
          products={products}
          setFilteredProducts={(filters) => {
            const filtered = applyFilters(products, filters);
            setFilteredProducts(filtered);
            setCurrentPage(1); // Reset a la página 1 cuando se aplican filtros
          }}
        />
      </aside>
      <section className="flex flex-col w-full lg:w-3/4">
        {loading ? (
          <div className="flex items-center justify-center mt-[5%]">
            <BounceLoader color="#BE1A1D" />
          </div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : currentProducts.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          <>
            <Card currentProducts={currentProducts} />
            {totalPages > 1 && (
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
