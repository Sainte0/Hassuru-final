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
    <div className="container mx-auto px-4">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <div className="relative">
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 z-10 p-2 text-white transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full top-1/2 hover:bg-opacity-75"
        >
          <FaChevronLeft />
        </button>
        <div
          ref={carouselRef}
          className="flex overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product, index) => (
            <div key={index} className="flex-none w-48 sm:w-64">
              <Link href={getProductUrl(product)} key={product.id}>
                <div className="flex flex-col justify-between h-full">
                  <div className="relative w-full h-[20rem]">
                    <Image
                      src={getImageUrl(product)}
                      alt={product.nombre}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 2}
                      loading={index < 2 ? "eager" : "lazy"}
                      quality={85}
                      className="object-cover"
                    />
                  </div>
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
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 z-10 p-2 text-white transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full top-1/2 hover:bg-opacity-75"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
}
