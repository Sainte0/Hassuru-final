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

  // Efecto para manejar la navegación inicial
  useEffect(() => {
    if (!router.isReady) return;

    // Recuperar la página guardada al cargar la página
    const savedPage = sessionStorage.getItem(`lastPage_${categoria}`);
    const urlPage = parseInt(router.query.page) || 1;
    
    // Si hay una página guardada y no hay página en la URL, actualizar la URL
    if (savedPage && !router.query.page) {
      const page = parseInt(savedPage);
      if (page > 1) {
        router.push(
          {
            pathname: router.pathname,
            query: { ...router.query, page: page.toString() },
          },
          undefined,
          { shallow: true }
        );
      }
    }
    
    // Establecer la página actual
    setCurrentPage(urlPage > 1 ? urlPage : (savedPage ? parseInt(savedPage) : 1));
  }, [router.isReady, categoria, router.query.page]);

  // Efecto para sincronizar la página con la URL y guardar en sessionStorage
  useEffect(() => {
    if (router.isReady && currentPage > 1) {
      sessionStorage.setItem(`lastPage_${categoria}`, currentPage.toString());
      
      // Asegurar que la página esté en la URL
      if (!router.query.page || parseInt(router.query.page) !== currentPage) {
        router.push(
          {
            pathname: router.pathname,
            query: { ...router.query, page: currentPage.toString() },
          },
          undefined,
          { shallow: true }
        );
      }
    }
  }, [currentPage, router.isReady, categoria, router.query.page]);

  // Función para manejar el cambio de página
  const handlePageChange = (pageNumber) => {
    // Actualizar el estado local primero
    setCurrentPage(pageNumber);
    
    // Guardar la página en sessionStorage solo si no es la primera página
    if (pageNumber > 1) {
      sessionStorage.setItem(`lastPage_${categoria}`, pageNumber.toString());
    } else {
      sessionStorage.removeItem(`lastPage_${categoria}`);
    }
    
    // Actualizar la URL
    const newQuery = { ...router.query };
    if (pageNumber === 1) {
      delete newQuery.page;
    } else {
      newQuery.page = pageNumber.toString();
    }

    // Usar push para mantener el historial de navegación
    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );

    // Scroll al inicio de la página
    window.scrollTo(0, 0);
  };

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
