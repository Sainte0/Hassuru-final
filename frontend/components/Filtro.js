import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { sortProductsByAvailability } from '../utils/sortProducts';

export default function Filter({ products, setFilteredProducts, onFiltersChange }) {
  const router = useRouter();
  const { categoria } = router.query;
  const [selectedTallaRopa, setSelectedTallaRopa] = useState("");
  const [selectedTallaZapatilla, setSelectedTallaZapatilla] = useState("");
  const [selectedAccesorio, setSelectedAccesorio] = useState("");
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
  
  // Ref para controlar si se debe ignorar la inicialización desde la URL
  const ignoreUrlInitRef = useRef(false);

  // Initialize filters from URL parameters
  useEffect(() => {
    if (router.isReady && !ignoreUrlInitRef.current) {
      console.log('🔍 Inicializando filtros desde URL:', router.query);
      const { marca, tallaRopa, tallaZapatilla, accesorio, disponibilidad, stock, q, min, max } = router.query;
      
      let filtersApplied = false;
      
      // Solo aplicar filtros si no están ya establecidos localmente
      if (marca && !selectedMarca) {
        console.log('✅ Aplicando filtro de marca:', marca);
        setSelectedMarca(marca);
        filtersApplied = true;
      }
      if (tallaRopa && !selectedTallaRopa) {
        console.log('✅ Aplicando filtro de talla ropa:', tallaRopa);
        setSelectedTallaRopa(tallaRopa);
        filtersApplied = true;
      }
      if (tallaZapatilla && !selectedTallaZapatilla) {
        console.log('✅ Aplicando filtro de talla zapatilla:', tallaZapatilla);
        setSelectedTallaZapatilla(tallaZapatilla);
        filtersApplied = true;
      }
      if (accesorio && !selectedAccesorio) {
        console.log('✅ Aplicando filtro de accesorio:', accesorio);
        setSelectedAccesorio(accesorio);
        filtersApplied = true;
      }
      if (disponibilidad && !selectedDisponibilidad) {
        console.log('✅ Aplicando filtro de disponibilidad:', disponibilidad);
        setSelectedDisponibilidad(disponibilidad);
        filtersApplied = true;
      }
      if (q && !query) {
        console.log('✅ Aplicando filtro de búsqueda:', q);
        setQuery(q);
        filtersApplied = true;
      }
      if (min && !precioMin) {
        console.log('✅ Aplicando filtro de precio mínimo:', min);
        setPrecioMin(min);
        filtersApplied = true;
      }
      if (max && !precioMax) {
        console.log('✅ Aplicando filtro de precio máximo:', max);
        setPrecioMax(max);
        filtersApplied = true;
      }
      
      if (filtersApplied) {
        console.log('🎯 Filtros aplicados desde URL correctamente');
      } else {
        console.log('ℹ️ No hay filtros en la URL o ya están establecidos localmente');
      }
    } else if (ignoreUrlInitRef.current) {
      console.log('🚫 Ignorando inicialización desde URL (limpiando filtro)');
      ignoreUrlInitRef.current = false; // Resetear el flag
    }
  }, [router.isReady, router.query]);

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
        console.log('No se pudo determinar la ruta para cargar filtros');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data);
        
        if (isCatalogo) {
          // Para el catálogo, cargar todas las opciones
          setTallasRopa(data.tallas?.ropa || []);
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
            setTallasRopa(data.tallas || []);
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
      const matchesDisponibilidad = !selectedDisponibilidad || product.disponibilidad === selectedDisponibilidad;
      const matchesQuery = !query || product.nombre.toLowerCase().includes(query.toLowerCase());
      const matchesPrecio = (!precioMin || product.precio >= Number(precioMin)) && (!precioMax || product.precio <= Number(precioMax));

      return matchesMarca && matchesTallaRopa && matchesTallaZapatilla && matchesAccesorio && matchesDisponibilidad && matchesQuery && matchesPrecio;
    });
  };

  // Efecto para aplicar filtros cuando cambian los valores
  // useEffect(() => {
  //   if (products.length > 0) {
  //     const filteredProducts = applyFilters(products);
  //     setFilteredProducts(filteredProducts);
  //   }
  // }, [selectedMarca, selectedTallaRopa, selectedTallaZapatilla, selectedAccesorio, selectedDisponibilidad, query, precioMin, precioMax, products]);

  // Update URL and apply filters when any filter changes
  useEffect(() => {
    if (router.isReady) {
      console.log('🔄 Filtro.js - useEffect ejecutándose con filtros:', {
        selectedTallaRopa,
        selectedTallaZapatilla,
        selectedAccesorio,
        precioMin,
        precioMax,
        selectedDisponibilidad,
        selectedMarca,
        query
      });
      
      const queryParams = {};
      
      // Solo agregar filtros que tengan valor
      if (selectedTallaRopa && selectedTallaRopa.trim() !== '') queryParams.tallaRopa = selectedTallaRopa;
      if (selectedTallaZapatilla && selectedTallaZapatilla.trim() !== '') queryParams.tallaZapatilla = selectedTallaZapatilla;
      if (selectedAccesorio && selectedAccesorio.trim() !== '') queryParams.accesorio = selectedAccesorio;
      if (precioMin && precioMin.trim() !== '') queryParams.min = precioMin;
      if (precioMax && precioMax.trim() !== '') queryParams.max = precioMax;
      if (selectedDisponibilidad && selectedDisponibilidad.trim() !== '') queryParams.disponibilidad = selectedDisponibilidad;
      if (selectedMarca && selectedMarca.trim() !== '') queryParams.marca = selectedMarca;
      if (query && query.trim() !== '') queryParams.q = query;
      
      // Preserve the category parameter if it exists
      if (router.query.categoria) {
        queryParams.categoria = router.query.categoria;
      }

      console.log('📋 QueryParams construidos:', queryParams);
      console.log('🔍 QueryParams tiene valores?', Object.keys(queryParams).length > 0);

      // Update URL
      router.push(
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
          precioMin: precioMin || '',
          precioMax: precioMax || '',
          disponibilidad: selectedDisponibilidad || '',
          marca: selectedMarca || '',
          q: query || ''
        };
        
        console.log('📤 Pasando filtros al componente padre:', filtersToPass);
        onFiltersChange(filtersToPass);
      }
    }
  }, [
    selectedTallaRopa,
    selectedTallaZapatilla,
    selectedAccesorio,
    precioMin,
    precioMax,
    selectedDisponibilidad,
    selectedMarca,
    query,
    router.isReady
  ]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setShowFilters(false);
    }
  }, []);

  const handleSelectMarca = (marca) => {
    console.log('🔄 handleSelectMarca llamado con:', marca);
    console.log('🔍 selectedMarca actual:', selectedMarca);
    if (selectedMarca === marca) {
      console.log('✅ Limpiando filtro marca');
      ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
      setSelectedMarca("");
    } else {
      console.log('✅ Estableciendo filtro marca:', marca);
      setSelectedMarca(marca);
    }
  };

  const handleSelectTallaRopa = (talla) => {
    console.log('🔄 handleSelectTallaRopa llamado con:', talla);
    console.log('🔍 selectedTallaRopa actual:', selectedTallaRopa);
    if (selectedTallaRopa === talla) {
      console.log('✅ Limpiando filtro tallaRopa');
      ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
      setSelectedTallaRopa("");
    } else {
      console.log('✅ Estableciendo filtro tallaRopa:', talla);
      setSelectedTallaRopa(talla);
      setSelectedTallaZapatilla("");
      setSelectedAccesorio("");
    }
  };

  const handleSelectTallaZapatilla = (talla) => {
    console.log('🔄 handleSelectTallaZapatilla llamado con:', talla);
    console.log('🔍 selectedTallaZapatilla actual:', selectedTallaZapatilla);
    if (selectedTallaZapatilla === talla) {
      console.log('✅ Limpiando filtro tallaZapatilla');
      ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
      setSelectedTallaZapatilla("");
    } else {
      console.log('✅ Estableciendo filtro tallaZapatilla:', talla);
      setSelectedTallaZapatilla(talla);
      setSelectedTallaRopa("");
      setSelectedAccesorio("");
    }
  };

  const handleSelectAccesorio = (accesorio) => {
    console.log('🔄 handleSelectAccesorio llamado con:', accesorio);
    console.log('🔍 selectedAccesorio actual:', selectedAccesorio);
    if (selectedAccesorio === accesorio) {
      console.log('✅ Limpiando filtro accesorio');
      ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
      setSelectedAccesorio("");
    } else {
      console.log('✅ Estableciendo filtro accesorio:', accesorio);
      setSelectedAccesorio(accesorio);
      setSelectedTallaRopa("");
      setSelectedTallaZapatilla("");
    }
  };

  const handleSelectDisponibilidad = (opcion) => {
    console.log('🔄 handleSelectDisponibilidad llamado con:', opcion);
    console.log('🔍 selectedDisponibilidad actual:', selectedDisponibilidad);
    if (selectedDisponibilidad === opcion) {
      console.log('✅ Limpiando filtro disponibilidad');
      ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
      setSelectedDisponibilidad("");
    } else {
      console.log('✅ Estableciendo filtro disponibilidad:', opcion);
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
    setSelectedMarca("");
    setSelectedDisponibilidad("");
    setQuery("");
    setPrecioMin("");
    setPrecioMax("");
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
    <main className="px-4 font-semibold md:px-12">
      <form onSubmit={handleFormSubmit}>
        <div className="mb-4">
          <h3 className="mb-3 text-xl font-semibold text-gray-800">Filtros</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedTallaRopa && (
              <div className="flex items-center mb-2">
                <span className="mr-2 text-gray-600">Talla de Ropa: {selectedTallaRopa}</span>
                <button type="button" onClick={() => handleSelectTallaRopa(selectedTallaRopa)} className="text-red-500">X</button>
              </div>
            )}
            {selectedTallaZapatilla && (
              <div className="flex items-center mb-2">
                <span className="mr-2 text-gray-600">Talla de Zapatillas: {selectedTallaZapatilla}</span>
                <button type="button" onClick={() => handleSelectTallaZapatilla(selectedTallaZapatilla)} className="text-red-500">X</button>
              </div>
            )}
            {selectedAccesorio && (
              <div className="flex items-center mb-2">
                <span className="mr-2 text-gray-600">Tecnología: {selectedAccesorio}</span>
                <button type="button" onClick={() => handleSelectAccesorio(selectedAccesorio)} className="text-red-500">X</button>
              </div>
            )}
            {selectedDisponibilidad && (
              <div className="flex items-center mb-2">
                <span className="mr-2 text-gray-600">Disponibilidad: {selectedDisponibilidad}</span>
                <button type="button" onClick={() => handleSelectDisponibilidad(selectedDisponibilidad)} className="text-red-500">X</button>
              </div>
            )}
            {selectedMarca && (
              <div className="flex items-center mb-2">
                <span className="mr-2 text-gray-600">Marca: {selectedMarca}</span>
                <button type="button" onClick={() => handleSelectMarca(selectedMarca)} className="text-red-500">X</button>
              </div>
            )}
            {query && (
              <div className="flex items-center mb-2">
                <span className="mr-2 text-gray-600">Búsqueda: {query}</span>
                <button type="button" onClick={() => { 
                  ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
                  setQuery(""); 
                }} className="text-red-500">X</button>
              </div>
            )}
            {(precioMin || precioMax) && (
              <div className="flex items-center mb-2">
                <span className="mr-2 text-gray-600">
                  Precio: {precioMin ? `$${precioMin}` : '$0'} - {precioMax ? `$${precioMax}` : 'Max'}
                </span>
                <button type="button" onClick={() => { 
                  ignoreUrlInitRef.current = true; // Activar flag para ignorar inicialización
                  setPrecioMin(""); 
                  setPrecioMax(""); 
                }} className="text-red-500">X</button>
              </div>
            )}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`mb-4 px-4 py-2 text-white md:hidden bg-red-500 rounded-md shadow-md transition-all duration-300 ease-in-out transform hover:bg-red-600 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300`}
          >
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>
          {showFilters && (
            <>
              {/* Filtro de Marca */}
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">Marca</label>
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
                          className="mr-2"
                        />
                        <label htmlFor={`marca-${marca}`} className="text-gray-600 cursor-pointer">
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
                      <label className="block mb-1 font-medium text-gray-700">Tallas de Ropa</label>
                      <div className="overflow-auto max-h-32">
                        {Array.from(new Set(tallasRopa))
                          .sort((a, b) => {
                            const tallaOrder = ["XS", "S", "M", "L", "XL", "XXL", "OS"];
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
                                className="mr-2"
                              />
                              <label htmlFor={`talla-ropa-${talla}`} className="text-gray-600 cursor-pointer">
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
                      <label className="block mb-1 font-medium text-gray-700">Tallas de Zapatillas</label>
                      <div className="overflow-auto max-h-32">
                        {Array.from(new Set(tallasZapatilla))
                          .sort((a, b) => {
                            const parseTalla = (talla) => {
                              const parts = talla.split(" ");
                              const numericPart = parseFloat(parts[0].replace(",", "."));
                              return numericPart;
                            };
                            return parseTalla(a) - parseTalla(b);
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
                                className="mr-2"
                              />
                              <label htmlFor={`talla-zapatilla-${talla}`} className="text-gray-600 cursor-pointer">
                                {talla}
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Filtro de Tecnología (Accesorios) */}
                  {accesorios.length > 0 && (
                    <div className="mb-4">
                      <label className="block mb-1 font-medium text-gray-700">Tecnología</label>
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
                              className="mr-2"
                            />
                            <label htmlFor={`accesorio-${accesorio}`} className="text-gray-600 cursor-pointer">
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
                  <label className="block mb-1 font-medium text-gray-700">Tallas de Ropa</label>
                  <div className="overflow-auto max-h-32">
                    {Array.from(new Set(tallasRopa))
                      .sort((a, b) => {
                        const tallaOrder = ["XS", "S", "M", "L", "XL", "XXL", "OS"];
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
                            className="mr-2"
                          />
                          <label htmlFor={`talla-ropa-${talla}`} className="text-gray-600 cursor-pointer">
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
                  <label className="block mb-1 font-medium text-gray-700">Tallas de Zapatillas</label>
                  <div className="overflow-auto max-h-32">
                    {Array.from(new Set(tallasZapatilla))
                      .sort((a, b) => {
                        const parseTalla = (talla) => {
                          const parts = talla.split(" ");
                          const numericPart = parseFloat(parts[0].replace(",", "."));
                          return numericPart;
                        };
                        return parseTalla(a) - parseTalla(b);
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
                            className="mr-2"
                          />
                          <label htmlFor={`talla-zapatilla-${talla}`} className="text-gray-600 cursor-pointer">
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
                  <label className="block mb-1 font-medium text-gray-700">Tecnología</label>
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
                          className="mr-2"
                        />
                        <label htmlFor={`accesorio-${accesorio}`} className="text-gray-600 cursor-pointer">
                          {accesorio}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtro de Disponibilidad */}
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">Disponibilidad</label>
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => handleSelectDisponibilidad("Entrega inmediata")}
                    className={`p-2 rounded w-full ${
                      selectedDisponibilidad === "Entrega inmediata"
                        ? "bg-gray-600 text-white"
                        : "bg-gray-300 text-black"
                    } hover:bg-green-500 mb-1`}
                  >
                    Entrega inmediata
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDisponibilidad("Disponible en 3 días")}
                    className={`p-2 rounded w-full ${
                      selectedDisponibilidad === "Disponible en 3 días"
                        ? "bg-gray-600 text-white"
                        : "bg-gray-300 text-black"
                    } hover:bg-yellow-500 mb-1`}
                  >
                    Disponible en 3 días
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDisponibilidad("Disponible en 20 días")}
                    className={`p-2 rounded w-full ${
                      selectedDisponibilidad === "Disponible en 20 días"
                        ? "bg-gray-600 text-white"
                        : "bg-gray-300 text-black"
                    } hover:bg-red-500`}
                  >
                    Disponible en 20 días
                  </button>
                </div>
              </div>

              {/* Filtro de Precios */}
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">Precio</label>
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
                    className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
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
                    className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  className="w-full p-2 mb-2 text-white bg-red-500 rounded hover:bg-red-700"
                >
                  Buscar
                </button>
                <button
                  type="reset"
                  onClick={resetFilters}
                  className="w-full p-2 text-white bg-red-500 rounded hover:bg-red-700"
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
