import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Card from "./Card";
import Filter from "./Filtro";
import Pagination from "./Pagination";
import { BounceLoader } from 'react-spinners';
import { sortProductsByAvailability } from '../utils/sortProducts';

export default function Catalogo() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  // Efecto para manejar la navegación hacia atrás
  useEffect(() => {
    const handlePopState = () => {
      const savedPage = localStorage.getItem('lastPage_catalogo');
      if (savedPage) {
        const page = parseInt(savedPage);
        setCurrentPage(page);
        const newQuery = { ...router.query, page: page.toString() };
        router.replace(
          {
            pathname: router.pathname,
            query: newQuery,
          },
          undefined,
          { shallow: true }
        );
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [router]);

  // Actualizar currentPage cuando cambia la URL
  useEffect(() => {
    if (router.isReady) {
      const page = parseInt(router.query.page) || 1;
      setCurrentPage(page);
      localStorage.setItem('lastPage_catalogo', page.toString());
    }
  }, [router.query.page, router.isReady]);

  // Función para aplicar filtros
  const applyFilters = useCallback((productsToFilter, filters) => {
    let filtered = [...productsToFilter];

    // Filtro de marca
    if (filters.marca) {
      filtered = filtered.filter(product => product.marca === filters.marca);
    }

    // Filtro de talla de ropa
    if (filters.tallaRopa) {
      filtered = filtered.filter(product => 
        product.categoria === 'ropa' && 
        product.tallas.some(t => t.talla === filters.tallaRopa)
      );
    }

    // Filtro de talla de zapatilla
    if (filters.tallaZapatilla) {
      filtered = filtered.filter(product => 
        product.categoria === 'zapatillas' && 
        product.tallas.some(t => t.talla === filters.tallaZapatilla)
      );
    }

    // Filtro de accesorio
    if (filters.accesorio) {
      filtered = filtered.filter(product => 
        product.categoria === 'accesorios' && 
        product.tallas.some(t => t.talla === filters.accesorio)
      );
    }

    // Filtro de precio mínimo
    if (filters.precioMin) {
      filtered = filtered.filter(product => product.precio >= parseFloat(filters.precioMin));
    }

    // Filtro de precio máximo
    if (filters.precioMax) {
      filtered = filtered.filter(product => product.precio <= parseFloat(filters.precioMax));
    }

    // Filtro de stock
    if (filters.stock) {
      filtered = filtered.filter(product => 
        product.tallas.some(t => t.stock > 0)
      );
    }

    // Filtro de disponibilidad
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

    // Filtro de búsqueda
    if (filters.q) {
      const searchQuery = filters.q.toLowerCase();
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchQuery) ||
        (product.marca && product.marca.toLowerCase().includes(searchQuery)) ||
        (product.descripcion && product.descripcion.toLowerCase().includes(searchQuery))
      );
    }

    return sortProductsByAvailability(filtered);
  }, []);

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos`);
        if (!response.ok) {
          throw new Error('Error al cargar los productos');
        }
        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Efecto para manejar los filtros de URL y búsqueda
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
      stock: router.query.stock === 'true',
      q: router.query.q
    };

    const filteredResults = applyFilters(products, filters);
    setFilteredProducts(filteredResults);
    
    // No resetear la página cuando hay filtros activos
    // La página se mantendrá según lo guardado en localStorage
  }, [router.query, products, router.isReady, applyFilters]);

  // Función para manejar el cambio de página
  const handlePageChange = (pageNumber) => {
    const newQuery = { ...router.query };
    if (pageNumber === 1) {
      delete newQuery.page;
    } else {
      newQuery.page = pageNumber.toString();
    }

    localStorage.setItem('lastPage_catalogo', pageNumber.toString());
    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
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
    <div className="container flex flex-col py-10 mx-auto lg:flex-row">
      <aside className="w-full mb-6 lg:w-1/4 lg:mb-0">
        <Filter
          products={products}
          setFilteredProducts={(newFilters) => {
            const filtered = applyFilters(products, newFilters);
            setFilteredProducts(filtered);
          }}
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
              onPageChange={handlePageChange}
              totalPages={totalPages}
            />
          </>
        )}
      </section>
    </div>
  );
}
