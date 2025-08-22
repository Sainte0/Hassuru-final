import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/router";
import Image from "next/image";
import { useGA4 } from '../hooks/useGA4';

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const searchRef = useRef(null);
  const { search } = useGA4();

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
      // Evento GA4: Buscar
      search(query.trim());
      
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

  const getImageUrl = (product) => {
    if (!product.image && !product.imagen) return "/placeholder.jpg";
    const img = product.image || product.imagen;
    if (typeof img === 'string' && img.includes('cloudinary')) {
      return img;
    }
    if (product._id) {
      return `${process.env.NEXT_PUBLIC_URL || "http://localhost:5001"}/api/productos/${product._id}/image`;
    }
    return "/placeholder.jpg";
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 transition-colors duration-300" ref={searchRef}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="relative">
          <div className="flex items-center">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onKeyPress={handleKeyPress}
              placeholder="Buscar productos, marcas, etc."
              className="w-full py-4 pl-4 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors"
            >
              <FaSearch className="w-5 h-5" />
            </button>
          </div>

          {/* Resultados de búsqueda */}
          {showResults && filteredProducts.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg transition-colors duration-300">
              <div className="py-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                  >
                    <div className="flex-shrink-0 w-12 h-12 relative">
                      <img
                        src={getImageUrl(product)}
                        alt={product.nombre}
                        className="object-cover w-full h-full rounded-md"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{product.nombre}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">${product.precio} USD</p>
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
