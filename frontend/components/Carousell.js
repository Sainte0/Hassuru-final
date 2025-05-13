import React, { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";

export default function Carousell({ title, products, dolarBlue }) {
  const carouselRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging && carouselRef.current) {
        carouselRef.current.scrollBy({
          left: 300,
          behavior: "smooth",
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isDragging]);

  const handleScroll = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
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
          <div className="flex gap-2">
            <button
              className="p-2 text-black transform hover:scale-105"
              onClick={(e) => handleScroll(e, "left")}
              type="button"
              onTouchStart={(e) => handleScroll(e, "left")}
            >
              <FaChevronLeft />
            </button>
            <button
              className="p-2 text-black transform hover:scale-105"
              onClick={(e) => handleScroll(e, "right")}
              type="button"
              onTouchStart={(e) => handleScroll(e, "right")}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        <div
          ref={carouselRef}
          className="flex gap-4 mt-8 cursor-grab active:cursor-grabbing touch-pan-x"
          id="carousel"
          style={{ overflow: "hidden" }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => e.preventDefault()}
        >
          {products.map((product, index) => (
            <div key={index} className="flex-none w-48 sm:w-64">
              <div className="flex flex-col justify-between h-full">
                <div className="relative w-full h-[20rem]">
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
                    loading={index < (isMobile ? 2 : 4) ? "eager" : "lazy"}
                    style={{ 
                      objectFit: 'cover', 
                      width: '100%', 
                      height: '20rem', 
                      marginBottom: '0.75rem',
                      opacity: loadedImages[product._id] ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out',
                      position: 'relative',
                      zIndex: 1,
                      pointerEvents: 'none'
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
