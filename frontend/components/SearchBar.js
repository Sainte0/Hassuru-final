import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import useStore from "../store/store";

export default function SearchBar({ onSearch, isHamburgerOpen }) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [products, setProducts] = useState([]);
  const searchRef = useRef(null);
  const router = useRouter();
  const { dolarBlue } = useStore();

  useEffect(() => {
    // Sync with hamburger menu state
    setShowResults(isHamburgerOpen);
  }, [isHamburgerOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowResults(false);
    }
  };

  const handleProductClick = (productId) => {
    router.push(`/productos/${productId}`);
    setShowResults(false);
    setQuery("");
  };

  const filteredProducts = products.filter((product) =>
    product.nombre.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSearch} className="flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value) {
              fetchProducts();
              setShowResults(true);
            } else {
              setShowResults(false);
            }
          }}
          onFocus={() => {
            if (query) {
              fetchProducts();
              setShowResults(true);
            }
          }}
          placeholder="Buscar productos..."
          className="w-full px-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>

      {showResults && query && (
        <div className="absolute right-0 mt-2 w-[300px] bg-white rounded-md shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {filteredProducts.length > 0 ? (
            <ul>
              {filteredProducts.map((product) => (
                <li
                  key={product._id}
                  onClick={() => handleProductClick(product._id)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    {product.imagen && (
                      <img
                        src={product.imagen}
                        alt={product.nombre}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.nombre}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${product.precio} USD
                      </p>
                      <p className="text-xs text-gray-400">
                        ${(product.precio * dolarBlue).toFixed(2)} ARS
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No se encontraron productos
            </div>
          )}
        </div>
      )}
    </div>
  );
}
