import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const [currentFilters, setCurrentFilters] = useState({});
  const [pagination, setPagination] = useState(null);
  const { categoria } = router.query;
  
  // Usar ref para evitar dependencias circulares
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;
  
  // Flag para evitar múltiples llamadas simultáneas
  const isLoadingRef = useRef(false);
  
  // Ref para fetchProductsByCategory para usarlo en el event listener
  const fetchProductsByCategoryRef = useRef();

  // Función para restaurar el estado de la página desde la URL
  const restorePageFromURL = useCallback(() => {
    if (!router.isReady) return;

    const urlPage = parseInt(router.query.page) || 1;
    const savedPage = sessionStorage.getItem(`lastPage_${categoria}`);

    // Si hay una página en la URL, usarla
    if (router.query.page) {
      setCurrentPage(urlPage);
      currentPageRef.current = urlPage;
      if (urlPage > 1) {
        sessionStorage.setItem(`lastPage_${categoria}`, urlPage.toString());
      }
    } else if (savedPage) {
      // Si no hay página en la URL pero hay una guardada, restaurarla
      const page = parseInt(savedPage);
      if (page > 1) {
        setCurrentPage(page);
        currentPageRef.current = page;
        // Actualizar la URL para mantener consistencia
        router.push(
          {
            pathname: router.pathname,
            query: { ...router.query, page: page.toString() },
          },
          undefined,
          { shallow: true }
        );
      }
    } else {
      // Si no hay nada, ir a la página 1
      setCurrentPage(1);
      currentPageRef.current = 1;
      sessionStorage.removeItem(`lastPage_${categoria}`);
    }
  }, [router.isReady, router.query.page, router.pathname, router.query, categoria]);

  // Efecto para manejar la navegación inicial y cambios en la URL
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    restorePageFromURL();
  }, [router.isReady, categoria, router.query.page, restorePageFromURL]);

  // Event listener para detectar navegación hacia atrás/adelante
  useEffect(() => {
    const handlePopState = () => {
      // Pequeño delay para asegurar que la URL se actualice
      setTimeout(() => {
        restorePageFromURL();
        // Recargar productos con la página restaurada
        if (fetchProductsByCategoryRef.current) {
          fetchProductsByCategoryRef.current(currentFilters);
        }
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [restorePageFromURL, currentFilters]);

  // Función para manejar el cambio de página
  const handlePageChange = (pageNumber) => {
    // Actualizar el estado local primero
    setCurrentPage(pageNumber);
    currentPageRef.current = pageNumber; // Actualizar el ref inmediatamente
    
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

    // Cargar productos para la nueva página
    setTimeout(() => {
      fetchProductsByCategory(currentFilters);
    }, 0);

    // Scroll al inicio de la página
    window.scrollTo(0, 0);
  };

  const fetchProductsByCategory = useCallback(async (filters = {}) => {
    if (!categoria) {
      return;
    }
    
    // Evitar múltiples llamadas simultáneas
    if (isLoadingRef.current) {
      return;
    }
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Construir query parameters
      const queryParams = new URLSearchParams({
        page: currentPageRef.current.toString(),
        limit: productsPerPage.toString()
      });

      // Agregar todos los filtros al servidor
      if (filters.marca) {
        queryParams.append('marca', filters.marca);
      }
      if (filters.tallaRopa) {
        queryParams.append('tallaRopa', filters.tallaRopa);
      }
      if (filters.tallaZapatilla) {
        queryParams.append('tallaZapatilla', filters.tallaZapatilla);
      }
      if (filters.accesorio) {
        queryParams.append('accesorio', filters.accesorio);
      }
      if (filters.disponibilidad) {
        queryParams.append('disponibilidad', filters.disponibilidad);
      }
      if (filters.precioMin) {
        queryParams.append('precioMin', filters.precioMin);
      }
      if (filters.precioMax) {
        queryParams.append('precioMax', filters.precioMax);
      }
      if (filters.q) {
        queryParams.append('q', filters.q);
      }
      if (filters.sort) {
        queryParams.append('sort', filters.sort);
      }

      const url = `${process.env.NEXT_PUBLIC_URL}/api/productos/categoria/${categoria}?${queryParams}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al cargar los productos");
      
      const data = await response.json();
      
      // Verificar que data tenga la estructura esperada
      if (!data || !data.productos || !Array.isArray(data.productos)) {
        throw new Error('Formato de respuesta inválido del servidor');
      }
      
      setProducts(data.productos);
      setFilteredProducts(data.productos);
      
      // Actualizar paginación
      if (data.pagination) {
        setCurrentPage(data.pagination.currentPage);
        setPagination(data.pagination);
      }
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [categoria, productsPerPage]);

  // Asignar la función al ref para que esté disponible en el event listener
  useEffect(() => {
    fetchProductsByCategoryRef.current = fetchProductsByCategory;
  }, [fetchProductsByCategory]);

  // Función para manejar cambios de filtros
  const handleFiltersChange = useCallback((filters) => {
    // Verificar que los filtros no estén vacíos
    const hasValidFilters = filters && typeof filters === 'object' && Object.values(filters).some(value => value !== '');
    
    if (!hasValidFilters) {
      // Si los filtros están vacíos, extraerlos de la URL
      const urlFilters = {
        marca: router.query.marca || '',
        tallaRopa: router.query.tallaRopa || '',
        tallaZapatilla: router.query.tallaZapatilla || '',
        accesorio: router.query.accesorio || '',
        disponibilidad: router.query.disponibilidad || '',
        precioMin: router.query.precioMin || router.query.min || '',
        precioMax: router.query.precioMax || router.query.max || '',
        q: router.query.q || ''
      };
      setCurrentFilters(urlFilters);
      filters = urlFilters; // Usar los filtros de la URL
    } else {
      setCurrentFilters(filters);
    }
    
    // Resetear a la primera página cuando cambian los filtros
    setCurrentPage(1);
    currentPageRef.current = 1; // Actualizar el ref inmediatamente
    
    // Limpiar la página guardada en sessionStorage
    sessionStorage.removeItem(`lastPage_${categoria}`);
    
    // Actualizar la URL para remover el parámetro de página
    const newQuery = { ...router.query, ...filters };
    delete newQuery.page; // Remover página de la URL
    
    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );
    
    // Llamar fetchProductsByCategory después de actualizar la URL
    setTimeout(() => {
      fetchProductsByCategory(filters);
    }, 100);
  }, [categoria, router]);

  // Efecto consolidado para manejar filtros y carga inicial de productos
  useEffect(() => {
    if (!router.isReady || !categoria) {
      return;
    }
    
    // Extraer filtros de la URL
    const urlFilters = {
      marca: router.query.marca || '',
      tallaRopa: router.query.tallaRopa || '',
      tallaZapatilla: router.query.tallaZapatilla || '',
      accesorio: router.query.accesorio || '',
      disponibilidad: router.query.disponibilidad || '',
      precioMin: router.query.precioMin || router.query.min || '',
      precioMax: router.query.precioMax || router.query.max || '',
      q: router.query.q || '',
      sort: router.query.sort || ''
    };
    
    // Verificar si hay filtros activos
    const hasUrlFilters = Object.values(urlFilters).some(value => value !== '');
    
    if (hasUrlFilters) {
      setCurrentFilters(urlFilters);
    } else {
      setCurrentFilters({});
    }
    
    // Cargar productos con los filtros extraídos
    setTimeout(() => {
      fetchProductsByCategory(urlFilters);
    }, 100);
    
  }, [
    router.isReady, 
    categoria, 
    router.query.marca, 
    router.query.tallaRopa, 
    router.query.tallaZapatilla, 
    router.query.accesorio, 
    router.query.disponibilidad, 
    router.query.precioMin, 
    router.query.precioMax, 
    router.query.min, 
    router.query.max, 
    router.query.q,
    router.query.sort
  ]);

  // Asegurar que filteredProducts sea siempre un array
  const safeFilteredProducts = Array.isArray(filteredProducts) ? filteredProducts : [];

  if (!router.isReady) {
    return null;
  }

  return (
    <div className="container flex flex-col py-10 mx-auto lg:flex-row pb-20">
      <aside className="w-full mb-6 lg:w-1/4 lg:mb-0">
        <Filter
          products={products}
          setFilteredProducts={setFilteredProducts}
          onFiltersChange={handleFiltersChange}
        />
      </aside>
      <section className="flex flex-col w-full lg:w-3/4">
        {loading ? (
          <div className="flex items-center justify-center mt-[5%]">
            <BounceLoader color="#BE1A1D" />
          </div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : safeFilteredProducts.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          <>
            <Card currentProducts={safeFilteredProducts} />
              <Pagination
              pagination={pagination}
                onPageChange={handlePageChange}
              />
          </>
        )}
      </section>
    </div>
  );
}
