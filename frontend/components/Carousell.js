import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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

  // Función para obtener el mensaje de disponibilidad
  const getDisponibilidad = (product) => {
    const hasTallas = product.tallas && Object.keys(product.tallas).length > 0;
    
    if (hasTallas && product.encargo) {
      return { message: "Entrega garantizada en 5 días hábiles", color: "text-yellow-500" };
    } else if (hasTallas) {
      return { message: "Entrega inmediata", color: "text-green-500" };
    } else {
      // Para todos los productos con entrega en 20 días, mostrar "Dormiste"
      return { message: "Dormiste", color: "text-red-500" };
    }
  };

  // Función para determinar si un producto es clickeable
  const isProductClickable = (product) => {
    const hasTallas = product.tallas && Object.keys(product.tallas).length > 0;
    // Solo los productos con tallas disponibles son clickeables
    return hasTallas;
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
          if (typeof window !== 'undefined') {
            const img = window.Image ? new window.Image() : document.createElement('img');
            img.src = getImageUrl(product);
            img.onload = () => {
              setLoadedImages(prev => ({ ...prev, [product._id]: true }));
              resolve();
            };
            img.onerror = () => {
              resolve(); // Resolver incluso si hay error para no bloquear
            };
          } else {
            resolve();
          }
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
          <h1 className="text-2xl font-bold sm:text-4xl text-gray-900 dark:text-white">{title}</h1>
          {/* Solo mostrar controles en móvil */}
          <div className="flex gap-2 md:hidden">
            <button
              className="p-2 text-black dark:text-white transform hover:scale-105"
              onClick={() => handleScroll('left')}
              type="button"
            >
              <FaChevronLeft />
            </button>
            <button
              className="p-2 text-black dark:text-white transform hover:scale-105"
              onClick={() => handleScroll('right')}
              type="button"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        
        {/* Grid para pantallas grandes, carrusel para móvil */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product, index) => {
            const clickable = isProductClickable(product);
            
            const productCard = (
              <div className={`flex flex-col justify-between h-full ${
                clickable 
                  ? 'transition-transform transform hover:scale-105 cursor-pointer' 
                  : 'opacity-75 cursor-not-allowed'
              }`}>
                <div className="relative w-full h-[15rem]">
                  {!loadedImages[product._id] && (
                    <div className="absolute inset-0 animate-pulse">
                      <div className="w-full h-full bg-gray-200 rounded-lg"></div>
                    </div>
                  )}
                  <Image
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
                  {!clickable && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <span className="text-white font-bold text-sm">Dormiste</span>
                    </div>
                  )}
                </div>
                <div className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white">{product.nombre}</div>
                <div className="flex flex-col mt-2">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">${product.precio} USD</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {dolarBlue ? `$${Math.round(product.precio * dolarBlue).toLocaleString('es-AR')} ARS` : "Cargando precio en ARS..."}
                  </p>
                </div>
              </div>
            );

            return clickable ? (
              <Link href={`/producto/${product._id}`} key={product._id}>
                {productCard}
              </Link>
            ) : (
              <div key={product._id}>
                {productCard}
              </div>
            );
          })}
        </div>

        {/* Carrusel para móvil */}
        <div 
          className="flex overflow-x-auto md:hidden scrollbar-hide snap-x snap-mandatory" 
          ref={scrollContainerRef}
        >
          {products.map((product, index) => {
            const clickable = isProductClickable(product);
            
            const productCard = (
              <div className={`flex flex-col justify-between h-full min-w-[200px] mx-2 snap-center ${
                clickable 
                  ? 'transition-transform transform hover:scale-105 cursor-pointer' 
                  : 'opacity-75 cursor-not-allowed'
              }`}>
                <div className="relative w-full h-[15rem]">
                  {!loadedImages[product._id] && (
                    <div className="absolute inset-0 animate-pulse">
                      <div className="w-full h-full bg-gray-200 rounded-lg"></div>
                    </div>
                  )}
                  <Image
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
                  {!clickable && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <span className="text-white font-bold text-xs">Dormiste</span>
                    </div>
                  )}
                </div>
                <div className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white">{product.nombre}</div>
                <div className="flex flex-col mt-2">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">${product.precio} USD</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {dolarBlue ? `$${Math.round(product.precio * dolarBlue).toLocaleString('es-AR')} ARS` : "Cargando precio en ARS..."}
                  </p>
                </div>
              </div>
            );

            return clickable ? (
              <Link href={`/producto/${product._id}`} key={product._id}>
                {productCard}
              </Link>
            ) : (
              <div key={product._id}>
                {productCard}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
