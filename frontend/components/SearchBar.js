import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/router";

export default function SearchBar({ isHamburgerOpen }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const router = useRouter();

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

  const handleInputChange = (e) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);

    if (searchQuery.trim()) {
      fetchProducts(searchQuery);
    } else {
      setFilteredProducts([]);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/productos?q=${encodeURIComponent(query.trim())}`);
    }
    setQuery("");
    setFilteredProducts([]);
    setIsFocused(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
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

  const handleProductClick = (productId) => {
    router.push(`/producto/${productId}`);
    setQuery("");
    setFilteredProducts([]);
    setIsFocused(false);
  };

  // Width for expanded input
  const expandedWidth = '12rem'; // 192px

  return (
    <div className="relative flex items-center" style={{ minWidth: 40 }}>
      {/* Search input absolutely positioned, expands from right to left */}
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
        placeholder="Buscar..."
        className="absolute right-10 top-1/2 -translate-y-1/2 transition-all duration-300 p-2 pl-3 border border-gray-300 rounded-lg outline-none shadow-sm focus:shadow-lg text-gray-800 bg-white"
        style={{
          width: (isFocused || isHamburgerOpen) ? expandedWidth : 0,
          opacity: (isFocused || isHamburgerOpen) ? 1 : 0,
          pointerEvents: (isFocused || isHamburgerOpen) ? 'auto' : 'none',
          zIndex: 40
        }}
      />
      {/* Search icon always visible, at the right edge */}
      <button
        type="button"
        className="relative z-50 p-2 text-gray-500 transition-colors duration-300 bg-gray-800 rounded hover:text-gray-300"
        onClick={handleToggleFocus}
        tabIndex={0}
        aria-label="Buscar"
        style={{ minWidth: 40 }}
      >
        <FaSearch />
      </button>

      {/* Results dropdown, also expands from right to left */}
      {filteredProducts.length > 0 && (isFocused || isHamburgerOpen) && (
        <ul
          className="absolute right-10 mt-2 z-50 bg-white border border-gray-300 rounded-md shadow-lg"
          style={{
            width: expandedWidth,
            maxHeight: 240,
            overflowY: 'auto',
            top: '2.5rem'
          }}
        >
          {filteredProducts.map((product) => (
            <li key={product._id} className="px-4 py-2 hover:bg-gray-100">
              <div
                onClick={() => handleProductClick(product._id)}
                className="cursor-pointer"
              >
                <p className="font-semibold text-black">{product.nombre}</p>
                {product.descripcion && (
                  <p className="text-sm text-gray-600 truncate">
                    {product.descripcion}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
