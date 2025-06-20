import React, { useEffect, useState } from "react";
import Link from "next/link";
import useStore from "../store/store";

export default function Card({ currentProducts }) {
  const { dolarBlue, fetchDolarBlue } = useStore();
  const [loadedImages, setLoadedImages] = useState({});
  const [visibleProducts, setVisibleProducts] = useState([]);

  // Asegurar que currentProducts sea siempre un array
  const safeCurrentProducts = Array.isArray(currentProducts) ? currentProducts : [];

  useEffect(() => {
    fetchDolarBlue();
    
    // Actualizar el valor cada 5 minutos
    const interval = setInterval(() => {
      fetchDolarBlue();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchDolarBlue]);

  // Implementar Intersection Observer para cargar imágenes solo cuando son visibles
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const productId = entry.target.dataset.productId;
            setVisibleProducts(prev => {
              if (!prev.includes(productId)) {
                return [...prev, productId];
              }
              return prev;
            });
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    // Observar todos los contenedores de productos
    const productContainers = document.querySelectorAll('.product-container');
    productContainers.forEach(container => observer.observe(container));

    return () => {
      productContainers.forEach(container => observer.unobserve(container));
    };
  }, [safeCurrentProducts]);

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
        {safeCurrentProducts.map((product) => {
          const disponibilidad = getDisponibilidad(product);
          const isVisible = visibleProducts.includes(product._id);
          
          return (
            <Link href={getProductUrl(product)} key={product._id}>
              <div 
                className="flex flex-col h-[500px] transition-transform transform hover:scale-105 product-container"
                data-product-id={product._id}
              >
                <div className="relative w-full h-[300px]">
                  {!loadedImages[product._id] && (
                    <div className="absolute inset-0 animate-pulse">
                      <div className="w-full h-full bg-gray-200 rounded-lg"></div>
                    </div>
                  )}
                  {isVisible && (
                    <img
                      src={getImageUrl(product)}
                      alt={product.nombre}
                      width={300}
                      height={300}
                      style={{ 
                        objectFit: 'contain', 
                        width: '100%', 
                        height: '100%',
                        opacity: loadedImages[product._id] ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out',
                        position: 'relative',
                        zIndex: 1
                      }}
                      onLoad={() => setLoadedImages(prev => ({ ...prev, [product._id]: true }))}
                    />
                  )}
                </div>
                
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}
