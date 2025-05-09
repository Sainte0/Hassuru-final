import React, { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";

export default function Carousell({ title, products, dolarBlue }) {
  const carouselRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Precargar imágenes
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = products.slice(0, isMobile ? 2 : 4).map((product) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = getImageUrl(product);
          img.onload = () => {
            setLoadedImages(prev => ({ ...prev, [product._id]: true }));
            resolve();
          };
        });
      });
      await Promise.all(imagePromises);
    };
    preloadImages();
  }, [products, isMobile]);

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
                  <div className="relative w-full h-[20rem] bg-gray-100">
                    {!loadedImages[product._id] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img
                      width={300}
                      height={300}
                      src={getImageUrl(product)}
                      alt={product.nombre}
                      loading={index < (isMobile ? 2 : 4) ? "eager" : "lazy"}
                      style={{ 
                        objectFit: 'cover', 
                        width: '100%', 
                        height: '20rem', 
                        marginBottom: '0.75rem',
                        opacity: loadedImages[product._id] ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out'
                      }}
                      onLoad={() => setLoadedImages(prev => ({ ...prev, [product._id]: true }))}
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
      </div>
    </div>
  );
}
