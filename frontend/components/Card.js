import React, { useEffect, useState } from "react";
import Link from "next/link";
import useStore from "../store/store";

export default function Card({ currentProducts }) {
  const { dolarBlue, fetchDolarBlue } = useStore();
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
    fetchDolarBlue();
    
    // Actualizar el valor cada 5 minutos
    const interval = setInterval(() => {
      fetchDolarBlue();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchDolarBlue]);

  // Precargar imágenes
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = currentProducts.slice(0, isMobile ? 4 : 8).map((product) => {
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
  }, [currentProducts, isMobile]);

  const getDisponibilidad = (product) => {
    const hasTallas = product.tallas && Object.keys(product.tallas).length > 0;
  
    if (hasTallas && product.encargo) {
      return { message: "Disponible en 3 días", color: "text-yellow-500" };
    } else if (hasTallas) {
      return { message: "Entrega inmediata", color: "text-green-500" };
    } else {
      return { message: "Disponible en 20 días", color: "text-red-500" };
    }
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
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {currentProducts.map((product, index) => {
          const disponibilidad = getDisponibilidad(product);
          return (
            <Link href={getProductUrl(product)} key={product.id}>
              <div key={product._id} className="flex flex-col h-[500px] transition-transform transform hover:scale-105">
                <div className="relative w-full h-[300px] bg-gray-100">
                  {!loadedImages[product._id] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img
                    src={getImageUrl(product)}
                    alt={product.nombre}
                    width={300}
                    height={300}
                    loading={index < (isMobile ? 4 : 8) ? "eager" : "lazy"}
                    style={{ 
                      objectFit: 'contain', 
                      width: '100%', 
                      height: '100%',
                      opacity: loadedImages[product._id] ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out'
                    }}
                    onLoad={() => setLoadedImages(prev => ({ ...prev, [product._id]: true }))}
                  />
                </div>
                <div className="flex flex-col mt-2 space-y-1">
                  <h3 className="text-lg font-semibold">{product.nombre}</h3>
                  <h5 className="text-sm leading-relaxed text-gray-500">
                    {product.description}
                  </h5>
                  <div className="flex flex-col">
                    <p className="text-lg font-bold text-gray-800">${product.precio} USD</p>
                    <p className="text-lg font-bold text-gray-800">
                      ${(product.precio * dolarBlue).toFixed(2)} ARS
                    </p>
                    <span className={disponibilidad.color}>{disponibilidad.message}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
