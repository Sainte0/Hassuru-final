import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/router';
import CartDrawer from './CartDrawer';
import { useCartStore } from '../store/cartStore';
import WhatsButton from './Whatsbutton';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [marcasPorCategoria, setMarcasPorCategoria] = useState({
    zapatillas: [],
    ropa: [],
    accesorios: []
  });
  const { cart } = useCartStore();
  const [open, setOpen] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const [expandedCat, setExpandedCat] = useState(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);
    const handleResize = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  // Cargar las marcas por categoría
  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const productos = await response.json();
        
        const marcasPorCat = {
          zapatillas: new Set(),
          ropa: new Set(),
          accesorios: new Set()
        };

        productos.forEach(producto => {
          if (producto.categoria && producto.marca) {
            const marcas = Array.isArray(producto.marca) ? producto.marca : [producto.marca];
            marcas.forEach(marca => {
              if (producto.categoria === "zapatillas") {
                marcasPorCat.zapatillas.add(marca);
              } else if (producto.categoria === "ropa") {
                marcasPorCat.ropa.add(marca);
              } else if (producto.categoria === "accesorios") {
                marcasPorCat.accesorios.add(marca);
              }
            });
          }
        });

        setMarcasPorCategoria({
          zapatillas: Array.from(marcasPorCat.zapatillas).sort(),
          ropa: Array.from(marcasPorCat.ropa).sort(),
          accesorios: Array.from(marcasPorCat.accesorios).sort()
        });
      } catch (error) {
        console.warn('No se pudieron cargar las marcas:', error.message);
        // Set default empty arrays to prevent errors
        setMarcasPorCategoria({
          zapatillas: [],
          ropa: [],
          accesorios: []
        });
      }
    };

    fetchMarcas();
  }, []);

  const handleMarcaClick = async (categoria, marca) => {
    try {
      // Cerrar el menú mobile primero
      setIsOpen(false);
      
      // Pequeño delay para asegurar que el menú se cierre antes de navegar
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navegar a la categoría con el filtro de marca
      await router.push(`/productos/categoria/${categoria}?marca=${encodeURIComponent(marca)}`);
      
      console.log('✅ Navegación completada:', {
        categoria,
        marca,
        url: `/productos/categoria/${categoria}?marca=${encodeURIComponent(marca)}`
      });
    } catch (error) {
      console.error('❌ Error en navegación:', error);
      // Si hay error, intentar navegación simple
      router.push(`/productos/categoria/${categoria}?marca=${encodeURIComponent(marca)}`);
    }
  };

  return (
    <>
      <nav className="relative p-12 shadow-md">
        <div className="absolute inset-0 w-full h-full">
          <Link href="/">
            <img
              src="https://tzjkxidzrhbyypvqbtdb.supabase.co/storage/v1/object/public/product-images//static-1750482097221-banner-3-min.png"
              alt="Background"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              width={1200}
              height={400}
              fetchpriority="high"
            />
          </Link>
        </div>
      </nav>
      <nav className="relative bg-gray-800 dark:bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Theme Toggle - Left side (solo desktop) */}
            <div className="hidden md:flex items-center">
              <ThemeToggle className="mr-4" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 w-full justify-center">
              <Link href="/" className="py-2 hover:text-gray-300">
                Inicio
              </Link>
              <Link href="/productos/talla/zapatillas" className="py-2 hover:text-gray-300">
                Zapatillas
              </Link>
              <Link href="/productos/talla/ropa" className="py-2 hover:text-gray-300">
                Ropa
              </Link>
              <Link href="/productos/categoria/accesorios" className="py-2 hover:text-gray-300">
                Tecnología
              </Link>
              <Link href="/encargos" className="py-2 hover:text-gray-300">
                Encargos
              </Link>

              {/* Stock Dropdown */}
              <div className="relative group">
                <button className="py-2 hover:text-gray-300">
                  Stock
                </button>
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[800px] bg-gray-800 dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="py-6 px-8 grid grid-cols-3 gap-8">
                    {/* Zapatillas Column */}
                    <div>
                      <Link 
                        href="/productos/talla/zapatillas"
                        className="block text-lg font-semibold mb-4 text-white hover:text-gray-300"
                      >
                        ZAPATILLAS
                      </Link>
                      {marcasPorCategoria.zapatillas.map((marca, index) => (
                        <button
                          key={index}
                          onClick={() => handleMarcaClick('zapatillas', marca)}
                          className="block w-full text-left py-1 text-gray-300 hover:text-white"
                        >
                          {marca}
                        </button>
                      ))}
                    </div>

                    {/* Ropa Column */}
                    <div>
                      <Link 
                        href="/productos/talla/ropa"
                        className="block text-lg font-semibold mb-4 text-white hover:text-gray-300"
                      >
                        ROPA
                      </Link>
                      {marcasPorCategoria.ropa.map((marca, index) => (
                        <button
                          key={index}
                          onClick={() => handleMarcaClick('ropa', marca)}
                          className="block w-full text-left py-1 text-gray-300 hover:text-white"
                        >
                          {marca}
                        </button>
                      ))}
                    </div>

                    {/* Tecnología Column */}
                    <div>
                      <Link 
                        href="/productos/categoria/accesorios"
                        className="block text-lg font-semibold mb-4 text-white hover:text-gray-300"
                      >
                        TECNOLOGÍA
                      </Link>
                      {marcasPorCategoria.accesorios.map((marca, index) => (
                        <button
                          key={index}
                          onClick={() => handleMarcaClick('accesorios', marca)}
                          className="block w-full text-left py-1 text-gray-300 hover:text-white"
                        >
                          {marca}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center justify-between w-full relative">
              {/* Theme Toggle para móvil */}
              <div className="flex items-center">
                <ThemeToggle />
              </div>
              
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md hover:bg-gray-700 focus:outline-none z-50"
              >
                <span className={`block w-6 h-0.5 bg-white mb-1 ${isOpen ? 'transform rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-white mb-1 ${isOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-white ${isOpen ? 'transform -rotate-45 -translate-y-1.5' : ''}`}></span>
              </button>
            </div>
            {/* Carrito desktop */}
            {!isMobile && (
              <button
                className="ml-4 bg-black dark:bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center relative"
                onClick={() => setOpen(true)}
              >
                🛒
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{cartCount}</span>
                )}
              </button>
            )}
          </div>
          {/* Mobile menu content con acordeón de categorías/marcas */}
          {isOpen && (
            <div className="md:hidden py-4">
              <Link href="/" className="block py-2 px-4 hover:bg-gray-700" onClick={() => setIsOpen(false)}>Inicio</Link>
              {/* Categorías con acordeón */}
              {['zapatillas', 'ropa', 'accesorios'].map(cat => (
                <div key={cat} className="mb-2">
                  <button
                    className="block w-full py-2 px-4 text-left font-bold hover:bg-gray-700"
                    onClick={() => setExpandedCat(expandedCat === cat ? null : cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                  {expandedCat === cat && (
                    <div className="pl-4">
                      {marcasPorCategoria[cat].map((marca, index) => (
                        <button
                          key={index}
                          onClick={() => handleMarcaClick(cat, marca)}
                          className="block w-full py-2 px-4 text-sm text-left hover:bg-gray-700"
                        >
                          {marca}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/encargos" className="block py-2 px-4 hover:bg-gray-700" onClick={() => setIsOpen(false)}>Encargos</Link>
            </div>
          )}
        </div>
      </nav>
      {/* Botón de WhatsApp flotante a la izquierda (solo mobile) */}
      {isMobile && <WhatsButton />}
      <CartDrawer open={open} onClose={() => setOpen(false)} cart={cart} onProceed={() => { setOpen(false); window.location.href = '/checkout'; }} />
    </>
  );
}
