import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { sortProductsByAvailability } from '../utils/sortProducts';

export default function Filter({ products, setFilteredProducts }) {
  const router = useRouter();
  const [selectedTallaRopa, setSelectedTallaRopa] = useState("");
  const [selectedTallaZapatilla, setSelectedTallaZapatilla] = useState("");
  const [selectedAccesorio, setSelectedAccesorio] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [stockOnly, setStockOnly] = useState(false);
  const [selectedDisponibilidad, setSelectedDisponibilidad] = useState("");
  const [tallasRopa, setTallasRopa] = useState([]);
  const [tallasZapatilla, setTallasZapatilla] = useState([]);
  const [accesorios, setAccesorios] = useState([]);
  const [selectedMarca, setSelectedMarca] = useState("");
  const [marcas, setMarcas] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [query, setQuery] = useState("");

  // Initialize filters from URL parameters
  useEffect(() => {
    if (router.isReady) {
      const { tallaRopa, tallaZapatilla, accesorio, precioMin, precioMax, stock, disponibilidad, marca, q } = router.query;
      
      // Decodificar los parámetros de la URL
      if (tallaRopa) setSelectedTallaRopa(decodeURIComponent(tallaRopa));
      if (tallaZapatilla) setSelectedTallaZapatilla(decodeURIComponent(tallaZapatilla));
      if (accesorio) setSelectedAccesorio(decodeURIComponent(accesorio));
      if (precioMin) setPrecioMin(decodeURIComponent(precioMin));
      if (precioMax) setPrecioMax(decodeURIComponent(precioMax));
      if (stock === 'true') setStockOnly(true);
      if (disponibilidad) setSelectedDisponibilidad(decodeURIComponent(disponibilidad));
      if (marca) setSelectedMarca(decodeURIComponent(marca));
      if (q) setQuery(decodeURIComponent(q));
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setShowFilters(false);
    }
  }, []);

  useEffect(() => {
    const marcasSet = new Set();
    products.forEach((product) => marcasSet.add(product.marca));
    setMarcas(Array.from(marcasSet));
  }, [products]);

  // Update URL when filters change
  useEffect(() => {
    if (router.isReady) {
      const queryParams = {};
      
      if (selectedTallaRopa) queryParams.tallaRopa = encodeURIComponent(selectedTallaRopa);
      if (selectedTallaZapatilla) queryParams.tallaZapatilla = encodeURIComponent(selectedTallaZapatilla);
      if (selectedAccesorio) queryParams.accesorio = encodeURIComponent(selectedAccesorio);
      if (precioMin) queryParams.precioMin = encodeURIComponent(precioMin);
      if (precioMax) queryParams.precioMax = encodeURIComponent(precioMax);
      if (stockOnly) queryParams.stock = 'true';
      if (selectedDisponibilidad) queryParams.disponibilidad = encodeURIComponent(selectedDisponibilidad);
      if (selectedMarca) queryParams.marca = encodeURIComponent(selectedMarca);
      if (query) queryParams.q = encodeURIComponent(query);
      
      // Preserve the category parameter if it exists
      if (router.query.categoria) {
        queryParams.categoria = router.query.categoria;
      }
      
      // Update URL without triggering a page reload
      router.push(
        {
          pathname: router.pathname,
          query: queryParams,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [
    selectedTallaRopa,
    selectedTallaZapatilla,
    selectedAccesorio,
    precioMin,
    precioMax,
    stockOnly,
    selectedDisponibilidad,
    selectedMarca,
    query,
    router.isReady,
    router.pathname,
    router.query.categoria
  ]);

  // Extract available sizes from products
  useEffect(() => {
    const tallasRopaSet = new Set();
    const tallasZapatillaSet = new Set();
    const accesoriosSet = new Set();

    products.forEach((product) => {
      if (product.categoria === "ropa") {
        product.tallas.forEach((tallaObj) => tallasRopaSet.add(tallaObj.talla));
      } else if (product.categoria === "zapatillas") {
        product.tallas.forEach((tallaObj) => tallasZapatillaSet.add(tallaObj.talla));
      } else if (product.categoria === "accesorios") {
        product.tallas.forEach((tallaObj) => accesoriosSet.add(tallaObj.talla));
      }
    });

    setTallasRopa(Array.from(tallasRopaSet));
    setTallasZapatilla(Array.from(tallasZapatillaSet));
    setAccesorios(Array.from(accesoriosSet));
  }, [products]);

  // Combined filter effect - this is the main filtering logic
  useEffect(() => {
    let filtered = [...products];

    // Apply marca filter
    if (selectedMarca) {
      filtered = filtered.filter((product) => product.marca === selectedMarca);
    }

    // Apply talla filters
    if (selectedTallaRopa) {
      filtered = filtered.filter((product) => {
        // Verificar que el producto sea de la categoría correcta y tenga tallas
        if (product.categoria !== "ropa" || !Array.isArray(product.tallas) || product.tallas.length === 0) {
          return false;
        }
        // Buscar la talla exacta en el array de tallas
        return product.tallas.some((tallaObj) => tallaObj.talla === selectedTallaRopa);
      });
    }

    if (selectedTallaZapatilla) {
      filtered = filtered.filter((product) => {
        // Verificar que el producto sea de la categoría correcta y tenga tallas
        if (product.categoria !== "zapatillas" || !Array.isArray(product.tallas) || product.tallas.length === 0) {
          return false;
        }
        // Buscar la talla exacta en el array de tallas
        return product.tallas.some((tallaObj) => tallaObj.talla === selectedTallaZapatilla);
      });
    }

    if (selectedAccesorio) {
      filtered = filtered.filter((product) => {
        // Verificar que el producto sea de la categoría correcta y tenga tallas
        if (product.categoria !== "accesorios" || !Array.isArray(product.tallas) || product.tallas.length === 0) {
          return false;
        }
        // Buscar la talla exacta en el array de tallas
        return product.tallas.some((tallaObj) => tallaObj.talla === selectedAccesorio);
      });
    }

    // Apply price filters
    if (precioMin || precioMax) {
      filtered = filtered.filter((product) => {
        const precio = product.precio;
        if (precioMin && precioMax) {
          return precio >= parseInt(precioMin) && precio <= parseInt(precioMax);
        } else if (precioMin) {
          return precio >= parseInt(precioMin);
        } else if (precioMax) {
          return precio <= parseInt(precioMax);
        }
        return true;
      });
    }

    // Apply stock filter
    if (stockOnly) {
      filtered = filtered.filter((product) =>
        product.tallas.some((talla) => talla.precioTalla > 0)
      );
    }

    // Apply disponibilidad filter
    if (selectedDisponibilidad) {
      filtered = filtered.filter((product) => {
        if (selectedDisponibilidad === "Solo productos en stock") {
          return product.tallas.some((talla) => talla.precioTalla > 0);
        }
        return getDisponibilidad(product) === selectedDisponibilidad;
      });
    }

    // Apply search query filter
    if (query) {
      filtered = filtered.filter((product) =>
        product.nombre.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Sort the filtered products
    const sortedFiltered = sortProductsByAvailability(filtered);
    setFilteredProducts(sortedFiltered);
  }, [
    products,
    selectedMarca,
    selectedTallaRopa,
    selectedTallaZapatilla,
    selectedAccesorio,
    precioMin,
    precioMax,
    stockOnly,
    selectedDisponibilidad,
    query
  ]);

  const handleSearch = () => {
    // This function is now redundant as the filtering is handled by the useEffect
    // But we'll keep it for backward compatibility
    let filtered = [...products];
    
    if (precioMin || precioMax) {
      filtered = filtered.filter((product) => {
        const precio = product.precio;
        if (precioMin && precioMax) {
          return precio >= parseInt(precioMin) && precio <= parseInt(precioMax);
        } else if (precioMin) {
          return precio >= parseInt(precioMin);
        } else if (precioMax) {
          return precio <= parseInt(precioMax);
        }
        return true;
      });
    }
    
    if (query) {
      filtered = filtered.filter((product) =>
        product.nombre.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    const sortedFiltered = sortProductsByAvailability(filtered);
    setFilteredProducts(sortedFiltered);
  };

  const resetFilters = () => {
    setSelectedTallaRopa("");
    setSelectedTallaZapatilla("");
    setSelectedAccesorio("");
    setSelectedMarca("");
    setPrecioMin("");
    setPrecioMax("");
    setStockOnly(false);
    setSelectedDisponibilidad("");
    setQuery("");
    setFilteredProducts(products);
  };

  const handleSelectTallaRopa = (talla) => {
    setSelectedTallaRopa(talla);
    setSelectedTallaZapatilla("");
    setSelectedAccesorio("");
  };

  const handleSelectTallaZapatilla = (talla) => {
    setSelectedTallaZapatilla(talla);
    setSelectedTallaRopa("");
    setSelectedAccesorio("");
  };

  const handleSelectAccesorio = (accesorio) => {
    setSelectedAccesorio(accesorio);
    setSelectedTallaRopa("");
    setSelectedTallaZapatilla("");
  };

  const getDisponibilidad = (product) => {
    // Verifica si el array 'tallas' tiene algún objeto con precioTalla
    const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;

    if (hasTallas && product.encargo) {
      return "Disponible en 3 días";
    } else if (hasTallas) {
      return "Entrega inmediata";
    } else {
      return "Disponible en 20 días";
    }
  };

  const handleSelectDisponibilidad = (opcion) => {
    if (selectedDisponibilidad === opcion) {
      setSelectedDisponibilidad("");
    } else {
      setSelectedDisponibilidad(opcion);
    }
  };

  const handleSelectMarca = (marca) => {
    setSelectedMarca(marca);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <main className="px-4 font-semibold md:px-12">
      <div className="mb-4">
        <h3 className="mb-3 text-xl font-semibold text-gray-800">Filtros</h3>
        <div className="mb-4">
          {selectedTallaRopa && (
            <div className="flex items-center mb-2">
              <span className="mr-2 text-gray-600">Talla de Ropa: {selectedTallaRopa}</span>
              <button onClick={() => setSelectedTallaRopa("")} className="text-red-500">X</button>
            </div>
          )}
          {selectedTallaZapatilla && (
            <div className="flex items-center mb-2">
              <span className="mr-2 text-gray-600">Talla de Zapatillas: {selectedTallaZapatilla}</span>
              <button onClick={() => setSelectedTallaZapatilla("")} className="text-red-500">X</button>
            </div>
          )}
          {selectedAccesorio && (
            <div className="flex items-center mb-2">
              <span className="mr-2 text-gray-600">Tecnología: {selectedAccesorio}</span>
              <button onClick={() => setSelectedAccesorio("")} className="text-red-500">X</button>
            </div>
          )}
          {stockOnly && (
            <div className="flex items-center mb-2">
              <span className="mr-2 text-gray-600">Solo en stock</span>
              <button onClick={() => setStockOnly(false)} className="text-red-500">X</button>
            </div>
          )}
          {selectedDisponibilidad && (
            <div className="flex items-center mb-2">
              <span className="mr-2 text-gray-600">Disponibilidad: {selectedDisponibilidad}</span>
              <button onClick={() => setSelectedDisponibilidad("")} className="text-red-500">X</button>
            </div>
          )}
          {selectedMarca && (
            <div className="flex items-center mb-2">
              <span className="mr-2 text-gray-600">Marca: {selectedMarca}</span>
              <button onClick={() => setSelectedMarca("")} className="text-red-500">X</button>
            </div>
          )}
          {query && (
            <div className="flex items-center mb-2">
              <span className="mr-2 text-gray-600">Búsqueda: {query}</span>
              <button onClick={() => setQuery("")} className="text-red-500">X</button>
            </div>
          )}
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`mb-4 px-4 py-2 text-white md:hidden bg-red-500 rounded-md shadow-md transition-all duration-300 ease-in-out transform hover:bg-red-600 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300`}
        >
          {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
        </button>
        {showFilters && (
          <>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Marca</label>
              <div className="overflow-auto max-h-32">
                {marcas.map((marca, index) => (
                  <div key={index} className="mb-2 mr-2">
                    <input
                      type="radio"
                      id={`marca-${marca}`}
                      name="marca"
                      value={marca}
                      checked={selectedMarca === marca}
                      onChange={() => handleSelectMarca(marca)}
                      className="mr-1"
                    />
                    <label htmlFor={`marca-${marca}`} className="p-2 bg-white rounded cursor-pointer">
                      {marca}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            {tallasRopa.length > 0 && (
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">Talla de Ropa</label>
                {Array.from(new Set(tallasRopa))
                  .sort((a, b) => {
                    const tallaOrder = ["XS","S", "M", "L", "XL", "XXL" , "OS"];
                    return tallaOrder.indexOf(a) - tallaOrder.indexOf(b);
                  })
                  .map((talla, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="radio"
                        id={`tallaRopa-${talla}`}
                        name="tallaRopa"
                        value={talla}
                        checked={selectedTallaRopa === talla}
                        onChange={() => handleSelectTallaRopa(talla)}
                        className="mr-2"
                      />
                      <label htmlFor={`tallaRopa-${talla}`} className="text-gray-600 cursor-pointer">
                        {talla}
                      </label>
                    </div>
                  ))}
              </div>
            )}
            {tallasZapatilla.length > 0 && (
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">Talla de Zapatillas</label>
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
                      <div key={index} className="mb-2 mr-2">
                        <input
                          type="radio"
                          id={`tallaZapatilla-${talla}`}
                          name="tallaZapatilla"
                          value={talla}
                          checked={selectedTallaZapatilla === talla}
                          onChange={() => handleSelectTallaZapatilla(talla)}
                          className="mr-1"
                        />
                        <label
                          htmlFor={`tallaZapatilla-${talla}`}
                          className="p-2 text-gray-600 bg-white rounded cursor-pointer"
                        >
                          {talla}
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            )}
            {accesorios.length > 0 && (
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">Tecnología</label>
                <div className="overflow-auto max-h-32">
                  {accesorios.map((accesorio, index) => (
                    <div key={index} className="flex items-center mb-1">
                      <input
                        type="radio"
                        id={`accesorio-${accesorio}`}
                        name="accesorio"
                        value={accesorio}
                        checked={selectedAccesorio === accesorio}
                        onChange={() => handleSelectAccesorio(accesorio)}
                        className="mr-1"
                      />
                      <label
                        htmlFor={`accesorio-${accesorio}`}
                        className="p-1 text-gray-600 bg-white rounded cursor-pointer"
                      >
                        {accesorio}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">Precio</label>
              <input
                type="number"
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
                placeholder="Min"
              />
              <input
                type="number"
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
                className="w-full p-2 mt-2 bg-gray-100 border border-gray-300 rounded"
                placeholder="Max"
              />
            </div>
            <div className="mt-4">
              <button
                onClick={handleSearch}
                className="w-full p-2 mb-2 text-white bg-red-500 rounded hover:bg-red-700"
              >
                Buscar
              </button>
              <button
                onClick={resetFilters}
                className="w-full p-2 text-white bg-red-500 rounded hover:bg-red-700"
              >
                Reiniciar Filtros
              </button>
            </div>
          </>
        )}
      </div>
      <div className="mt-4">
        <h4 className="mb-1 font-semibold">Disponibilidad</h4>
        <div className="flex flex-col">
          <button
            onClick={() => handleSelectDisponibilidad("Entrega inmediata")}
            className={`p-2 rounded w-full ${selectedDisponibilidad === "Entrega inmediata"
              ? "bg-gray-600 text-white"
              : "bg-gray-300 text-black"
              } hover:bg-green-500 mb-1`}
          >
            Entrega inmediata
          </button>
          <button
            onClick={() => handleSelectDisponibilidad("Disponible en 3 días")}
            className={`p-2 rounded w-full ${selectedDisponibilidad === "Disponible en 3 días"
              ? "bg-gray-600 text-white"
              : "bg-gray-300 text-black"
              } hover:bg-yellow-500 mb-1`}
          >
            Disponible en 3 días
          </button>
          <button
            onClick={() => handleSelectDisponibilidad("Disponible en 20 días")}
            className={`p-2 rounded w-full ${selectedDisponibilidad === "Disponible en 20 días"
              ? "bg-gray-600 text-white"
              : "bg-gray-300 text-black"
              } hover:bg-red-500`}
          >
            Disponible en 20 días
          </button>
        </div>
      </div>
    </main>
  );
}
