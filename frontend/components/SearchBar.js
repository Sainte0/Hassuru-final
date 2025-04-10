import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import Link from "next/link";
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
      router.push(`/catalogo?search=${encodeURIComponent(query)}`);
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
          placeholder="Buscar productos..."
          className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="button"
          className="absolute p-2 text-gray-500 transition-colors duration-300 left-2 hover:text-gray-700"
          onClick={handleToggleFocus}
        >
          <FaSearch />
        </button>
      </div>

      {filteredProducts.length > 0 && isFocused && (
        <ul className="absolute left-0 z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg top-12">
          {filteredProducts.map((product) => (
            <li key={product._id} className="px-4 py-2 hover:bg-gray-100">
              <Link href={`/producto/${product._id}`}>
                <div onClick={handleSearch} className="cursor-pointer">
                  <p className="font-semibold">{product.nombre}</p>
                  {product.descripcion && (
                    <p className="text-sm text-gray-600 truncate">
                      {product.descripcion}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
