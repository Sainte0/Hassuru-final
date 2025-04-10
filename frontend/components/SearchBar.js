import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/router";
import { BounceLoader } from 'react-spinners';

export default function SearchBar({ isHamburgerOpen }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef(null);

  const fetchProducts = async (searchQuery) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/buscar/${searchQuery}?limit=10`);
      const data = await res.json();
      if (res.ok) {
        setFilteredProducts(data);
      } else {
        setFilteredProducts([]);
        console.error("Error al obtener productos:", data.error);
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setFilteredProducts([]);
    }
  };

  const handleInputChange = async (e) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);
    
    if (searchQuery.trim().length > 2) {
      setSearchLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/buscar?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error("Error en la búsqueda");
        
        const data = await response.json();
        setFilteredProducts(data.slice(0, 5)); // Limitar a 5 resultados
        setShowSearchResults(true);
      } catch (error) {
        console.error("Error en la búsqueda:", error);
        setFilteredProducts([]);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setFilteredProducts([]);
      setShowSearchResults(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/catalogo?search=${encodeURIComponent(query)}`);
    }
    setQuery("");
    setFilteredProducts([]);
    setIsFocused(false);
    setShowSearchResults(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(e);
    }
  };

  const handleToggleFocus = () => {
    setIsFocused(!isFocused);
    if (isFocused) {
      setQuery("");
      setFilteredProducts([]);
    }
  };

  const handleBlur = () => {
    if (!query) setIsFocused(false);
  };

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cerrar resultados cuando se abre el menú hamburguesa
  useEffect(() => {
    if (isHamburgerOpen) {
      setShowSearchResults(false);
    }
  }, [isHamburgerOpen]);

  return (
    <div className="relative flex items-center" ref={searchRef}>
      <div className="relative flex items-center transition-all duration-300 ease-in-out">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          placeholder="Buscar..."
          className={`transition-all duration-300 ease-in-out p-2 pl-10 border border-gray-300 rounded-lg outline-none shadow-sm focus:shadow-lg text-gray-800 ${isHamburgerOpen
            ? "w-64 opacity-100"
            : isFocused
              ? "w-64 opacity-100"
              : "w-0 opacity-0 p-0"
            }`}
        />
        <button
          type="button"
          className="absolute p-2 text-gray-500 transition-colors duration-300 left-2 hover:text-gray-700"
          onClick={handleToggleFocus}
        >
          <FaSearch />
        </button>
      </div>

      {showSearchResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {searchLoading ? (
            <div className="flex items-center justify-center p-4">
              <BounceLoader color="#BE1A1D" size={20} />
            </div>
          ) : filteredProducts.length > 0 ? (
            <ul className="py-2">
              {filteredProducts.map((product) => (
                <li
                  key={product._id}
                  onClick={() => handleSearch(e)}
                  className="px-4 py-2 text-gray-800 cursor-pointer hover:bg-gray-100"
                >
                  <div className="font-medium">{product.nombre}</div>
                  {product.descripcion && (
                    <div className="text-sm text-gray-600">{product.descripcion}</div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-gray-500">No se encontraron resultados</div>
          )}
        </div>
      )}
    </div>
  );
}
