import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [marcasPorCategoria, setMarcasPorCategoria] = useState({
    zapatillas: [],
    ropa: [],
    accesorios: []
  });

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
        const productos = await response.json();
        
        const marcasPorCat = {
          zapatillas: new Set(),
          ropa: new Set(),
          accesorios: new Set()
        };

        productos.forEach(producto => {
          if (producto.categoria && producto.marca) {
            // Solo agregar la marca si el producto pertenece a esa categoría
            if (producto.categoria === "zapatillas") {
              marcasPorCat.zapatillas.add(producto.marca);
            } else if (producto.categoria === "ropa") {
              marcasPorCat.ropa.add(producto.marca);
            } else if (producto.categoria === "accesorios") {
              marcasPorCat.accesorios.add(producto.marca);
            }
          }
        });

        setMarcasPorCategoria({
          zapatillas: Array.from(marcasPorCat.zapatillas).sort(),
          ropa: Array.from(marcasPorCat.ropa).sort(),
          accesorios: Array.from(marcasPorCat.accesorios).sort()
        });
      } catch (error) {
        console.error('Error al cargar las marcas:', error);
      }
    };

    fetchMarcas();
  }, []);

  const handleMarcaClick = (categoria, marca) => {
    router.push(`/productos/categoria/${categoria}?marca=${encodeURIComponent(marca)}`);
    setIsOpen(false);
  };

  return (
    <>
      <nav className="relative p-12 shadow-md">
        <div className="absolute inset-0 w-full h-full">
          <Link href="/">
            <Image
              src={isMobile ? "/banner-3.png" : "/banner-3.png"}
              alt="Background"
              layout="fill"
              objectFit="cover"
              quality={100}
              priority={true}
              sizes="(max-width: 768px) 100vw, 1200px"
              unoptimized={true}
            />
          </Link>
        </div>
      </nav>
      <nav className="relative bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 w-full justify-center">
              <Link href="/" className="py-2 hover:text-gray-300">
                Inicio
              </Link>

              {/* Stock Dropdown */}
              <div className="relative group">
                <button className="py-2 hover:text-gray-300">
                  Stock
                </button>
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[800px] bg-gray-800 bg-opacity-90 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
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

              <Link href="/encargos" className="py-2 hover:text-gray-300">
                Encargos
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-700 focus:outline-none"
            >
              <span className={`block w-6 h-0.5 bg-white mb-1 ${isOpen ? 'transform rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white mb-1 ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white ${isOpen ? 'transform -rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden py-4">
              <Link 
                href="/"
                className="block py-2 px-4 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </Link>

              {/* Zapatillas Mobile */}
              <div className="mb-4">
                <Link 
                  href="/productos/talla/zapatillas"
                  className="block py-2 px-4 hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  ZAPATILLAS
                </Link>
                <div className="pl-4">
                  {marcasPorCategoria.zapatillas.map((marca, index) => (
                    <button
                      key={index}
                      onClick={() => handleMarcaClick('zapatillas', marca)}
                      className="block w-full py-2 px-4 text-sm text-left hover:bg-gray-700"
                    >
                      {marca}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ropa Mobile */}
              <div className="mb-4">
                <Link 
                  href="/productos/talla/ropa"
                  className="block py-2 px-4 hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  ROPA
                </Link>
                <div className="pl-4">
                  {marcasPorCategoria.ropa.map((marca, index) => (
                    <button
                      key={index}
                      onClick={() => handleMarcaClick('ropa', marca)}
                      className="block w-full py-2 px-4 text-sm text-left hover:bg-gray-700"
                    >
                      {marca}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tecnología Mobile */}
              <div className="mb-4">
                <Link 
                  href="/productos/categoria/accesorios"
                  className="block py-2 px-4 hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  TECNOLOGÍA
                </Link>
                <div className="pl-4">
                  {marcasPorCategoria.accesorios.map((marca, index) => (
                    <button
                      key={index}
                      onClick={() => handleMarcaClick('accesorios', marca)}
                      className="block w-full py-2 px-4 text-sm text-left hover:bg-gray-700"
                    >
                      {marca}
                    </button>
                  ))}
                </div>
              </div>

              <Link 
                href="/encargos" 
                className="block py-2 px-4 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Encargos
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
