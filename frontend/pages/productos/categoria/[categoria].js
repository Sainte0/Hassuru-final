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

  const fetchProductsByCategory = async (filters = {}) => {
    if (!categoria) {
      console.log('No hay categoría para cargar productos');
      return;
    }
    
    console.log('Iniciando carga de productos para categoría:', categoria, 'con filtros:', filters);
    setLoading(true);
    setError(null);
    
    try {
      // Construir query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: productsPerPage.toString()
      });

      // Agregar filtros si existen
      if (filters.marca) queryParams.append('marca', filters.marca);
      if (filters.tallaRopa) queryParams.append('talla', filters.tallaRopa);
      if (filters.tallaZapatilla) queryParams.append('talla', filters.tallaZapatilla);
      if (filters.accesorio) queryParams.append('talla', filters.accesorio);
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
      
      const sortedData = sortProductsByAvailability(data.productos);
      console.log('Productos ordenados:', {
        total: sortedData.length,
        orden: sortedData.map(p => p.nombre)
      });
      
      setProducts(sortedData);
      setFilteredProducts(sortedData);
      
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
    }
  };

  // Función para aplicar los filtros
  const applyFilters = useCallback((productsToFilter, filters) => {
    if (!productsToFilter || !Array.isArray(productsToFilter)) {
      console.log('No hay productos para filtrar o no es un array');
      return [];
    }

    console.log('Aplicando filtros:', {
      filtros: filters,
      totalProductos: productsToFilter.length
    });

    let filtered = [...productsToFilter];

    // Filtro de marca
    if (filters.marca) {
      filtered = filtered.filter(product => {
        const marcas = Array.isArray(product.marca) ? product.marca : [product.marca];
        return marcas.includes(filters.marca);
      });
      console.log('Después de filtrar por marca:', {
        marca: filters.marca,
        productosRestantes: filtered.length,
        productos: filtered.map(p => p.nombre)
      });
    }

    // Filtro de talla de ropa
    if (filters.tallaRopa) {
      filtered = filtered.filter(product => 
        product.categoria === "ropa" && 
        product.tallas.some(talla => talla.talla === filters.tallaRopa)
      );
      console.log('Después de filtrar por talla ropa:', filtered);
    }

    // Filtro de talla de zapatilla
    if (filters.tallaZapatilla) {
      filtered = filtered.filter(product => 
        product.categoria === "zapatillas" && 
        product.tallas.some(talla => talla.talla === filters.tallaZapatilla)
      );
      console.log('Después de filtrar por talla zapatilla:', filtered);
    }

    // Filtro de accesorio
    if (filters.accesorio) {
      filtered = filtered.filter(product => 
        product.categoria === "accesorios" && 
        product.tallas.some(talla => talla.talla === filters.accesorio)
      );
      console.log('Después de filtrar por accesorio:', filtered);
    }

    // Filtro de precio
    if (filters.precioMin || filters.precioMax) {
      filtered = filtered.filter(product => {
        const precio = parseFloat(product.precio);
        const min = filters.precioMin ? parseFloat(filters.precioMin) : -Infinity;
        const max = filters.precioMax ? parseFloat(filters.precioMax) : Infinity;
        return precio >= min && precio <= max;
      });
      console.log('Después de filtrar por precio:', filtered);
    }

    // Filtro de stock
    if (filters.stock) {
      filtered = filtered.filter(product => 
        product.tallas.some(talla => talla.stock > 0)
      );
      console.log('Después de filtrar por stock:', filtered);
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
      console.log('Después de filtrar por disponibilidad:', filtered);
    }

    const sortedResults = sortProductsByAvailability(filtered);
    console.log('Resultados finales:', {
      totalFiltrado: sortedResults.length,
      productos: sortedResults.map(p => ({
        id: p._id,
        nombre: p.nombre,
        marca: p.marca,
        precio: p.precio
      }))
    });
    return sortedResults;
  }, []);

  // Función para manejar cambios de filtros
  const handleFiltersChange = useCallback((filters) => {
    setCurrentFilters(filters);
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
    fetchProductsByCategory(filters);
  }, [categoria, currentPage, productsPerPage]);

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

  console.log('Estado de paginación:', {
    paginaActual: currentPage,
    totalPaginas: totalPages,
    productosPorPagina: productsPerPage,
    productosEnPaginaActual: currentProducts.length,
    rango: `${indexOfFirstProduct + 1}-${indexOfLastProduct}`,
    totalProductos: filteredProducts.length
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
        ) : filteredProducts.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          <>
            <Card currentProducts={filteredProducts} />
            <Pagination
              pagination={pagination}
              onPageChange={(page) => {
                setCurrentPage(page);
                fetchProductsByCategory(currentFilters);
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}
