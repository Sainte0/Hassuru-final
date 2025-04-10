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
      
      if (tallaRopa) setSelectedTallaRopa(decodeURIComponent(tallaRopa));
      if (tallaZapatilla) setSelectedTallaZapatilla(decodeURIComponent(tallaZapatilla));
      if (accesorio) setSelectedAccesorio(decodeURIComponent(accesorio));
      if (precioMin) setPrecioMin(decodeURIComponent(precioMin));
      if (precioMax) setPrecioMax(decodeURIComponent(precioMax));
      if (stock === 'true') setStockOnly(true);
      if (disponibilidad) setSelectedDisponibilidad(decodeURIComponent(disponibilidad));
      if (marca) setSelectedMarca(decodeURIComponent(marca));
      if (q) setQuery(decodeURIComponent(q));

      // Aplicar los filtros inmediatamente después de cargar los parámetros de la URL
      applyFilters(products, {
        tallaRopa: tallaRopa ? decodeURIComponent(tallaRopa) : "",
        tallaZapatilla: tallaZapatilla ? decodeURIComponent(tallaZapatilla) : "",
        accesorio: accesorio ? decodeURIComponent(accesorio) : "",
        precioMin: precioMin ? decodeURIComponent(precioMin) : "",
        precioMax: precioMax ? decodeURIComponent(precioMax) : "",
        stock: stock === 'true',
        disponibilidad: disponibilidad ? decodeURIComponent(disponibilidad) : "",
        marca: marca ? decodeURIComponent(marca) : "",
        q: q ? decodeURIComponent(q) : ""
      });
    }
  }, [router.isReady, router.query, products]);

  // Función para aplicar todos los filtros
  const applyFilters = (productsToFilter, filters) => {
    let filtered = [...productsToFilter];

    // Filtro de marca
    if (filters.marca) {
      filtered = filtered.filter(product => 
        product.marca === filters.marca
      );
    }

    // Filtro de talla de ropa
    if (filters.tallaRopa) {
      filtered = filtered.filter(product => 
        product.categoria === "ropa" && 
        product.tallas.some(talla => talla.talla === filters.tallaRopa)
      );
    }

    // Filtro de talla de zapatilla
    if (filters.tallaZapatilla) {
      filtered = filtered.filter(product => 
        product.categoria === "zapatillas" && 
        product.tallas.some(talla => talla.talla === filters.tallaZapatilla)
      );
    }

    // Filtro de accesorio
    if (filters.accesorio) {
      filtered = filtered.filter(product => 
        product.categoria === "accesorios" && 
        product.tallas.some(talla => talla.talla === filters.accesorio)
      );
    }

    // Filtro de precio
    if (filters.precioMin || filters.precioMax) {
      filtered = filtered.filter(product => {
        const precio = parseFloat(product.precio);
        const min = filters.precioMin ? parseFloat(filters.precioMin) : -Infinity;
        const max = filters.precioMax ? parseFloat(filters.precioMax) : Infinity;
        return precio >= min && precio <= max;
      });
    }

    // Filtro de stock
    if (filters.stock) {
      filtered = filtered.filter(product => 
        product.tallas.some(talla => talla.stock > 0)
      );
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
    }

    // Filtro de búsqueda
    if (filters.q) {
      const searchQuery = filters.q.toLowerCase();
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchQuery) ||
        product.marca.toLowerCase().includes(searchQuery)
      );
    }

    setFilteredProducts(sortProductsByAvailability(filtered));
  };

  // Update URL and apply filters when any filter changes
  useEffect(() => {
    if (router.isReady) {
      const queryParams = {};
      
      if (selectedTallaRopa) queryParams.tallaRopa = selectedTallaRopa;
      if (selectedTallaZapatilla) queryParams.tallaZapatilla = selectedTallaZapatilla;
      if (selectedAccesorio) queryParams.accesorio = selectedAccesorio;
      if (precioMin) queryParams.precioMin = precioMin;
      if (precioMax) queryParams.precioMax = precioMax;
      if (stockOnly) queryParams.stock = 'true';
      if (selectedDisponibilidad) queryParams.disponibilidad = selectedDisponibilidad;
      if (selectedMarca) queryParams.marca = selectedMarca;
      if (query) queryParams.q = query;
      
      // Preserve the category parameter if it exists
      if (router.query.categoria) {
        queryParams.categoria = router.query.categoria;
      }

      // Update URL
      router.push(
        {
          pathname: router.pathname,
          query: queryParams,
        },
        undefined,
        { shallow: true }
      );

      // Pass filters to parent component
      setFilteredProducts({
        tallaRopa: selectedTallaRopa,
        tallaZapatilla: selectedTallaZapatilla,
        accesorio: selectedAccesorio,
        precioMin,
        precioMax,
        stock: stockOnly,
        disponibilidad: selectedDisponibilidad,
        marca: selectedMarca,
        q: query
      });
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
    products
  ]);

  // Extract available sizes from products
  useEffect(() => {
    const tallasRopaSet = new Set();
    const tallasZapatillaSet = new Set();
    const accesoriosSet = new Set();
    const marcasSet = new Set();

    products.forEach((product) => {
      if (product.marca) {
        marcasSet.add(product.marca);
      }

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
    setMarcas(Array.from(marcasSet));
  }, [products]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setShowFilters(false);
    }
  }, []);

  const handleSelectMarca = (marca) => {
    if (selectedMarca === marca) {
      setSelectedMarca("");
    } else {
      setSelectedMarca(marca);
    }
  };

  const handleSelectTallaRopa = (talla) => {
    if (selectedTallaRopa === talla) {
      setSelectedTallaRopa("");
    } else {
      setSelectedTallaRopa(talla);
      setSelectedTallaZapatilla("");
      setSelectedAccesorio("");
    }
  };

  const handleSelectTallaZapatilla = (talla) => {
    if (selectedTallaZapatilla === talla) {
      setSelectedTallaZapatilla("");
    } else {
      setSelectedTallaZapatilla(talla);
      setSelectedTallaRopa("");
      setSelectedAccesorio("");
    }
  };

  const handleSelectAccesorio = (accesorio) => {
    if (selectedAccesorio === accesorio) {
      setSelectedAccesorio("");
    } else {
      setSelectedAccesorio(accesorio);
      setSelectedTallaRopa("");
      setSelectedTallaZapatilla("");
    }
  };

  const handleSelectDisponibilidad = (opcion) => {
    if (selectedDisponibilidad === opcion) {
      setSelectedDisponibilidad("");
    } else {
      setSelectedDisponibilidad(opcion);
    }
  };

  const handleSearch = () => {
    // Aplicar los filtros actuales
    applyFilters(products, {
      tallaRopa: selectedTallaRopa,
      tallaZapatilla: selectedTallaZapatilla,
      accesorio: selectedAccesorio,
      precioMin,
      precioMax,
      stock: stockOnly,
      disponibilidad: selectedDisponibilidad,
      marca: selectedMarca,
      q: query
    });
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
    
    // Limpiar la URL y resetear los filtros
    router.push(
      {
        pathname: router.pathname,
        query: router.query.categoria ? { categoria: router.query.categoria } : {}
      },
      undefined,
      { shallow: true }
    );

    // Resetear los filtros
    setFilteredProducts({});
  };

  // Prevenir el comportamiento por defecto del formulario
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <main className="px-4 font-semibold md:px-12">
      <form onSubmit={handleFormSubmit}>
        <div className="mb-4">
          <h3 className="mb-3 text-xl font-semibold text-gray-800">Filtros</h3>
          <div className="mb-4">
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
            {stockOnly && (
              <div className="flex items-center mb-2">
                <span className="mr-2 text-gray-600">Solo en stock</span>
                <button type="button" onClick={() => setStockOnly(false)} className="text-red-500">X</button>
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
                <button type="button" onClick={() => setQuery("")} className="text-red-500">X</button>
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
