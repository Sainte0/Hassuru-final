import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { BounceLoader } from 'react-spinners';

// Importar las imágenes de las banderas
const US_FLAG = "https://flagcdn.com/w20/us.png";
const AR_FLAG = "https://flagcdn.com/w20/ar.png";

// Tabla de conversión de tallas a centímetros
const talleToCm = {
  '4': '23', '4.5': '23.5', '5': '23.5', '5.5': '24', '6': '24',
  '6.5': '24.5', '7': '25', '7.5': '25.5', '8': '26', '8.5': '26.5',
  '9': '27', '9.5': '27.5', '10': '28', '10.5': '28.5', '11': '29',
  '11.5': '29.5', '12': '30', '12.5': '30.5', '13': '31', '3.5': '22.5',
  '13.5': '31.5', '14': '32'
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

export default function TallaSelector() {
  const router = useRouter();
  const { categoria } = router.query;
  const [selectedTalla, setSelectedTalla] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [availableTallas, setAvailableTallas] = useState([]);

  // Función para ordenar tallas según el orden especificado
  const sortTallas = (tallas) => {
    if (categoria === "ropa") {
      // Orden específico para ropa: "XS", "S", "M", "L", "XL", "XXL"
      const ropaOrder = ["XS", "S", "M", "L", "XL", "XXL"];
      return tallas.sort((a, b) => {
        const aIndex = ropaOrder.indexOf(a);
        const bIndex = ropaOrder.indexOf(b);
        
        // Si ambos están en el orden definido, ordenar por índice
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        
        // Si solo uno está en el orden definido, ponerlo primero
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // Si ninguno está en el orden definido, ordenar alfabéticamente
        return a.localeCompare(b);
      });
    } else if (categoria === "zapatillas") {
      // Ordenar zapatillas por número
      return tallas.sort((a, b) => {
        const parseTalla = (talla) => {
          const parts = talla.split("|");
          const usPart = parts[0]?.trim().split(" ")[0];
          const numericPart = parseFloat(usPart?.replace(",", ".")) || 0;
          return numericPart;
        };
        
        const aNum = parseTalla(a);
        const bNum = parseTalla(b);
        
        if (aNum !== bNum) {
          return aNum - bNum;
        }
        
        // Si los números son iguales, ordenar alfabéticamente
        return a.localeCompare(b);
      });
    } else if (categoria === "accesorios") {
      // Para accesorios, ordenar alfabéticamente pero con "Accesorios" al final
      return tallas.sort((a, b) => {
        if (a === "Accesorios") return 1;
        if (b === "Accesorios") return -1;
        return a.localeCompare(b);
      });
    }
    
    // Orden por defecto alfabético
    return tallas.sort((a, b) => a.localeCompare(b));
  };

  useEffect(() => {
    console.log('Estado inicial de selección de talla:', {
      categoria,
      selectedTalla,
      loading,
      error,
      tallasDisponibles: availableTallas.length
    });

    const fetchProducts = async () => {
      if (!categoria) {
        console.log('No hay categoría seleccionada');
        return;
      }
      
      console.log('Iniciando carga de productos para tallas:', categoria);
      setLoading(true);
      try {
        // Usar la nueva ruta específica para tallas
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/categoria/${categoria}/tallas`);
        if (!response.ok) throw new Error("Error al cargar las tallas");
        
        const tallasArray = await response.json();
        
        // Verificar que la respuesta sea un array
        if (!Array.isArray(tallasArray)) {
          console.error('La respuesta no es un array:', tallasArray);
          throw new Error("Formato de tallas inválido");
        }
        
        // Ordenar las tallas según la categoría
        const tallasOrdenadas = sortTallas(tallasArray);
        
        console.log('Tallas cargadas y ordenadas:', {
          categoria,
          totalTallas: tallasOrdenadas.length,
          tallas: tallasOrdenadas
        });
        
        setAvailableTallas(tallasOrdenadas);
      } catch (error) {
        console.error('Error al cargar tallas:', {
          mensaje: error.message,
          stack: error.stack,
          categoria
        });
        setError("Error al cargar las tallas disponibles");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [categoria]);

  const handleTallaSelect = (talla) => {
    console.log('Selección de talla:', {
      talla,
      categoria,
      tallaActual: selectedTalla
    });
    
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
    console.log('Redirección:', {
      url,
      parametro: paramName,
      valor: talla
    });
    router.push(url);
  };

  const getTitle = () => {
    if (categoria === "ropa") return "¿Qué talla de ropa usas?";
    if (categoria === "zapatillas") return "¿Qué talles de zapatillas usas?";
    if (categoria === "accesorios") return "Selecciona una opción";
    return "Selecciona tu talla";
  };

  if (!categoria) {
    console.log('Esperando categoría...');
    return <div className="container py-10 mx-auto">Cargando...</div>;
  }

  if (loading) {
    console.log('Cargando tallas para categoría:', categoria);
    return (
      <div className="container flex items-center justify-center py-10 mx-auto">
        <BounceLoader color="#BE1A1D" />
      </div>
    );
  }

  if (error) {
    console.error('Error en selección de talla:', {
      error,
      categoria
    });
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

  if (!Array.isArray(availableTallas) || availableTallas.length === 0) {
    console.log('No hay tallas disponibles:', {
      categoria,
      productosCargados: true,
      availableTallas
    });
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

  console.log('Renderizando selector de tallas:', {
    categoria,
    totalTallas: availableTallas.length,
    tallaSeleccionada: selectedTalla
  });

  return (
    <div className="container py-10 mx-auto">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="mb-8 text-3xl font-bold text-gray-800 dark:text-white">{getTitle()}</h1>
        
        {error && <p className="mb-4 text-red-500">{error}</p>}
        
        <div className="grid grid-cols-3 gap-4 mb-8 sm:grid-cols-4 md:grid-cols-5 justify-items-center">
          {Array.isArray(availableTallas) && availableTallas.map((talla) => {
            // Formatear la talla para mostrar con imágenes de banderas
            let formattedTalla = talla;
            if (categoria === "zapatillas" && talla.includes("|")) {
              const parts = talla.split("|");
              if (parts.length >= 2) {
                const usPart = parts[0]?.trim().split(" ")[0]; // Número US
                const wPart = parts[1]?.trim().includes('W') ? parts[1].trim().split(" ")[0] : null; // Número W
                const arPart = parts[wPart ? 2 : 1]?.trim().split(" ")[0]; // Número AR
                const cmPart = parts[wPart ? 3 : 2]?.trim().split(" ")[0]; // Centímetros
                
                const cm = getCmFromTalla(talla);
                formattedTalla = (
                  <div className="flex flex-col items-center w-full gap-1 py-2">
                    <div className="flex items-center gap-1">
                      <span className="text-base font-bold">{usPart}</span>
                      <Image src={US_FLAG} alt="US" width={16} height={12} className="inline-block" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-base font-bold">{arPart}</span>
                      <Image src={AR_FLAG} alt="AR" width={16} height={12} className="inline-block" />
                    </div>
                    {cm && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {cm} cm
                      </div>
                    )}
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
                    : "bg-white dark:bg-dark-bg text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
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