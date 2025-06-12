import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Carousell({ title, products, dolarBlue }) {
  const [loadedImages, setLoadedImages] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef(null);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Función para obtener la URL de la imagen
  const getImageUrl = (product) => {
    if (!product.image) return "/placeholder.jpg";
    
    if (typeof product.image === 'string' && product.image.includes('cloudinary')) {
      return product.image;
    }
    
    if (product._id) {
      return `${process.env.NEXT_PUBLIC_URL || "http://localhost:5001"}/api/productos/${product._id}/image`;
    }
    
    return "/placeholder.jpg";
  };

  // Función para manejar el scroll en móvil
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200; // Ajusta este valor según necesites
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  // Precargar imágenes
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = products.slice(0, isMobile ? 2 : 6).map((product) => {
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
          {/* Solo mostrar controles en móvil */}
          <div className="flex gap-2 md:hidden">
            <button
              className="p-2 text-black transform hover:scale-105"
              onClick={() => handleScroll('left')}
              type="button"
            >
              <FaChevronLeft />
            </button>
            <button
              className="p-2 text-black transform hover:scale-105"
              onClick={() => handleScroll('right')}
              type="button"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        
        {/* Grid para pantallas grandes, carrusel para móvil */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product, index) => (
            <Link href={`/producto/${product._id}`} key={product._id}>
              <div className="flex flex-col justify-between h-full transition-transform transform hover:scale-105">
                <div className="relative w-full h-[15rem]">
                  {!loadedImages[product._id] && (
                    <div className="absolute inset-0 animate-pulse">
                      <div className="w-full h-full bg-gray-200 rounded-lg"></div>
                    </div>
                  )}
                  <img
                    width={300}
                    height={300}
                    src={getImageUrl(product)}
                    alt={product.nombre}
                    loading={index < 6 ? "eager" : "lazy"}
                    style={{ 
                      objectFit: 'cover', 
                      width: '100%', 
                      height: '15rem', 
                      marginBottom: '0.75rem',
                      opacity: loadedImages[product._id] ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out',
                      position: 'relative',
                      zIndex: 1
                    }}
                    onLoad={() => setLoadedImages(prev => ({ ...prev, [product._id]: true }))}
                  />
                </div>
                <h3 className="text-sm font-semibold line-clamp-2">{product.nombre}</h3>
                <div className="flex flex-col mt-2">
                  <p className="text-sm font-bold text-gray-800">${product.precio} USD</p>
                  <p className="text-sm font-bold text-gray-800">
                    {dolarBlue ? `$${(product.precio * dolarBlue).toFixed(2)} ARS` : "Cargando precio en ARS..."}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Carrusel para móvil */}
        <div 
          className="flex overflow-x-auto md:hidden scrollbar-hide snap-x snap-mandatory" 
          ref={scrollContainerRef}
        >
          {products.map((product, index) => (
            <Link href={`/producto/${product._id}`} key={product._id}>
              <div className="flex flex-col justify-between h-full min-w-[200px] mx-2 transition-transform transform hover:scale-105 snap-center">
                <div className="relative w-full h-[15rem]">
                  {!loadedImages[product._id] && (
                    <div className="absolute inset-0 animate-pulse">
                      <div className="w-full h-full bg-gray-200 rounded-lg"></div>
                    </div>
                  )}
                  <img
                    width={300}
                    height={300}
                    src={getImageUrl(product)}
                    alt={product.nombre}
                    loading={index < 2 ? "eager" : "lazy"}
                    style={{ 
                      objectFit: 'cover', 
                      width: '100%', 
                      height: '15rem', 
                      marginBottom: '0.75rem',
                      opacity: loadedImages[product._id] ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out',
                      position: 'relative',
                      zIndex: 1
                    }}
                    onLoad={() => setLoadedImages(prev => ({ ...prev, [product._id]: true }))}
                  />
                </div>
                <h3 className="text-sm font-semibold line-clamp-2">{product.nombre}</h3>
                <div className="flex flex-col mt-2">
                  <p className="text-sm font-bold text-gray-800">${product.precio} USD</p>
                  <p className="text-sm font-bold text-gray-800">
                    {dolarBlue ? `$${(product.precio * dolarBlue).toFixed(2)} ARS` : "Cargando precio en ARS..."}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
