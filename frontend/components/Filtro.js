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
      const { marca, tallaRopa, tallaZapatilla, accesorio, disponibilidad, stock, q, min, max } = router.query;
      
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

  // Update URL and apply filters when any filter changes
  useEffect(() => {
    if (router.isReady) {
      const queryParams = {};
      
      // Solo agregar filtros que tengan valor (no vacíos)
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
          precioMin: precioMin || '',
          precioMax: precioMax || '',
          disponibilidad: selectedDisponibilidad || '',
          marca: selectedMarca || '',
          q: query || ''
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
    precioMin,
    precioMax,
    selectedDisponibilidad,
    selectedMarca,
    query,
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
    } else {
      setSelectedAccesorio(accesorio);
      setSelectedTallaRopa("");
      setSelectedTallaZapatilla("");
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
                    onClick={() => handleSelectDisponibilidad("Disponible en 5 días")}
                    className={`p-2 rounded w-full ${
                      selectedDisponibilidad === "Disponible en 5 días"
                        ? "bg-gray-600 text-white"
                        : "bg-gray-300 text-black"
                    } hover:bg-yellow-500 mb-1`}
                  >
                    Disponible en 5 días
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
