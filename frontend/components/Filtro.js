import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { sortProductsByAvailability } from '../utils/sortProducts';

export default function Filter({ products, setFilteredProducts, onFiltersChange }) {
  const router = useRouter();
  const { categoria } = router.query;
  const [selectedTallaRopa, setSelectedTallaRopa] = useState("");
  const [selectedTallaZapatilla, setSelectedTallaZapatilla] = useState("");
  const [selectedAccesorio, setSelectedAccesorio] = useState("");
  const [selectedCategoriaAccesorio, setSelectedCategoriaAccesorio] = useState("");
  const [selectedDisponibilidad, setSelectedDisponibilidad] = useState("");
  const [tallasRopa, setTallasRopa] = useState([]);
  const [tallasZapatilla, setTallasZapatilla] = useState([]);
  const [accesorios, setAccesorios] = useState([]);
  const [selectedMarca, setSelectedMarca] = useState("");
  const [marcas, setMarcas] = useState({
    zapatillas: [],
    ropa: [],
    accesorios: []
  });
  const [showFilters, setShowFilters] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [filterOptions, setFilterOptions] = useState(null);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  
  // Ref para controlar si se debe ignorar la inicialización desde la URL
  const ignoreUrlInitRef = useRef(false);

  // Initialize filters from URL parameters
  useEffect(() => {
    if (router.isReady && !ignoreUrlInitRef.current) {
      const { marca, tallaRopa, tallaZapatilla, accesorio, disponibilidad, stock, q, min, max, sort } = router.query;
      
      let filtersApplied = false;
      const filtersToApply = {};
      
      // Solo aplicar filtros si no están ya establecidos localmente
      if (marca && !selectedMarca) {
        setSelectedMarca(marca);
        filtersToApply.marca = marca;
        filtersApplied = true;
      }
      if (tallaRopa && !selectedTallaRopa) {
        setSelectedTallaRopa(tallaRopa);
        filtersToApply.tallaRopa = tallaRopa;
        filtersApplied = true;
      }
      if (tallaZapatilla && !selectedTallaZapatilla) {
        setSelectedTallaZapatilla(tallaZapatilla);
        filtersToApply.tallaZapatilla = tallaZapatilla;
        filtersApplied = true;
      }
      if (accesorio && !selectedAccesorio) {
        setSelectedAccesorio(accesorio);
        filtersToApply.accesorio = accesorio;
        filtersApplied = true;
      }
      if (categoria && !selectedCategoriaAccesorio && categoria === 'accesorios') {
        setSelectedCategoriaAccesorio(categoria);
        filtersToApply.categoria = categoria;
        filtersApplied = true;
      }
      if (disponibilidad && !selectedDisponibilidad) {
        setSelectedDisponibilidad(disponibilidad);
        filtersToApply.disponibilidad = disponibilidad;
        filtersApplied = true;
      }
      if (q && !query) {
        setQuery(q);
        filtersToApply.q = q;
        filtersApplied = true;
      }
      if (min && !precioMin) {
        setPrecioMin(min);
        filtersToApply.precioMin = min;
        filtersApplied = true;
      }
      if (max && !precioMax) {
        setPrecioMax(max);
        filtersToApply.precioMax = max;
        filtersApplied = true;
      }
      if (sort && !sortOrder) {
        setSortOrder(sort);
        filtersToApply.sort = sort;
        filtersApplied = true;
      }
      
      // Si se aplicaron filtros desde la URL, notificar al componente padre
      if (filtersApplied && onFiltersChange) {
        setTimeout(() => {
          onFiltersChange(filtersToApply);
        }, 100);
      }
    } else if (ignoreUrlInitRef.current) {
      ignoreUrlInitRef.current = false; // Resetear el flag
    }
  }, [router.isReady, router.query, onFiltersChange]);

  // Función para cargar opciones de filtro desde el servidor
  const loadFilterOptions = async (categoria) => {
    setLoadingFilters(true);
    try {
      let response;
      
      // Detectar si estamos en el catálogo o en una categoría específica
      const isCatalogo = router.pathname === '/catalogo';
      
      if (isCatalogo) {
        // Cargar opciones de filtro para el catálogo
        response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/catalogo/filtros`);
      } else if (categoria) {
        // Cargar opciones de filtro para una categoría específica
        response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/categoria/${categoria}/filtros`);
      } else {
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data);
        
        if (isCatalogo) {
          // Para el catálogo, cargar todas las opciones
          // Filtrar "accesorios" de las tallas de ropa ya que no es una talla válida
          const tallasRopaFiltradas = (data.tallas?.ropa || []).filter(talla => 
            talla.toLowerCase() !== 'accesorios'
          );
          setTallasRopa(tallasRopaFiltradas);
          setTallasZapatilla(data.tallas?.zapatillas || []);
          setAccesorios(data.tallas?.accesorios || []);
          setMarcas(prev => ({ 
            ...prev, 
            ropa: data.marcas || [],
            zapatillas: data.marcas || [],
            accesorios: data.marcas || []
          }));
        } else if (categoria) {
          // Para categorías específicas, cargar solo las opciones relevantes
          if (categoria === 'ropa') {
            // Filtrar "accesorios" de las tallas de ropa ya que no es una talla válida
            const tallasRopaFiltradas = (data.tallas || []).filter(talla => 
              talla.toLowerCase() !== 'accesorios'
            );
            setTallasRopa(tallasRopaFiltradas);
            setMarcas(prev => ({ ...prev, ropa: data.marcas || [] }));
          } else if (categoria === 'zapatillas') {
            setTallasZapatilla(data.tallas || []);
            setMarcas(prev => ({ ...prev, zapatillas: data.marcas || [] }));
          } else if (categoria === 'accesorios') {
            setAccesorios(data.tallas || []);
            setMarcas(prev => ({ ...prev, accesorios: data.marcas || [] }));
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar opciones de filtro:', error);
    } finally {
      setLoadingFilters(false);
    }
  };

  // Cargar opciones de filtro cuando cambia la categoría o cuando se carga el catálogo
  useEffect(() => {
    if (router.isReady) {
      const isCatalogo = router.pathname === '/catalogo';
      if (isCatalogo || categoria) {
        loadFilterOptions(categoria);
      }
    }
  }, [router.isReady, categoria, router.pathname]);

  // Función para aplicar todos los filtros
  const applyFilters = (products) => {
    return products.filter((product) => {
      const matchesMarca = !selectedMarca || (Array.isArray(product.marca) ? product.marca.includes(selectedMarca) : product.marca === selectedMarca);
      const matchesTallaRopa = !selectedTallaRopa || product.tallaRopa === selectedTallaRopa;
      const matchesTallaZapatilla = !selectedTallaZapatilla || product.tallaZapatilla === selectedTallaZapatilla;
      const matchesAccesorio = !selectedAccesorio || product.accesorio === selectedAccesorio;
      const matchesCategoriaAccesorio = !selectedCategoriaAccesorio || product.categoria === selectedCategoriaAccesorio;
      const matchesDisponibilidad = !selectedDisponibilidad || product.disponibilidad === selectedDisponibilidad;
      const matchesQuery = !query || product.nombre.toLowerCase().includes(query.toLowerCase());
      const matchesPrecio = (!precioMin || product.precio >= Number(precioMin)) && (!precioMax || product.precio <= Number(precioMax));

      return matchesMarca && matchesTallaRopa && matchesTallaZapatilla && matchesAccesorio && matchesCategoriaAccesorio && matchesDisponibilidad && matchesQuery && matchesPrecio;
    });
  };

  // Update URL and apply filters when any filter changes
  useEffect(() => {
    if (router.isReady) {
      const queryParams = {};
      
      // Solo agregar filtros que tengan valor (no vacíos)
      if (selectedTallaRopa && selectedTallaRopa.trim() !== '') queryParams.tallaRopa = selectedTallaRopa;
      if (selectedTallaZapatilla && selectedTallaZapatilla.trim() !== '') queryParams.tallaZapatilla = selectedTallaZapatilla;
      if (selectedAccesorio && selectedAccesorio.trim() !== '') queryParams.accesorio = selectedAccesorio;
      if (selectedCategoriaAccesorio && selectedCategoriaAccesorio.trim() !== '') queryParams.categoria = selectedCategoriaAccesorio;
      if (precioMin && precioMin.trim() !== '') queryParams.min = precioMin;
      if (precioMax && precioMax.trim() !== '') queryParams.max = precioMax;
      if (selectedDisponibilidad && selectedDisponibilidad.trim() !== '') queryParams.disponibilidad = selectedDisponibilidad;
      if (selectedMarca && selectedMarca.trim() !== '') queryParams.marca = selectedMarca;
      if (query && query.trim() !== '') queryParams.q = query;
      
      // Preserve the category parameter if it exists and is not being overridden by selectedCategoriaAccesorio
      if (router.query.categoria && !selectedCategoriaAccesorio) {
        queryParams.categoria = router.query.categoria;
      }

      // Update URL - solo incluir parámetros con valores
      router.replace(
        {
          pathname: router.pathname,
          query: queryParams,
        },
        undefined,
        { shallow: true }
      );

      // Pass filters to parent component via onFiltersChange
      if (onFiltersChange) {
        const filtersToPass = {
          tallaRopa: selectedTallaRopa || '',
          tallaZapatilla: selectedTallaZapatilla || '',
          accesorio: selectedAccesorio || '',
          categoria: selectedCategoriaAccesorio || '',
          precioMin: precioMin || '',
          precioMax: precioMax || '',
          disponibilidad: selectedDisponibilidad || '',
          marca: selectedMarca || '',
          q: query || '',
          sort: sortOrder || ''
        };
        
        // Solo pasar filtros si no estamos en proceso de limpiar
        if (!ignoreUrlInitRef.current) {
          onFiltersChange(filtersToPass);
        }
      }
    }
  }, [
    selectedTallaRopa,
    selectedTallaZapatilla,
    selectedAccesorio,
    selectedCategoriaAccesorio,
    precioMin,
    precioMax,
    selectedDisponibilidad,
    selectedMarca,
    query,
    sortOrder,
    router.isReady
  ]);

  // Efecto adicional para verificar que la URL se actualice correctamente
  useEffect(() => {
    if (router.isReady) {
      // Solo verificar inconsistencias si no estamos en proceso de limpiar filtros
      if (!ignoreUrlInitRef.current) {
        // Verificar si hay inconsistencias entre el estado local y la URL
        const urlHasTallaRopa = router.query.tallaRopa && router.query.tallaRopa !== '';
        const urlHasTallaZapatilla = router.query.tallaZapatilla && router.query.tallaZapatilla !== '';
        const urlHasMarca = router.query.marca && router.query.marca !== '';
        
        const stateHasTallaRopa = selectedTallaRopa && selectedTallaRopa !== '';
        const stateHasTallaZapatilla = selectedTallaZapatilla && selectedTallaZapatilla !== '';
        const stateHasMarca = selectedMarca && selectedMarca !== '';
        
        if ((urlHasTallaRopa && !stateHasTallaRopa) || 
            (urlHasTallaZapatilla && !stateHasTallaZapatilla) || 
            (urlHasMarca && !stateHasMarca)) {
          
          const queryParams = {};
          if (stateHasTallaRopa) queryParams.tallaRopa = selectedTallaRopa;
          if (stateHasTallaZapatilla) queryParams.tallaZapatilla = selectedTallaZapatilla;
          if (stateHasMarca) queryParams.marca = selectedMarca;
          if (router.query.categoria) queryParams.categoria = router.query.categoria;
          
          router.replace(
            {
              pathname: router.pathname,
              query: queryParams,
            },
            undefined,
            { shallow: true }
          );
        }
      }
    }
  }, [router.asPath, router.query, selectedTallaRopa, selectedTallaZapatilla, selectedMarca, router.isReady]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setShowFilters(false);
    }
  }, []);

  const handleSelectMarca = (marca) => {
    if (selectedMarca === marca) {
      ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
      setSelectedMarca("");
    } else {
      setSelectedMarca(marca);
    }
  };

  const handleSelectTallaRopa = (talla) => {
    if (selectedTallaRopa === talla) {
      ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
      setSelectedTallaRopa("");
    } else {
      setSelectedTallaRopa(talla);
      setSelectedTallaZapatilla("");
      setSelectedAccesorio("");
    }
  };

  const handleSelectTallaZapatilla = (talla) => {
    if (selectedTallaZapatilla === talla) {
      ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
      setSelectedTallaZapatilla("");
    } else {
      setSelectedTallaZapatilla(talla);
      setSelectedTallaRopa("");
      setSelectedAccesorio("");
    }
  };

  const handleSelectAccesorio = (accesorio) => {
    if (selectedAccesorio === accesorio) {
      ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
      setSelectedAccesorio("");
      // Si se elimina el último accesorio específico, también limpiar la categoría de accesorios
      setSelectedCategoriaAccesorio("");
    } else {
      setSelectedAccesorio(accesorio);
      setSelectedTallaRopa("");
      setSelectedTallaZapatilla("");
      // Al seleccionar un accesorio específico, activar también la categoría de accesorios
      setSelectedCategoriaAccesorio("accesorios");
    }
  };

  const handleSelectCategoriaAccesorio = () => {
    if (selectedCategoriaAccesorio === "accesorios") {
      ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
      setSelectedCategoriaAccesorio("");
      // Al eliminar la categoría de accesorios, también limpiar accesorios específicos
      setSelectedAccesorio("");
      
      // Actualizar la URL para remover el parámetro categoria
      const newQuery = { ...router.query };
      delete newQuery.categoria;
      router.replace({
        pathname: router.pathname,
        query: newQuery,
      }, undefined, { shallow: true });
    } else {
      setSelectedCategoriaAccesorio("accesorios");
      setSelectedTallaRopa("");
      setSelectedTallaZapatilla("");
      setSelectedAccesorio("");
    }
  };

  const handleSelectDisponibilidad = (opcion) => {
    if (selectedDisponibilidad === opcion) {
      ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
      setSelectedDisponibilidad("");
    } else {
      setSelectedDisponibilidad(opcion);
    }
  };

  const handleSearch = () => {
    // Aplicar los filtros actuales - ahora manejado por el servidor
    // const filteredProducts = applyFilters(products);
    // setFilteredProducts(filteredProducts);
  };

  const resetFilters = () => {
    setSelectedTallaRopa("");
    setSelectedTallaZapatilla("");
    setSelectedAccesorio("");
    setSelectedCategoriaAccesorio("");
    setSelectedMarca("");
    setSelectedDisponibilidad("");
    setQuery("");
    setPrecioMin("");
    setPrecioMax("");
    setSortOrder("");
    router.push({
      pathname: router.pathname,
      query: {},
    });
    // Resetear los productos filtrados - ahora manejado por el servidor
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  // Prevenir el comportamiento por defecto del formulario
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const queryParams = {};
    if (selectedMarca) queryParams.marca = selectedMarca;
    if (selectedTallaRopa) queryParams.tallaRopa = selectedTallaRopa;
    if (selectedTallaZapatilla) queryParams.tallaZapatilla = selectedTallaZapatilla;
    if (selectedAccesorio) queryParams.accesorio = selectedAccesorio;
    if (selectedDisponibilidad) queryParams.disponibilidad = selectedDisponibilidad;
    if (query) queryParams.q = query;
    if (precioMin) queryParams.min = precioMin;
    if (precioMax) queryParams.max = precioMax;
    if (sortOrder) queryParams.sort = sortOrder;

    router.push({
      pathname: router.pathname,
      query: queryParams,
    });
  };

  const handleSelectCategoria = (categoria) => {
    if (selectedCategoria === categoria) {
      setSelectedCategoria("");
    } else {
      setSelectedCategoria(categoria);
    }
  };

  return (
    <main className="px-4 font-semibold md:px-12 bg-white dark:bg-dark-bg rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
      <form onSubmit={handleFormSubmit}>
        <div className="mb-4">
          <h3 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white">Filtros</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedTallaRopa && (
              <div className="flex items-center mb-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="mr-2 text-gray-600 dark:text-gray-300">Talla de Ropa: {selectedTallaRopa}</span>
                <button type="button" onClick={() => handleSelectTallaRopa(selectedTallaRopa)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">X</button>
              </div>
            )}
            {selectedTallaZapatilla && (
              <div className="flex items-center mb-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="mr-2 text-gray-600 dark:text-gray-300">Talla de Zapatillas: {selectedTallaZapatilla}</span>
                <button type="button" onClick={() => handleSelectTallaZapatilla(selectedTallaZapatilla)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">X</button>
              </div>
            )}
            {selectedAccesorio && (
              <div className="flex items-center mb-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="mr-2 text-gray-600 dark:text-gray-300">Tecnología: {selectedAccesorio}</span>
                <button type="button" onClick={() => handleSelectAccesorio(selectedAccesorio)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">X</button>
              </div>
            )}
            {selectedCategoriaAccesorio && (
              <div className="flex items-center mb-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="mr-2 text-gray-600 dark:text-gray-300">Categoría: Accesorios</span>
                <button type="button" onClick={() => handleSelectCategoriaAccesorio()} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">X</button>
              </div>
            )}
            {selectedDisponibilidad && (
              <div className="flex items-center mb-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="mr-2 text-gray-600 dark:text-gray-300">Disponibilidad: {selectedDisponibilidad}</span>
                <button type="button" onClick={() => handleSelectDisponibilidad(selectedDisponibilidad)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">X</button>
              </div>
            )}
            {selectedMarca && (
              <div className="flex items-center mb-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="mr-2 text-gray-600 dark:text-gray-300">Marca: {selectedMarca}</span>
                <button type="button" onClick={() => handleSelectMarca(selectedMarca)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">X</button>
              </div>
            )}
            {query && (
              <div className="flex items-center mb-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="mr-2 text-gray-600 dark:text-gray-300">Búsqueda: {query}</span>
                <button type="button" onClick={() => { 
                  ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
                  setQuery(""); 
                }} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">X</button>
              </div>
            )}
            {(precioMin || precioMax) && (
              <div className="flex items-center mb-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="mr-2 text-gray-600 dark:text-gray-300">
                  Precio: {precioMin ? `$${precioMin}` : '$0'} - {precioMax ? `$${precioMax}` : 'Max'}
                </span>
                <button type="button" onClick={() => { 
                  ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
                  setPrecioMin(""); 
                  setPrecioMax(""); 
                }} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">X</button>
              </div>
            )}
            {sortOrder && (
              <div className="flex items-center mb-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="mr-2 text-gray-600 dark:text-gray-300">
                  Ordenar: {sortOrder === 'asc' ? 'Menor a Mayor' : 'Mayor a Menor'}
                </span>
                <button type="button" onClick={() => { 
                  ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
                  setSortOrder(""); 
                }} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">X</button>
              </div>
            )}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`mb-4 px-4 py-2 text-white md:hidden bg-red-500 dark:bg-red-600 rounded-md shadow-md transition-all duration-300 ease-in-out transform hover:bg-red-600 dark:hover:bg-red-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-600`}
          >
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>
          {showFilters && (
            <>
              {/* Filtro de Marca */}
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Marca</label>
                <div className="overflow-auto max-h-32">
                  {Array.from(new Set([...marcas.zapatillas, ...marcas.ropa, ...marcas.accesorios]))
                    .sort()
                    .map((marca, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="radio"
                        id={`marca-${marca}`}
                        name="marca"
                        value={marca}
                        checked={selectedMarca === marca}
                        onChange={() => handleSelectMarca(marca)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`marca-${marca}`} className="text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-800 dark:hover:text-white transition-colors">
                        {marca}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtros de Tallas para el Catálogo */}
              {router.pathname === '/catalogo' && (
                <>
                  {/* Filtro de Tallas de Ropa */}
                  {tallasRopa.length > 0 && (
                    <div className="mb-4">
                      <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Tallas de Ropa</label>
                      <div className="overflow-auto max-h-32">
                        {Array.from(new Set(tallasRopa))
                          .sort((a, b) => {
                            const tallaOrder = ["XXL", "XL", "L", "M", "S", "XS", "OS"];
                            return tallaOrder.indexOf(a) - tallaOrder.indexOf(b);
                          })
                          .map((talla, index) => (
                            <div key={index} className="flex items-center mb-2">
                              <input
                                type="radio"
                                id={`talla-ropa-${talla}`}
                                name="tallaRopa"
                                value={talla}
                                checked={selectedTallaRopa === talla}
                                onChange={() => handleSelectTallaRopa(talla)}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor={`talla-ropa-${talla}`} className="text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-800 dark:hover:text-white transition-colors">
                                {talla}
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Filtro de Tallas de Zapatillas */}
                  {tallasZapatilla.length > 0 && (
                    <div className="mb-4">
                      <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Tallas de Zapatillas</label>
                      <div className="overflow-auto max-h-32">
                        {Array.from(new Set(tallasZapatilla))
                          .sort((a, b) => {
                            const parseTalla = (talla) => {
                              const parts = talla.split(" ");
                              const numericPart = parseFloat(parts[0].replace(",", "."));
                              return numericPart;
                            };
                            return parseTalla(b) - parseTalla(a); // Cambiado para mayor a menor
                          })
                          .map((talla, index) => (
                            <div key={index} className="flex items-center mb-2">
                              <input
                                type="radio"
                                id={`talla-zapatilla-${talla}`}
                                name="tallaZapatilla"
                                value={talla}
                                checked={selectedTallaZapatilla === talla}
                                onChange={() => handleSelectTallaZapatilla(talla)}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor={`talla-zapatilla-${talla}`} className="text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-800 dark:hover:text-white transition-colors">
                                {talla}
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Botón de Categoría Accesorios */}
                  {!categoria && (
                    <div className="mb-4">
                      <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Categorías</label>
                      <button
                        type="button"
                        onClick={handleSelectCategoriaAccesorio}
                        className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                          selectedCategoriaAccesorio === "accesorios"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                        }`}
                      >
                        Accesorios
                      </button>
                    </div>
                  )}

                  {/* Filtro de Tecnología (Accesorios) */}
                  {accesorios.length > 0 && !categoria && (
                    <div className="mb-4">
                      <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Tecnología</label>
                      <div className="overflow-auto max-h-32">
                        {accesorios.map((accesorio, index) => (
                          <div key={index} className="flex items-center mb-2">
                            <input
                              type="radio"
                              id={`accesorio-${accesorio}`}
                              name="accesorio"
                              value={accesorio}
                              checked={selectedAccesorio === accesorio}
                              onChange={() => handleSelectAccesorio(accesorio)}
                              className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`accesorio-${accesorio}`} className="text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-800 dark:hover:text-white transition-colors">
                              {accesorio}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Filtro de Tallas de Ropa */}
              {categoria === 'ropa' && (
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Tallas de Ropa</label>
                  <div className="overflow-auto max-h-32">
                    {Array.from(new Set(tallasRopa))
                      .sort((a, b) => {
                        const tallaOrder = ["XXL", "XL", "L", "M", "S", "XS", "OS"];
                        return tallaOrder.indexOf(a) - tallaOrder.indexOf(b);
                      })
                      .map((talla, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="radio"
                            id={`talla-ropa-${talla}`}
                            name="tallaRopa"
                            value={talla}
                            checked={selectedTallaRopa === talla}
                            onChange={() => handleSelectTallaRopa(talla)}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`talla-ropa-${talla}`} className="text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-800 dark:hover:text-white transition-colors">
                            {talla}
                          </label>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Filtro de Tallas de Zapatillas */}
              {categoria === 'zapatillas' && (
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Tallas de Zapatillas</label>
                  <div className="overflow-auto max-h-32">
                    {Array.from(new Set(tallasZapatilla))
                      .sort((a, b) => {
                        const parseTalla = (talla) => {
                          const parts = talla.split(" ");
                          const numericPart = parseFloat(parts[0].replace(",", "."));
                          return numericPart;
                        };
                        return parseTalla(b) - parseTalla(a); // Cambiado para mayor a menor
                      })
                      .map((talla, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="radio"
                            id={`talla-zapatilla-${talla}`}
                            name="tallaZapatilla"
                            value={talla}
                            checked={selectedTallaZapatilla === talla}
                            onChange={() => handleSelectTallaZapatilla(talla)}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`talla-zapatilla-${talla}`} className="text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-800 dark:hover:text-white transition-colors">
                            {talla}
                          </label>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Filtro de Tecnología (Accesorios) */}
              {categoria === 'accesorios' && (
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Tecnología</label>
                  <div className="overflow-auto max-h-32">
                    {accesorios.map((accesorio, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <input
                          type="radio"
                          id={`accesorio-${accesorio}`}
                          name="accesorio"
                          value={accesorio}
                          checked={selectedAccesorio === accesorio}
                          onChange={() => handleSelectAccesorio(accesorio)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`accesorio-${accesorio}`} className="text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-800 dark:hover:text-white transition-colors">
                          {accesorio}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtro de Disponibilidad */}
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Disponibilidad</label>
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => handleSelectDisponibilidad("Entrega inmediata")}
                    className={`p-2 rounded w-full transition-colors ${
                      selectedDisponibilidad === "Entrega inmediata"
                        ? "bg-gray-600 dark:bg-gray-500 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-black dark:text-white"
                    } hover:bg-green-500 dark:hover:bg-green-600 mb-1`}
                    aria-label="Filtrar por entrega inmediata"
                  >
                    Entrega inmediata
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDisponibilidad("Disponible en 5 días")}
                    className={`p-2 rounded w-full transition-colors ${
                      selectedDisponibilidad === "Disponible en 5 días"
                        ? "bg-gray-600 dark:bg-gray-500 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-black dark:text-white"
                    } hover:bg-yellow-500 dark:hover:bg-yellow-600 mb-1`}
                    aria-label="Filtrar por disponibilidad en 5 días"
                  >
                    Disponible en 5 días
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDisponibilidad("Disponible en 20 días")}
                    className={`p-2 rounded w-full transition-colors ${
                      selectedDisponibilidad === "Disponible en 20 días"
                        ? "bg-gray-600 dark:bg-gray-500 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-black dark:text-white"
                    } hover:bg-red-500 dark:hover:bg-red-600`}
                  >
                    Disponible en 20 días
                  </button>
                </div>
              </div>

              {/* Filtro de Precios */}
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Precio</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={precioMin}
                    onChange={(e) => {
                      setPrecioMin(e.target.value);
                      const queryParams = { ...router.query, min: e.target.value };
                      router.push({
                        pathname: router.pathname,
                        query: queryParams,
                      }, undefined, { shallow: true });
                    }}
                    placeholder="Min"
                    className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <input
                    type="number"
                    value={precioMax}
                    onChange={(e) => {
                      setPrecioMax(e.target.value);
                      const queryParams = { ...router.query, max: e.target.value };
                      router.push({
                        pathname: router.pathname,
                        query: queryParams,
                      }, undefined, { shallow: true });
                    }}
                    placeholder="Max"
                    className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Filtro de Ordenamiento por Precio */}
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Ordenar por Precio</label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    const queryParams = { ...router.query, sort: e.target.value };
                    if (!e.target.value) {
                      delete queryParams.sort;
                    }
                    router.push({
                      pathname: router.pathname,
                      query: queryParams,
                    }, undefined, { shallow: true });
                  }}
                  className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Sin ordenar</option>
                  <option value="asc">Menor a Mayor</option>
                  <option value="desc">Mayor a Menor</option>
                </select>
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  className="w-full p-2 mb-2 text-white bg-red-500 dark:bg-red-600 rounded hover:bg-red-700 dark:hover:bg-red-700 transition-colors"
                >
                  Buscar
                </button>
                <button
                  type="reset"
                  onClick={resetFilters}
                  className="w-full p-2 text-white bg-red-500 dark:bg-red-600 rounded hover:bg-red-700 dark:hover:bg-red-700 transition-colors"
                >
                  Reiniciar Filtros
                </button>
              </div>
            </>
          )}
        </div>
      </form>
    </main>
  );
}
