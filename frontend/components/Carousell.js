import React, { useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

export default function Carousell({ title, products, dolarBlue }) {
  const carouselRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      carouselRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleScroll = (direction) => {
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: "smooth",
    });
  };

  // Función para obtener la URL de la imagen
  const getImageUrl = (product) => {
    // Si no hay imagen, devolver una imagen por defecto
    if (!product.image) return "/placeholder.jpg";
    
    // Si la imagen es una URL de Cloudinary, usarla directamente
    if (typeof product.image === 'string' && product.image.includes('cloudinary')) {
      return product.image;
    }
    
    // Si la imagen es un objeto con data (nuevo formato), usar la ruta de la API
    if (product._id) {
      return `${process.env.NEXT_PUBLIC_URL || "http://localhost:5001"}/api/productos/${product._id}/image`;
    }
    
    return "/placeholder.jpg";
  };

  // Función para obtener la URL del producto
  const getProductUrl = (product) => {
    // Usar el slug si está disponible, de lo contrario usar el ID
    return product.slug ? `/producto/${product.slug}` : `/producto/${product._id}`;
  };

  return (
    <div className="relative w-full">
      <div className="container p-4 mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold sm:text-4xl">{title}</h1>
          <div>
            <button
              className="p-2 text-black transform hover:scale-105"
              onClick={() => handleScroll("left")}
            >
              <FaChevronLeft />
            </button>
            <button
              className="p-2 text-black transform hover:scale-105"
              onClick={() => handleScroll("right")}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        <div
          ref={carouselRef}
          className="flex gap-4 mt-8"
          id="carousel"
          style={{ overflow: "hidden" }}
        >
          {products.map((product, index) => (
            <div key={index} className="flex-none w-48 sm:w-64">
              <Link href={getProductUrl(product)} key={product.id}>
                <div className="flex flex-col justify-between h-full">
                  <Image
                    width={300}
                    height={300}
                    src={getImageUrl(product)}
                    alt={product.nombre}
                    className="object-cover w-full mb-3 h-80"
                  />
                  <h3 className="text-lg font-semibold">{product.nombre}</h3>
                  <div className="flex flex-col mt-2">
                    <p className="text-lg font-bold text-gray-800">${product.precio} USD</p>
                    <p className="text-lg font-bold text-gray-800">
                      {dolarBlue ? `$${(product.precio * dolarBlue).toFixed(2)} ARS` : "Cargando precio en ARS..."}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
