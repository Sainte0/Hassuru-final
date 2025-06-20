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

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/categoria/${categoria}?${queryParams}`);
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
    setCurrentFilters(filters);
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
    // Llamar fetchProductsByCategory directamente para evitar dependencias circulares
    setTimeout(() => {
      fetchProductsByCategory(filters);
    }, 0);
  }, [categoria]);

  // Cargar productos cuando cambia la categoría
  useEffect(() => {
    if (router.isReady) {
      // Llamar fetchProductsByCategory directamente para evitar dependencias circulares
      setTimeout(() => {
        fetchProductsByCategory();
      }, 0);
    }
  }, [categoria, router.isReady]);

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
