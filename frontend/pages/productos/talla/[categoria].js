import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { BounceLoader } from 'react-spinners';

// Importar las imágenes de las banderas
const US_FLAG = "https://flagcdn.com/w20/us.png";
const AR_FLAG = "https://flagcdn.com/w20/ar.png";

export default function TallaSelector() {
  const router = useRouter();
  const { categoria } = router.query;
  const [selectedTalla, setSelectedTalla] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [availableTallas, setAvailableTallas] = useState([]);

  // Fetch products and extract available sizes
  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoria) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/categoria/${categoria}`);
        if (!response.ok) throw new Error("Error al cargar los productos");
        
        const products = await response.json();
        
        // Extract available sizes based on category
        const tallasSet = new Set();
        
        products.forEach(product => {
          if (product.tallas && Array.isArray(product.tallas)) {
            product.tallas.forEach(tallaObj => {
              if (tallaObj.talla) {
                tallasSet.add(tallaObj.talla);
              }
            });
          }
        });
        
        // Convert Set to Array and sort
        const tallasArray = Array.from(tallasSet);
        
        // Sort sizes based on category
        if (categoria === "ropa") {
          // Sort clothing sizes: XS, S, M, L, XL, XXL, OS
          const tallaOrder = ["XS", "S", "M", "L", "XL", "XXL", "OS"];
          tallasArray.sort((a, b) => tallaOrder.indexOf(a) - tallaOrder.indexOf(b));
        } else if (categoria === "zapatillas") {
          // Sort shoe sizes numerically
          tallasArray.sort((a, b) => {
            const parseTalla = (talla) => {
              return parseFloat(talla.replace(",", "."));
            };
            return parseTalla(a) - parseTalla(b);
          });
        }
        
        setAvailableTallas(tallasArray);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Error al cargar las tallas disponibles");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [categoria]);

  const handleTallaSelect = (talla) => {
    setSelectedTalla(talla);
    setError("");

    // Redirigir inmediatamente al seleccionar una talla
    let paramName = "";
    if (categoria === "ropa") {
      paramName = "tallaRopa";
    } else if (categoria === "zapatillas") {
      paramName = "tallaZapatilla";
    } else if (categoria === "accesorios") {
      paramName = "accesorio";
    }
    
    // Construir la URL y redirigir
    const url = `/productos/categoria/${categoria}?${paramName}=${encodeURIComponent(talla)}`;
    router.push(url);
  };

  const getTitle = () => {
    if (categoria === "ropa") return "¿Qué talla de ropa usas?";
    if (categoria === "zapatillas") return "¿Qué número de calzado usas?";
    if (categoria === "accesorios") return "Selecciona una opción";
    return "Selecciona tu talla";
  };

  if (!categoria) {
    return <div className="container py-10 mx-auto">Cargando...</div>;
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center py-10 mx-auto">
        <BounceLoader color="#BE1A1D" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10 mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <Link 
            href={`/productos/categoria/${categoria}`}
            className="px-6 py-3 text-white bg-red-500 rounded-lg hover:bg-red-600"
          >
            Ir a la categoría
          </Link>
        </div>
      </div>
    );
  }

  if (availableTallas.length === 0) {
    return (
      <div className="container py-10 mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          <p className="mb-4">No hay tallas disponibles para esta categoría.</p>
          <Link 
            href={`/productos/categoria/${categoria}`}
            className="px-6 py-3 text-white bg-red-500 rounded-lg hover:bg-red-600"
          >
            Ir a la categoría
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 mx-auto">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">{getTitle()}</h1>
        
        {error && <p className="mb-4 text-red-500">{error}</p>}
        
        <div className="grid grid-cols-3 gap-4 mb-8 sm:grid-cols-4 md:grid-cols-5 justify-items-center">
          {availableTallas.map((talla) => {
            // Formatear la talla para mostrar con imágenes de banderas
            let formattedTalla = talla;
            if (categoria === "zapatillas" && talla.includes("|")) {
              const parts = talla.split("|");
              if (parts.length === 2) {
                const usPart = parts[0].trim().split(" ")[0]; // Solo tomar el número
                const arPart = parts[1].trim().split(" ")[0]; // Solo tomar el número
                formattedTalla = (
                  <div className="flex flex-col items-center w-full gap-2 py-2">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold">{usPart}</span>
                      <Image src={US_FLAG} alt="US" width={16} height={12} className="inline-block" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold">{arPart}</span>
                      <Image src={AR_FLAG} alt="AR" width={16} height={12} className="inline-block" />
                    </div>
                  </div>
                );
              }
            }
            
            return (
              <button
                key={talla}
                onClick={() => handleTallaSelect(talla)}
                className={`p-2 text-lg font-medium border rounded-lg w-full min-h-[80px] flex items-center justify-center transition-all duration-200 hover:bg-red-500 hover:text-white hover:border-red-600 ${
                  selectedTalla === talla
                    ? "bg-red-500 text-white border-red-600 shadow-md"
                    : "bg-white text-gray-800 border-gray-300"
                }`}
              >
                {formattedTalla}
              </button>
            );
          })}
        </div>
        
        <div className="flex justify-center">
          <Link 
            href={`/productos/categoria/${categoria}`}
            className="px-6 py-3 text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            Saltar
          </Link>
        </div>
      </div>
    </div>
  );
} 