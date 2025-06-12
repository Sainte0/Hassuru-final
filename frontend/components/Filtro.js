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
  const [marcas, setMarcas] = useState({
    zapatillas: [],
    ropa: [],
    accesorios: []
  });
  const [showFilters, setShowFilters] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");

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

    // Filtrar por categoría
    if (selectedCategoria) {
      filtered = filtered.filter(product => product.categoria === selectedCategoria);
    }

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
    const marcasPorCategoria = {
      zapatillas: new Set(),
      ropa: new Set(),
      accesorios: new Set()
    };

    products.forEach((product) => {
      if (product.marca && product.categoria) {
        // Manejar el array de marcas
        const marcas = Array.isArray(product.marca) ? product.marca : [product.marca];
        marcas.forEach(marca => {
          if (product.categoria === "zapatillas") {
            marcasPorCategoria.zapatillas.add(marca);
          } else if (product.categoria === "ropa") {
            marcasPorCategoria.ropa.add(marca);
          } else if (product.categoria === "accesorios") {
            marcasPorCategoria.accesorios.add(marca);
          }
        });
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
    setMarcas({
      zapatillas: Array.from(marcasPorCategoria.zapatillas).sort(),
      ropa: Array.from(marcasPorCategoria.ropa).sort(),
      accesorios: Array.from(marcasPorCategoria.accesorios).sort()
    });
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

  const handleSelectCategoria = (categoria) => {
    if (selectedCategoria === categoria) {
      setSelectedCategoria("");
    } else {
      setSelectedCategoria(categoria);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
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
            {/* Filtro de Marcas */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Marca</label>
              <div className="overflow-auto max-h-32">
                {marcas.zapatillas.concat(marcas.ropa, marcas.accesorios).sort().map((marca, index) => (
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

            {/* Filtro de Tallas de Ropa */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Tallas de Ropa</label>
              <div className="overflow-auto max-h-32">
                {tallasRopa.map((talla, index) => (
                  <div key={index} className="mb-2 mr-2">
                    <input
                      type="radio"
                      id={`talla-ropa-${talla}`}
                      name="tallaRopa"
                      value={talla}
                      checked={selectedTallaRopa === talla}
                      onChange={() => handleSelectTallaRopa(talla)}
                      className="mr-1"
                    />
                    <label htmlFor={`talla-ropa-${talla}`} className="p-2 bg-white rounded cursor-pointer">
                      {talla}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtro de Tallas de Zapatillas */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Tallas de Zapatillas</label>
              <div className="overflow-auto max-h-32">
                {tallasZapatilla.map((talla, index) => (
                  <div key={index} className="mb-2 mr-2">
                    <input
                      type="radio"
                      id={`talla-zapatilla-${talla}`}
                      name="tallaZapatilla"
                      value={talla}
                      checked={selectedTallaZapatilla === talla}
                      onChange={() => handleSelectTallaZapatilla(talla)}
                      className="mr-1"
                    />
                    <label htmlFor={`talla-zapatilla-${talla}`} className="p-2 bg-white rounded cursor-pointer">
                      {talla}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtro de Accesorios */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Tecnología</label>
              <div className="overflow-auto max-h-32">
                {accesorios.map((accesorio, index) => (
                  <div key={index} className="mb-2 mr-2">
                    <input
                      type="radio"
                      id={`accesorio-${accesorio}`}
                      name="accesorio"
                      value={accesorio}
                      checked={selectedAccesorio === accesorio}
                      onChange={() => handleSelectAccesorio(accesorio)}
                      className="mr-1"
                    />
                    <label htmlFor={`accesorio-${accesorio}`} className="p-2 bg-white rounded cursor-pointer">
                      {accesorio}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtro de Disponibilidad */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Disponibilidad</label>
              <div className="overflow-auto max-h-32">
                {["En Stock", "Agotado", "Encargo"].map((disponibilidad, index) => (
                  <div key={index} className="mb-2 mr-2">
                    <input
                      type="radio"
                      id={`disponibilidad-${disponibilidad}`}
                      name="disponibilidad"
                      value={disponibilidad}
                      checked={selectedDisponibilidad === disponibilidad}
                      onChange={() => handleSelectDisponibilidad(disponibilidad)}
                      className="mr-1"
                    />
                    <label htmlFor={`disponibilidad-${disponibilidad}`} className="p-2 bg-white rounded cursor-pointer">
                      {disponibilidad}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtro de Stock */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={stockOnly}
                  onChange={(e) => setStockOnly(e.target.checked)}
                  className="mr-2"
                />
                Solo en stock
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
