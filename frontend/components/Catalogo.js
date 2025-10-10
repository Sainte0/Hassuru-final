import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Card from "./Card";
import Filter from "./Filtro";
import Pagination from "./Pagination";
import { BounceLoader } from 'react-spinners';
import { useGA4 } from '../hooks/useGA4';

// Tabla de conversión de tallas a centímetros
const talleToCm = {
  '3.5': '22.5', '4': '23', '4.5': '23.5', '5': '23.5', '5.5': '24', '6': '24',
  '6.5': '24.5', '7': '25', '7.5': '25.5', '8': '26', '8.5': '26.5',
  '9': '27', '9.5': '27.5', '10': '28', '10.5': '28.5', '11': '29',
  '11.5': '29.5', '12': '30', '12.5': '30.5', '13': '31', '13.5': '31.5', '14': '32'
};

// Función para obtener CM de una talla
const getCmFromTalla = (tallaStr) => {
  if (!tallaStr) return null;
  const usMatch = tallaStr.match(/(\d+\.?\d*)\s*usa?/i);
  if (usMatch) {
    return talleToCm[usMatch[1]] || null;
  }
  return null;
};

export default function Catalogo() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [currentFilters, setCurrentFilters] = useState({});
  const [pagination, setPagination] = useState(null);
  const { viewItemList } = useGA4();
  
  // Cache para evitar llamadas repetitivas
  const cacheRef = useRef(new Map());
  const cacheTimeout = 5 * 60 * 1000; // 5 minutos
  
  // Usar ref para evitar dependencias circulares
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;
  
  // Flag para evitar múltiples llamadas simultáneas
  const isLoadingRef = useRef(false);
  
  // Ref para fetchCatalogoProducts para usarlo en el event listener
  const fetchCatalogoProductsRef = useRef();

  // Función para restaurar el estado de la página desde la URL
  const restorePageFromURL = useCallback(() => {
    if (!router.isReady) return;

    const urlPage = parseInt(router.query.page) || 1;
    const savedPage = sessionStorage.getItem('lastPage_catalogo');

    // Si hay una página en la URL, usarla
    if (router.query.page) {
      setCurrentPage(urlPage);
      currentPageRef.current = urlPage;
      if (urlPage > 1) {
        sessionStorage.setItem('lastPage_catalogo', urlPage.toString());
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
      sessionStorage.removeItem('lastPage_catalogo');
    }
  }, [router.isReady, router.query.page, router.pathname, router.query]);

  // Efecto para manejar la navegación inicial y cambios en la URL
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    restorePageFromURL();
  }, [router.isReady, router.query.page, restorePageFromURL]);

  // Event listener para detectar navegación hacia atrás/adelante
  useEffect(() => {
    const handlePopState = () => {
      // Pequeño delay para asegurar que la URL se actualice
      setTimeout(() => {
        restorePageFromURL();
        // Recargar productos con la página restaurada
        if (fetchCatalogoProductsRef.current) {
          fetchCatalogoProductsRef.current(currentFilters);
        }
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [restorePageFromURL, currentFilters]);

  const fetchCatalogoProducts = useCallback(async (filters = {}) => {
    // Evitar múltiples llamadas simultáneas
    if (isLoadingRef.current) {
      return;
    }
    
    // Crear clave de caché
    const cacheKey = JSON.stringify({
      page: currentPageRef.current,
      filters: filters
    });
    
    // Verificar caché
    const cached = cacheRef.current.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < cacheTimeout) {
      console.log('📦 Usando datos en caché');
      setProducts(cached.data.productos);
      setFilteredProducts(cached.data.productos);
      setPagination(cached.data.pagination);
      setLoading(false);
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
      if (filters.marca) queryParams.append('marca', filters.marca);
      if (filters.tallaRopa) queryParams.append('tallaRopa', filters.tallaRopa);
      if (filters.tallaZapatilla) queryParams.append('tallaZapatilla', filters.tallaZapatilla);
      if (filters.accesorio) queryParams.append('accesorio', filters.accesorio);
      if (filters.disponibilidad) queryParams.append('disponibilidad', filters.disponibilidad);
      if (filters.precioMin) queryParams.append('precioMin', filters.precioMin);
      if (filters.precioMax) queryParams.append('precioMax', filters.precioMax);
      if (filters.q) queryParams.append('q', filters.q);
      if (filters.categoria) queryParams.append('categoria', filters.categoria);
      if (filters.sort) queryParams.append('sort', filters.sort);

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/catalogo?${queryParams}`);
      if (!response.ok) throw new Error("Error al cargar los productos del catálogo");
      
      const data = await response.json();
      
      // Verificar que data tenga la estructura esperada
      if (!data || !data.productos || !Array.isArray(data.productos)) {
        throw new Error('Formato de respuesta inválido del servidor');
      }
      
      // Guardar en caché
      cacheRef.current.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      
      setProducts(data.productos);
      setFilteredProducts(data.productos);
      
      // Evento GA4: Ver lista de productos
      if (data.productos && data.productos.length > 0) {
        const listName = filters.q ? `Búsqueda: ${filters.q}` : 
                        filters.categoria ? `Categoría: ${filters.categoria}` :
                        filters.marca ? `Marca: ${filters.marca}` : 'Catálogo general';
        viewItemList(data.productos, listName);
      }
      
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
  }, [productsPerPage]);

  // Asignar la función al ref para que esté disponible en el event listener
  useEffect(() => {
    fetchCatalogoProductsRef.current = fetchCatalogoProducts;
  }, [fetchCatalogoProducts]);

  // Función para manejar el cambio de página
  const handlePageChange = (pageNumber) => {
    // Actualizar el estado local primero
    setCurrentPage(pageNumber);
    currentPageRef.current = pageNumber; // Actualizar el ref inmediatamente
    
    // Guardar la página en sessionStorage solo si no es la primera página
    if (pageNumber > 1) {
      sessionStorage.setItem('lastPage_catalogo', pageNumber.toString());
    } else {
      sessionStorage.removeItem('lastPage_catalogo');
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
      fetchCatalogoProducts(currentFilters);
    }, 0);

    // Scroll al inicio de la página
    window.scrollTo(0, 0);
  };

  // Función para manejar cambios de filtros
  const handleFiltersChange = useCallback((filters) => {
    setCurrentFilters(filters);
    
    // Limpiar caché cuando cambian los filtros
    cacheRef.current.clear();
    
    // Resetear a la primera página cuando cambian los filtros
    setCurrentPage(1);
    currentPageRef.current = 1; // Actualizar el ref inmediatamente
    
    // Limpiar la página guardada en sessionStorage
    sessionStorage.removeItem('lastPage_catalogo');
    
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
    
    // Llamar fetchCatalogoProducts después de actualizar la URL
    setTimeout(() => {
      fetchCatalogoProducts(filters);
    }, 100); // Pequeño delay para asegurar que la URL se actualice
  }, [router]);

// Cargar productos cuando se carga la página
  useEffect(() => {
    if (router.isReady) {
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
        categoria: router.query.categoria || '',
        sort: router.query.sort || ''
      };
      
      // Verificar si hay filtros activos en la URL
      const hasUrlFilters = Object.values(urlFilters).some(value => value !== '');
      
      if (hasUrlFilters) {
        setCurrentFilters(urlFilters);
        // Llamar fetchCatalogoProducts con los filtros extraídos de la URL
        setTimeout(() => {
          fetchCatalogoProducts(urlFilters);
        }, 0);
      } else {
        // Llamar fetchCatalogoProducts directamente para evitar dependencias circulares
        setTimeout(() => {
          fetchCatalogoProducts();
        }, 0);
      }
    }
  }, [router.isReady, router.query.marca, router.query.tallaRopa, router.query.tallaZapatilla, router.query.accesorio, router.query.disponibilidad, router.query.precioMin, router.query.precioMax, router.query.min, router.query.max, router.query.q, router.query.categoria, router.query.sort]);

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
