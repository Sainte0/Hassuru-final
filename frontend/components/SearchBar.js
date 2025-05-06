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

  return (
    <div className="relative flex items-center">
      <div className="relative flex items-center transition-all duration-300 ease-in-out">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          placeholder="Buscar..."
          className={`transition-all duration-300 ease-in-out p-2 pl-10 border border-gray-300 rounded-lg outline-none shadow-sm focus:shadow-lg text-gray-800 ${
            isHamburgerOpen
              ? "w-64 opacity-100"
              : isFocused
              ? "w-64 opacity-100"
              : "w-0 opacity-0 p-0"
          }`}
          style={{
            transform: isFocused || isHamburgerOpen ? 'translateX(-100%)' : 'translateX(0)',
            marginLeft: isFocused || isHamburgerOpen ? '-256px' : '0'
          }}
        />
        <button
          type="button"
          className="absolute p-2 text-gray-500 transition-colors duration-300 right-2 hover:text-gray-700"
          onClick={handleToggleFocus}
        >
          <FaSearch />
        </button>
      </div>

      {filteredProducts.length > 0 && isFocused && (
        <ul className="absolute right-0 z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg top-12"
            style={{
              transform: 'translateX(-100%)',
              marginLeft: '-256px'
            }}>
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
