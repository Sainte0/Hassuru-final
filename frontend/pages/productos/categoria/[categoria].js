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
    console.log('Página en estado de fallback');
    return <div>Cargando...</div>;
  }

  if (!router.query.categoria) {
    console.log('No se encontró la categoría en la URL');
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

  // Efecto para manejar la navegación inicial
  useEffect(() => {
    if (!router.isReady) {
      console.log('Router no está listo aún');
      return;
    }

    console.log('Estado inicial de navegación:', {
      categoria,
      queryParams: router.query,
      currentPage
    });

    // Recuperar la página guardada al cargar la página
    const savedPage = sessionStorage.getItem(`lastPage_${categoria}`);
    const urlPage = parseInt(router.query.page) || 1;
    
    console.log('Información de paginación:', {
      paginaGuardada: savedPage,
      paginaURL: urlPage,
      paginaActual: currentPage
    });

    // Si hay una página guardada y no hay página en la URL, actualizar la URL
    if (savedPage && !router.query.page) {
      const page = parseInt(savedPage);
      if (page > 1) {
        console.log('Actualizando URL con página guardada:', page);
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
      console.log('No hay categoría para cargar productos');
      return;
    }
    
    // Evitar múltiples llamadas simultáneas
    if (isLoadingRef.current) {
      console.log('Ya hay una carga en progreso, saltando...');
      return;
    }
    
    console.log('Iniciando carga de productos para categoría:', categoria, 'con filtros:', filters);
    console.log('🔍 Tipo de filters:', typeof filters);
    console.log('🔍 Filters es objeto?', filters && typeof filters === 'object');
    console.log('🔍 Filters.tallaRopa:', filters.tallaRopa);
    console.log('🔍 Filters.tallaRopa es string?', typeof filters.tallaRopa === 'string');
    console.log('🔍 Filters.tallaRopa tiene valor?', filters.tallaRopa && filters.tallaRopa.length > 0);
    console.log('🔍 Filters.tallaZapatilla:', filters.tallaZapatilla);
    console.log('🔍 Filters.tallaZapatilla es string?', typeof filters.tallaZapatilla === 'string');
    console.log('🔍 Filters.tallaZapatilla tiene valor?', filters.tallaZapatilla && filters.tallaZapatilla.length > 0);
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Construir query parameters
      const queryParams = new URLSearchParams({
        page: currentPageRef.current.toString(),
        limit: productsPerPage.toString()
      });

      console.log('📋 QueryParams iniciales:', Object.fromEntries(queryParams.entries()));

      // Agregar todos los filtros al servidor
      if (filters.marca) {
        queryParams.append('marca', filters.marca);
        console.log('✅ Agregado filtro marca:', filters.marca);
      }
      if (filters.tallaRopa) {
        queryParams.append('tallaRopa', filters.tallaRopa);
        console.log('✅ Agregado filtro tallaRopa:', filters.tallaRopa);
      }
      if (filters.tallaZapatilla) {
        queryParams.append('tallaZapatilla', filters.tallaZapatilla);
        console.log('✅ Agregado filtro tallaZapatilla:', filters.tallaZapatilla);
      }
      if (filters.accesorio) {
        queryParams.append('accesorio', filters.accesorio);
        console.log('✅ Agregado filtro accesorio:', filters.accesorio);
      }
      if (filters.disponibilidad) {
        queryParams.append('disponibilidad', filters.disponibilidad);
        console.log('✅ Agregado filtro disponibilidad:', filters.disponibilidad);
      }
      if (filters.precioMin) {
        queryParams.append('precioMin', filters.precioMin);
        console.log('✅ Agregado filtro precioMin:', filters.precioMin);
      }
      if (filters.precioMax) {
        queryParams.append('precioMax', filters.precioMax);
        console.log('✅ Agregado filtro precioMax:', filters.precioMax);
      }
      if (filters.q) {
        queryParams.append('q', filters.q);
        console.log('✅ Agregado filtro q:', filters.q);
      }

      console.log('📋 QueryParams finales:', Object.fromEntries(queryParams.entries()));

      const url = `${process.env.NEXT_PUBLIC_URL}/api/productos/categoria/${categoria}?${queryParams}`;
      console.log('🌐 URL de la petición:', url);
      console.log('📤 Filtros enviados al servidor:', Object.fromEntries(queryParams.entries()));

      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al cargar los productos");
      
      const data = await response.json();
      console.log('📥 Datos recibidos del servidor:', data);
      console.log('📊 Tipo de data:', typeof data);
      console.log('📦 Tipo de data.productos:', typeof data.productos);
      console.log('🔍 Es array data.productos?', Array.isArray(data.productos));
      
      // Verificar que data tenga la estructura esperada
      if (!data || !data.productos || !Array.isArray(data.productos)) {
        console.error('❌ Estructura de datos inesperada:', data);
        throw new Error('Formato de respuesta inválido del servidor');
      }
      
      console.log('Productos cargados por categoría:', {
        categoria,
        totalProductos: data.pagination?.totalProducts || 0,
        productosEnPagina: data.productos.length,
        paginaActual: data.pagination?.currentPage || 1,
        totalPaginas: data.pagination?.totalPages || 0
      });
      
      // Los productos ya vienen ordenados del servidor, no necesitamos ordenarlos aquí
      console.log('Productos recibidos del servidor (ya ordenados):', {
        total: data.productos.length,
        orden: data.productos.map(p => p.nombre)
      });
      
      setProducts(data.productos);
      setFilteredProducts(data.productos);
      
      // Actualizar paginación
      if (data.pagination) {
        setCurrentPage(data.pagination.currentPage);
        setPagination(data.pagination);
      }
      
    } catch (error) {
      console.error('Error al cargar productos:', {
        mensaje: error.message,
        stack: error.stack,
        categoria
      });
      setError(error.message);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [categoria, productsPerPage]);

  // Función para manejar cambios de filtros
  const handleFiltersChange = useCallback((filters) => {
    console.log('🔄 Cambiando filtros:', filters);
    console.log('📄 Página actual antes del cambio:', currentPageRef.current);
    setCurrentFilters(filters);
    
    // Resetear a la primera página cuando cambian los filtros
    setCurrentPage(1);
    currentPageRef.current = 1; // Actualizar el ref inmediatamente
    console.log('📄 Página reseteada a:', currentPageRef.current);
    
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
      console.log('📄 Llamando fetchProductsByCategory con página:', currentPageRef.current);
      fetchProductsByCategory(filters);
    }, 100); // Pequeño delay para asegurar que la URL se actualice
  }, [categoria, router]);

  // Efecto consolidado para manejar filtros y carga inicial de productos
  useEffect(() => {
    if (!router.isReady || !categoria) {
      return;
    }

    console.log('🔄 Efecto consolidado - Router listo y categoría disponible');
    console.log('📋 Query actual:', router.query);
    console.log('🔍 router.query.tallaRopa:', router.query.tallaRopa);
    console.log('🔍 router.query.tallaZapatilla:', router.query.tallaZapatilla);
    
    // Extraer filtros de la URL
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

    console.log('📋 Filtros extraídos de la URL:', urlFilters);
    console.log('🔍 urlFilters.tallaRopa:', urlFilters.tallaRopa);
    console.log('🔍 urlFilters.tallaRopa tiene valor?', urlFilters.tallaRopa && urlFilters.tallaRopa.length > 0);
    
    // Verificar si hay filtros activos
    const hasUrlFilters = Object.values(urlFilters).some(value => value !== '');
    
    if (hasUrlFilters) {
      console.log('🎯 Aplicando filtros de la URL');
      console.log('🎯 Filtro tallaRopa específico:', urlFilters.tallaRopa);
      console.log('🎯 Filtro tallaZapatilla específico:', urlFilters.tallaZapatilla);
      setCurrentFilters(urlFilters);
    } else {
      console.log('ℹ️ No hay filtros en la URL');
      setCurrentFilters({});
    }
    
    // Cargar productos con los filtros extraídos
    setTimeout(() => {
      console.log('📞 Llamando fetchProductsByCategory con filtros:', urlFilters);
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
    router.query.q
  ]);

  // Asegurar que filteredProducts sea siempre un array
  const safeFilteredProducts = Array.isArray(filteredProducts) ? filteredProducts : [];

  console.log('Estado de paginación:', {
    paginaActual: currentPage,
    totalPaginas: pagination?.totalPages || 0,
    productosPorPagina: productsPerPage,
    productosEnPaginaActual: safeFilteredProducts.length,
    totalProductos: pagination?.totalProducts || 0
  });

  if (!router.isReady) {
    console.log('Router no está listo, esperando...');
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
