import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/router";
import Image from "next/image";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProducts = async (searchQuery) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/buscar/${searchQuery}?limit=5`);
      const data = await res.json();
      if (res.ok) {
        setFilteredProducts(data);
      } else {
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setFilteredProducts([]);
    }
  };

  const handleInputChange = (e) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);
    setShowResults(true);

    if (searchQuery.trim()) {
      fetchProducts(searchQuery);
    } else {
      setFilteredProducts([]);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push({
        pathname: '/catalogo',
        query: { q: query.trim() }
      });
      setShowResults(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleProductClick = (productId) => {
    router.push(`/producto/${productId}`);
    setQuery("");
    setFilteredProducts([]);
    setShowResults(false);
  };

  return (
    <div className="w-full bg-white border-b border-gray-200" ref={searchRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="flex items-center">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onKeyPress={handleKeyPress}
              placeholder="Buscar productos, marcas, etc."
              className="w-full py-3 pl-4 pr-12 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FaSearch className="w-5 h-5" />
            </button>
          </div>

          {/* Resultados de búsqueda */}
          {showResults && filteredProducts.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="py-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-12 h-12 relative">
                      <Image
                        src={product.imagen || '/placeholder.jpg'}
                        alt={product.nombre}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">{product.nombre}</p>
                      <p className="text-sm text-gray-500">${product.precio} USD</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
