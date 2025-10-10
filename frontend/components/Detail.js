import React, { useState, useEffect } from "react";
import useStore from "../store/store";
import Image from "next/image";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useCartStore } from '../store/cartStore';
import { useGA4 } from '../hooks/useGA4';

// Tabla de conversión de tallas a centímetros
const talleToCm = {
  '4': '23', '4.5': '23.5', '5': '23.5', '5.5': '24', '6': '24',
  '6.5': '24.5', '7': '25', '7.5': '25.5', '8': '26', '8.5': '26.5',
  '9': '27', '9.5': '27.5', '10': '28', '10.5': '28.5', '11': '29',
  '11.5': '29.5', '12': '30', '12.5': '30.5', '13': '31'
};

// Función para obtener CM de una talla
const getCmFromTalla = (tallaStr) => {
  if (!tallaStr) return null;
  // Buscar número seguido de "usa" o "us" (case insensitive) o simplemente el primer número
  const usMatch = tallaStr.match(/(\d+\.?\d*)\s*(usa?|US)/i) || tallaStr.match(/^(\d+\.?\d*)/);
  if (usMatch && usMatch[1]) {
    return talleToCm[usMatch[1]] || null;
  }
  return null;
};

export default function Detail({ product }) {
  const [showTallas, setShowTallas] = useState(false);
  const [selectedTalla, setSelectedTalla] = useState(null);
  const [customTalla, setCustomTalla] = useState("");
  const { dolarBlue, fetchDolarBlue, loadViewedProducts, viewedProducts } = useStore();
  const router = useRouter();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [complementaryProducts, setComplementaryProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const addToCart = useCartStore(state => state.addToCart);
  const { viewItem, addToCart: ga4AddToCart } = useGA4();

  useEffect(() => {
    fetchDolarBlue();
    
    // Actualizar el valor cada 5 minutos
    const interval = setInterval(() => {
      fetchDolarBlue();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchDolarBlue]);

  // Evento GA4: Ver producto
  useEffect(() => {
    if (product) {
      viewItem({
        productoId: product._id,
        nombre: product.nombre,
        precio: product.precio,
        categoria: product.categoria,
        marca: product.marca
      });
      
      // Guardar producto visto en localStorage con expiración de 1 semana
      try {
        const viewedProducts = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Filtrar productos expirados (más de 1 semana)
        const validProducts = viewedProducts.filter(p => {
          const viewedDate = new Date(p.viewedAt);
          return viewedDate > oneWeekAgo;
        });
        
        // Remover el producto si ya existe para evitar duplicados
        const filteredProducts = validProducts.filter(p => p._id !== product._id);
        
        // Agregar el producto al inicio del array
        const updatedProducts = [
          {
            _id: product._id,
            nombre: product.nombre,
            precio: product.precio,
            categoria: product.categoria,
            marca: product.marca,
            image: product.image,
            tallas: product.tallas,
            encargo: product.encargo,
            slug: product.slug,
            viewedAt: now.toISOString()
          },
          ...filteredProducts
        ].slice(0, 6); // Mantener solo los últimos 6 productos
        
        localStorage.setItem('viewedProducts', JSON.stringify(updatedProducts));
      } catch (error) {
        console.error('Error al guardar producto visto:', error);
      }
    }
  }, [product, viewItem]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setLoadingRelated(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos`);
        const allProducts = await response.json();
        const marcas = Array.isArray(product.marca) ? product.marca : [product.marca];
        
        // Productos de la misma marca con entrega disponible
        const related = allProducts.filter(p => 
          p._id !== product._id && 
          marcas.some(marca => Array.isArray(p.marca) ? p.marca.includes(marca) : p.marca === marca) &&
          Array.isArray(p.tallas) && p.tallas.length > 0 && !p.encargo
        );
        if (related.length > 0) {
          setRelatedProducts(related.slice(0, 6));
        } else {
          // Si no hay, mostrar productos de otras marcas con entrega disponible
          const otrosDisponibles = allProducts.filter(p => 
            p._id !== product._id &&
            (!marcas.some(marca => Array.isArray(p.marca) ? p.marca.includes(marca) : p.marca === marca)) &&
            Array.isArray(p.tallas) && p.tallas.length > 0 && !p.encargo
          );
          setRelatedProducts(otrosDisponibles.slice(0, 6));
        }

        // Productos complementarios - que combinan bien con el producto actual
        const complementary = allProducts.filter(p => {
          if (p._id === product._id) return false;
          if (!Array.isArray(p.tallas) || p.tallas.length === 0 || p.encargo) return false;
          
          // Lógica de complementariedad según categoría
          if (product.categoria === 'zapatillas') {
            // Si es zapatilla, mostrar ropa y accesorios
            return p.categoria === 'ropa' || p.categoria === 'accesorios';
          } else if (product.categoria === 'ropa') {
            // Si es ropa, mostrar zapatillas y accesorios
            return p.categoria === 'zapatillas' || p.categoria === 'accesorios';
          } else if (product.categoria === 'accesorios') {
            // Si es accesorio, mostrar ropa y zapatillas
            return p.categoria === 'ropa' || p.categoria === 'zapatillas';
          }
          return false;
        });
        
        // Mezclar aleatoriamente y tomar 6
        const shuffled = complementary.sort(() => 0.5 - Math.random());
        setComplementaryProducts(shuffled.slice(0, 6));
        
      } catch (error) {
        console.error("Error al cargar productos relacionados:", error);
      } finally {
        setLoadingRelated(false);
      }
    };

    if (product) {
      fetchRelatedProducts();
      loadViewedProducts(); // Cargar productos vistos
    }
  }, [product, loadViewedProducts]);

  // Detectar si es producto de encargo (sin stock real, entrega 20 días)
  const isEncargo = !product.tallas || product.tallas.length === 0 || product.entrega === '20 días' || product.descripcion?.toLowerCase().includes('20 días');

  const handleCompraClick = () => {
    if (selectedTalla) {
      const cartItem = {
        productoId: product._id,
        nombre: product.nombre,
        cantidad: 1,
        imagen: product.image?.url || product.image || '/placeholder.jpg',
        precio: selectedTalla.precioTalla,
        precioARS: (selectedTalla.precioTalla * dolarBlue),
        talle: selectedTalla.talla,
        encargo: isEncargo,
        categoria: product.categoria,
        marca: product.marca
      };
      
      addToCart(cartItem);
      
      // Evento GA4: Agregar al carrito
      ga4AddToCart(cartItem);
      
      toast.success('Producto añadido al carrito');
      return;
    }
    if (customTalla) {
      // Si es encargo personalizado, añadir al carrito como encargo
      const cartItem = {
        productoId: product._id,
        nombre: product.nombre,
        cantidad: 1,
        imagen: product.image?.url || product.image || '/placeholder.jpg',
        precio: product.precio,
        precioARS: (product.precio * dolarBlue),
        talle: customTalla,
        encargo: true,
        categoria: product.categoria,
        marca: product.marca
      };
      
      addToCart(cartItem);
      
      // Evento GA4: Agregar al carrito
      ga4AddToCart(cartItem);
      
      toast.success('Encargo añadido al carrito');
      return;
    }
    setShowTallas(true);
  };

  const handleTallaSelect = (talla) => {
    if (selectedTalla === talla) {
      setSelectedTalla(null);
    } else {
      setSelectedTalla(talla);
      setCustomTalla("");
    }
  };

  // Función para obtener la URL de la imagen
  const getImageUrl = () => {
    // Si no hay imagen, devolver una imagen por defecto
    if (!product.image) return "/placeholder.jpg";
    
    // Si la imagen es una URL de Cloudinary, usarla directamente
    if (typeof product.image === 'string' && product.image.includes('cloudinary')) {
      return product.image;
    }
    
    // Si la imagen es un objeto con data (nuevo formato), usar la ruta de la API
    if (product._id) {
      return `${process.env.NEXT_PUBLIC_URL || "http://localhost:5001"}/api/productos/${product._id}/image?w=600&q=85`;
    }
    
    return "/placeholder.jpg";
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container py-10 mx-auto bg-white dark:bg-dark-bg transition-colors duration-300">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Imagen a la izquierda */}
          <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
            <div className="relative w-full h-[420px] sm:h-[520px] md:h-[600px] lg:h-[700px]">
              <img
                src={getImageUrl()}
                alt={product.nombre}
                width={1200}
                height={800}
                loading="eager"
                className="object-contain w-full h-full rounded-xl bg-white dark:bg-dark-bg"
              />
            </div>
          </div>
          {/* Info a la derecha */}
          <div className="flex flex-col w-full lg:w-1/2 p-2 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white lg:text-4xl mb-2">{product.nombre}</h2>
            {isEncargo && (
              <div className="mb-2 p-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-semibold text-center">
                Ingresá tu talle y agregá la prenda al carrito como encargo.<br/>¡Ahora podés pedir prendas de encargo directamente desde la web!
              </div>
            )}
            <div className="space-y-2 text-gray-800 dark:text-white">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{product.descripcion}</p>
              <p className="text-4xl font-bold">${product.precio} USD</p>
              <p className="text-lg text-gray-400 dark:text-gray-500">${Math.round(product.precio * dolarBlue).toLocaleString('es-AR')} ARS</p>
            </div>
            <div className="mt-4">
              <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">Tallas disponibles:</h3>
              {product.tallas && product.tallas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.tallas.map((talla) => (
                    <button
                      key={talla._id}
                      onClick={() => handleTallaSelect(talla)}
                      className={`px-4 py-2 border rounded-md transition-colors ${
                        selectedTalla?._id === talla._id
                          ? "bg-red-600 text-white border-red-600"
                          : "border-gray-300 dark:border-gray-600 hover:border-red-600 dark:hover:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{talla.talla}</span>
                        {getCmFromTalla(talla.talla) && (
                          <span className="text-xs text-gray-600 dark:text-gray-400">{getCmFromTalla(talla.talla)} cm</span>
                        )}
                        <span className="text-sm">${talla.precioTalla} USD</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">${Math.round(talla.precioTalla * dolarBlue).toLocaleString('es-AR')} ARS</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-yellow-600 dark:text-yellow-400 font-medium">Te traemos el par desde Estados Unidos con demora de 20/30 días</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customTalla}
                      onChange={(e) => setCustomTalla(e.target.value)}
                      placeholder="Ingresa tu talle"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {product.tallas && product.tallas.length > 0 ? (
                product.tallas.some((tallaObj) => tallaObj.precioTalla > 0) ? (
                  product.encargo ? (
                    <span className="text-yellow-500 dark:text-yellow-400">Disponible en 5 días</span>
                  ) : (
                    <span className="text-green-500 dark:text-green-400">Entrega inmediata</span>
                  )
                ) : (
                  <span className="text-red-500 dark:text-red-400">Disponible en 20 días</span>
                )
              ) : (
                <span className="text-yellow-500 dark:text-yellow-400">Encargo desde Estados Unidos (20-30 días)</span>
              )}
            </div>
            <div className="mt-4">
              <button
                className={`flex items-center justify-center w-full px-4 py-2 text-white bg-green-500 dark:bg-green-600 border border-gray-400 dark:border-gray-600 rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition-colors`}
                onClick={handleCompraClick}
              >
                {product.tallas && product.tallas.length > 0 ? (
                  selectedTalla ? "Añadir al carrito" : "Seleccionar talla"
                ) : (
                  customTalla ? "Comprar" : "Encargar ahora"
                )}
              </button>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>✓</span>
              <p>Artículo verificado, 100% original.</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>📦</span>
              {Object.entries(product.tallas).some(([_, stock]) => stock > 0) ? (
                <p>Quedan {Object.values(product.tallas).reduce((acc, stock) => acc + stock, 0)} en stock. Ordena pronto.</p>
              ) : (
                <p>Stock Disponible. Pide tu talle.</p>
              )}
            </div>
            {selectedTalla && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Has seleccionado la talla: <span className="font-bold">{selectedTalla.talla}</span>
                <button
                  onClick={() => setSelectedTalla(null)}
                  className="ml-2 text-sm text-red-500 hover:underline dark:hover:text-red-400 transition-colors"
                >
                  Deseleccionar
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-2">
              <div className="p-4 text-sm text-center text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg transition-colors">
                Envíos gratis a todo el país.
              </div>
              <div className="p-4 text-sm text-center text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg transition-colors">
                Entrega en Córdoba Capital
              </div>
            </div>
           
            {/* Medios de pago */}
            <div className="p-4 mt-6 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md shadow-md transition-colors">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Medios de pago disponibles:</h3>
              <ul className="mt-2 space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="text-green-500">✔️</span>
                  <span className="ml-2">Zelle, Cashapp, USDT/CRYPTO</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500">✔️</span>
                  <span className="ml-2">Transferencia en pesos</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500">✔️</span>
                  <span className="ml-2">Transferencia en U$D (solo desde cuentas internacionales)</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500">✔️</span>
                  <span className="ml-2">Efectivo (Córdoba & Buenos Aires)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Sección de productos relacionados más cerca del detalle */}
      {(loadingRelated || relatedProducts.length > 0) && (
        <div className="container mt-8 mx-auto bg-white dark:bg-dark-bg transition-colors duration-300">
          <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">Productos relacionados</h2>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {loadingRelated
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="min-w-[240px] max-w-[240px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg flex-shrink-0 bg-gray-200 dark:bg-dark-bg animate-pulse">
                    <div className="w-full h-64 mb-4 bg-gray-300 dark:bg-gray-600 rounded-lg" />
                    <div className="h-5 w-3/4 mb-2 bg-gray-300 dark:bg-gray-600 rounded" />
                    <div className="h-4 w-1/2 mb-1 bg-gray-300 dark:bg-gray-600 rounded" />
                    <div className="h-4 w-2/3 mb-2 bg-gray-300 dark:bg-gray-600 rounded" />
                    <div className="h-8 w-full bg-gray-300 dark:bg-gray-600 rounded" />
                  </div>
                ))
              : relatedProducts.slice(0, 6).map((relatedProduct) => {
                  // Calcular precio en pesos
                  const precioPesos = dolarBlue ? Math.round(relatedProduct.precio * dolarBlue) : null;
                  // Determinar disponibilidad y estilos
                  let disponibilidad = relatedProduct.disponibilidad || "Sin info";
                  let disponibilidadLabel = disponibilidad;
                  let disponibilidadClass = "bg-gray-300 dark:bg-gray-600 text-black dark:text-white";
                  if (
                    disponibilidad === "Entrega inmediata" ||
                    (!relatedProduct.encargo && Array.isArray(relatedProduct.tallas) && relatedProduct.tallas.length > 0)
                  ) {
                    disponibilidadLabel = "Entrega inmediata";
                    disponibilidadClass = "bg-green-500 text-white";
                  } else if (
                    disponibilidad === "Disponible en 5 días" ||
                    (relatedProduct.encargo && Array.isArray(relatedProduct.tallas) && relatedProduct.tallas.length > 0)
                  ) {
                    disponibilidadLabel = "Disponible en 5 días";
                    disponibilidadClass = "bg-yellow-400 text-gray-900";
                  } else if (
                    disponibilidad === "Disponible en 20 días" ||
                    (!Array.isArray(relatedProduct.tallas) || relatedProduct.tallas.length === 0)
                  ) {
                    disponibilidadLabel = "Disponible en 20 días";
                    disponibilidadClass = "bg-red-500 text-white";
                  }
                  return (
                    <div
                      key={relatedProduct._id}
                      className="min-w-[240px] max-w-[240px] p-4 transition duration-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:shadow-lg flex-shrink-0 bg-white dark:bg-dark-bg cursor-pointer"
                      onClick={() => router.push(`/producto/${relatedProduct._id}`)}
                      tabIndex={0}
                      role="button"
                      onKeyPress={e => { if (e.key === 'Enter') router.push(`/producto/${relatedProduct._id}`); }}
                    >
                      <div className="relative w-full h-64 mb-4">
                        <Image
                          src={relatedProduct.image?.url || "/placeholder.jpg"}
                          alt={relatedProduct.nombre}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg"
                        />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white truncate">{relatedProduct.nombre}</h3>
                      <p className="mb-1 text-gray-600 dark:text-gray-400">USD ${relatedProduct.precio}</p>
                      {precioPesos && (
                        <p className="mb-2 text-gray-600 dark:text-gray-400">${Math.round(precioPesos).toLocaleString("es-AR")} ARS</p>
                      )}
                      <div className={`w-full px-4 py-2 text-center text-sm font-medium rounded ${disponibilidadClass}`}>{disponibilidadLabel}</div>
                    </div>
                  );
                })}
          </div>
        </div>
      )}

      {/* Productos que combinan */}
      {complementaryProducts && complementaryProducts.length > 0 && (
        <div className="container mt-8 mx-auto bg-white dark:bg-dark-bg transition-colors duration-300">
          <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">Productos que combinan</h2>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {complementaryProducts.slice(0, 6).map((complementaryProduct) => {
              const precioPesos = dolarBlue ? Math.round(complementaryProduct.precio * dolarBlue) : null;
              let disponibilidad = complementaryProduct.disponibilidad || "Sin info";
              let disponibilidadLabel = disponibilidad;
              let disponibilidadClass = "bg-gray-300 dark:bg-gray-600 text-black dark:text-white";
              
              if (
                disponibilidad === "Entrega inmediata" ||
                (!complementaryProduct.encargo && Array.isArray(complementaryProduct.tallas) && complementaryProduct.tallas.length > 0)
              ) {
                disponibilidadLabel = "Entrega inmediata";
                disponibilidadClass = "bg-green-500 text-white";
              } else if (
                disponibilidad === "Disponible en 5 días" ||
                (complementaryProduct.encargo && Array.isArray(complementaryProduct.tallas) && complementaryProduct.tallas.length > 0)
              ) {
                disponibilidadLabel = "Disponible en 5 días";
                disponibilidadClass = "bg-yellow-400 text-gray-900";
              } else if (
                disponibilidad === "Disponible en 20 días" ||
                (!Array.isArray(complementaryProduct.tallas) || complementaryProduct.tallas.length === 0)
              ) {
                disponibilidadLabel = "Disponible en 20 días";
                disponibilidadClass = "bg-red-500 text-white";
              }
              
              return (
                <div
                  key={complementaryProduct._id}
                  className="min-w-[240px] max-w-[240px] p-4 transition duration-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:shadow-lg flex-shrink-0 bg-white dark:bg-dark-bg cursor-pointer"
                  onClick={() => router.push(`/producto/${complementaryProduct._id}`)}
                  tabIndex={0}
                  role="button"
                  onKeyPress={e => { if (e.key === 'Enter') router.push(`/producto/${complementaryProduct._id}`); }}
                >
                  <div className="relative w-full h-64 mb-4">
                    <Image
                      src={complementaryProduct.image?.url || "/placeholder.jpg"}
                      alt={complementaryProduct.nombre}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white truncate">{complementaryProduct.nombre}</h3>
                  <p className="mb-1 text-gray-600 dark:text-gray-400">USD ${complementaryProduct.precio}</p>
                  {precioPesos && (
                    <p className="mb-2 text-gray-600 dark:text-gray-400">${Math.round(precioPesos).toLocaleString("es-AR")} ARS</p>
                  )}
                  <div className={`w-full px-4 py-2 text-center text-sm font-medium rounded ${disponibilidadClass}`}>{disponibilidadLabel}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Productos vistos recientemente */}
      {viewedProducts && viewedProducts.length > 0 && viewedProducts.filter(p => p._id !== product._id).length > 0 && (
        <div className="container mt-8 mx-auto bg-white dark:bg-dark-bg transition-colors duration-300">
          <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">Vistos recientemente</h2>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {viewedProducts.filter(p => p._id !== product._id).slice(0, 6).map((viewedProduct) => {
              const precioPesos = dolarBlue ? Math.round(viewedProduct.precio * dolarBlue) : null;
              let disponibilidad = viewedProduct.disponibilidad || "Sin info";
              let disponibilidadLabel = disponibilidad;
              let disponibilidadClass = "bg-gray-300 dark:bg-gray-600 text-black dark:text-white";
              
              if (
                disponibilidad === "Entrega inmediata" ||
                (!viewedProduct.encargo && Array.isArray(viewedProduct.tallas) && viewedProduct.tallas.length > 0)
              ) {
                disponibilidadLabel = "Entrega inmediata";
                disponibilidadClass = "bg-green-500 text-white";
              } else if (
                disponibilidad === "Disponible en 5 días" ||
                (viewedProduct.encargo && Array.isArray(viewedProduct.tallas) && viewedProduct.tallas.length > 0)
              ) {
                disponibilidadLabel = "Disponible en 5 días";
                disponibilidadClass = "bg-yellow-400 text-gray-900";
              } else if (
                disponibilidad === "Disponible en 20 días" ||
                (!Array.isArray(viewedProduct.tallas) || viewedProduct.tallas.length === 0)
              ) {
                disponibilidadLabel = "Disponible en 20 días";
                disponibilidadClass = "bg-red-500 text-white";
              }
              
              return (
                <div
                  key={viewedProduct._id}
                  className="min-w-[240px] max-w-[240px] p-4 transition duration-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:shadow-lg flex-shrink-0 bg-white dark:bg-dark-bg cursor-pointer"
                  onClick={() => router.push(`/producto/${viewedProduct._id}`)}
                  tabIndex={0}
                  role="button"
                  onKeyPress={e => { if (e.key === 'Enter') router.push(`/producto/${viewedProduct._id}`); }}
                >
                  <div className="relative w-full h-64 mb-4">
                    <Image
                      src={viewedProduct.image?.url || "/placeholder.jpg"}
                      alt={viewedProduct.nombre}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white truncate">{viewedProduct.nombre}</h3>
                  <p className="mb-1 text-gray-600 dark:text-gray-400">USD ${viewedProduct.precio}</p>
                  {precioPesos && (
                    <p className="mb-2 text-gray-600 dark:text-gray-400">${Math.round(precioPesos).toLocaleString("es-AR")} ARS</p>
                  )}
                  <div className={`w-full px-4 py-2 text-center text-sm font-medium rounded ${disponibilidadClass}`}>{disponibilidadLabel}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
