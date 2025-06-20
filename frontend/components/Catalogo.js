import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Card from "./Card";
import Filter from "./Filtro";
import Pagination from "./Pagination";
import { BounceLoader } from 'react-spinners';

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

    console.log('Estado inicial de navegación del catálogo:', {
      queryParams: router.query,
      currentPage
    });

    // Recuperar la página guardada al cargar la página
    const savedPage = sessionStorage.getItem('lastPage_catalogo');
    const urlPage = parseInt(router.query.page) || 1;
    
    console.log('Información de paginación del catálogo:', {
      paginaGuardada: savedPage,
      paginaURL: urlPage,
      paginaActual: currentPage
    });

    // Si hay una página guardada y no hay página en la URL, actualizar la URL
    if (savedPage && !router.query.page) {
      const page = parseInt(savedPage);
      if (page > 1) {
        console.log('Actualizando URL con página guardada del catálogo:', page);
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
  }, [router.isReady, router.query.page]);

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

  const fetchCatalogoProducts = useCallback(async (filters = {}) => {
    // Evitar múltiples llamadas simultáneas
    if (isLoadingRef.current) {
      console.log('Ya hay una carga en progreso del catálogo, saltando...');
      return;
    }
    
    console.log('Iniciando carga de productos del catálogo con filtros:', filters);
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/catalogo?${queryParams}`);
      if (!response.ok) throw new Error("Error al cargar los productos del catálogo");
      
      const data = await response.json();
      console.log('📥 Datos recibidos del catálogo:', data);
      console.log('📊 Tipo de data:', typeof data);
      console.log('📦 Tipo de data.productos:', typeof data.productos);
      console.log('🔍 Es array data.productos?', Array.isArray(data.productos));
      
      // Verificar que data tenga la estructura esperada
      if (!data || !data.productos || !Array.isArray(data.productos)) {
        console.error('❌ Estructura de datos inesperada del catálogo:', data);
        throw new Error('Formato de respuesta inválido del servidor');
      }
      
      console.log('Productos cargados del catálogo:', {
        totalProductos: data.pagination?.totalProducts || 0,
        productosEnPagina: data.productos.length,
        paginaActual: data.pagination?.currentPage || 1,
        totalPaginas: data.pagination?.totalPages || 0
      });
      
      // Los productos ya vienen ordenados del servidor, no necesitamos ordenarlos aquí
      console.log('Productos recibidos del catálogo (ya ordenados):', {
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
      console.error('Error al cargar productos del catálogo:', {
        mensaje: error.message,
        stack: error.stack
      });
      setError(error.message);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [productsPerPage]);

  // Función para manejar cambios de filtros
  const handleFiltersChange = useCallback((filters) => {
    console.log('🔄 Cambiando filtros del catálogo:', filters);
    console.log('📄 Página actual antes del cambio:', currentPageRef.current);
    setCurrentFilters(filters);
    
    // Resetear a la primera página cuando cambian los filtros
    setCurrentPage(1);
    currentPageRef.current = 1; // Actualizar el ref inmediatamente
    console.log('📄 Página reseteada a:', currentPageRef.current);
    
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
      console.log('📄 Llamando fetchCatalogoProducts con página:', currentPageRef.current);
      fetchCatalogoProducts(filters);
    }, 100); // Pequeño delay para asegurar que la URL se actualice
  }, [router]);

  // Cargar productos cuando se carga la página
  useEffect(() => {
    if (router.isReady) {
      // Llamar fetchCatalogoProducts directamente para evitar dependencias circulares
      setTimeout(() => {
        fetchCatalogoProducts();
      }, 0);
    }
  }, [router.isReady]);

  // Asegurar que filteredProducts sea siempre un array
  const safeFilteredProducts = Array.isArray(filteredProducts) ? filteredProducts : [];

  console.log('Estado de paginación del catálogo:', {
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
