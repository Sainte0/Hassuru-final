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
      // Redirigir al catálogo con el filtro de búsqueda
      router.push({
        pathname: '/productos',
        query: { q: query.trim() }
      });
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
  const expandedWidthDesktop = '18rem'; // 288px

  return (
    <div className="relative flex items-center" style={{ minWidth: 40 }}>
      {/* Mobile: input expande a la izquierda, Desktop: a la derecha */}
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
        placeholder="Buscar..."
        className={
          `absolute transition-all duration-300 p-2 pl-3 border border-gray-300 rounded-lg outline-none shadow-sm focus:shadow-lg text-gray-800 bg-white
          right-10 top-1/2 -translate-y-1/2
          md:static md:translate-y-0 md:right-auto md:left-0`
        }
        style={{
          // Mobile: expande a la izquierda
          width: (isFocused || isHamburgerOpen)
            ? expandedWidth
            : 0,
          opacity: (isFocused || isHamburgerOpen) ? 1 : 0,
          pointerEvents: (isFocused || isHamburgerOpen) ? 'auto' : 'none',
          zIndex: 40,
          // Desktop: expande a la derecha
          ...(typeof window !== 'undefined' && window.innerWidth >= 768
            ? {
                position: 'static',
                width: (isFocused || isHamburgerOpen) ? expandedWidthDesktop : 0,
                minWidth: 0,
                marginLeft: 0,
                right: 'auto',
                left: 0,
                transform: 'none',
              }
            : {})
        }}
      />
      {/* Search icon siempre visible */}
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

      {/* Resultados: Mobile a la izquierda, Desktop a la derecha */}
      {filteredProducts.length > 0 && (isFocused || isHamburgerOpen) && (
        <ul
          className={
            `absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg
            right-10 mt-2
            md:left-0 md:right-auto md:mt-0 md:top-full`
          }
          style={{
            width: typeof window !== 'undefined' && window.innerWidth >= 768 ? expandedWidthDesktop : expandedWidth,
            maxHeight: 240,
            overflowY: 'auto',
            top: typeof window !== 'undefined' && window.innerWidth >= 768 ? '2.5rem' : undefined
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
