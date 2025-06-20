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
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/categoria/${categoria}`);
        if (!response.ok) throw new Error("Error al cargar los productos");
        
        const data = await response.json();
        
        // Verificar la estructura de la respuesta
        let products;
        if (data.productos && Array.isArray(data.productos)) {
          // Nueva estructura: { productos: [...], pagination: {...} }
          products = data.productos;
        } else if (Array.isArray(data)) {
          // Estructura antigua: array directo
          products = data;
        } else {
          throw new Error("Formato de respuesta inesperado del servidor");
        }
        
        console.log('Productos cargados para tallas:', {
          categoria,
          totalProductos: products.length,
          productos: products.map(p => ({
            id: p._id,
            nombre: p.nombre,
            tallas: p.tallas
          }))
        });
        
        // Extract available sizes based on category
        const tallasSet = new Set();
        
        // Asegurar que products sea un array antes de usar forEach
        if (!Array.isArray(products)) {
          console.error('Products no es un array:', products);
          throw new Error("Formato de productos inválido");
        }
        
        products.forEach(product => {
          if (product.tallas && Array.isArray(product.tallas)) {
            product.tallas.forEach(tallaObj => {
              if (tallaObj.talla) {
                tallasSet.add(tallaObj.talla);
              }
            });
          }
        });
        
        console.log('Tallas únicas encontradas:', {
          categoria,
          totalTallas: tallasSet.size,
          tallas: Array.from(tallasSet)
        });
        
        // Convert Set to Array and sort
        const tallasArray = Array.from(tallasSet);
        
        // Sort sizes based on category
        if (categoria === "ropa") {
          // Sort clothing sizes: XS, S, M, L, XL, XXL, OS
          const tallaOrder = ["XS", "S", "M", "L", "XL", "XXL", "OS"];
          tallasArray.sort((a, b) => tallaOrder.indexOf(a) - tallaOrder.indexOf(b));
          console.log('Tallas de ropa ordenadas:', {
            categoria,
            orden: tallasArray
          });
        } else if (categoria === "zapatillas") {
          // Sort shoe sizes numerically
          tallasArray.sort((a, b) => {
            const parseTalla = (talla) => {
              return parseFloat(talla.replace(",", "."));
            };
            return parseTalla(a) - parseTalla(b);
          });
          console.log('Tallas de zapatillas ordenadas:', {
            categoria,
            orden: tallasArray
          });
        }
        
        setAvailableTallas(tallasArray);
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
    if (categoria === "zapatillas") return "¿Qué número de calzado usas?";
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
        <h1 className="mb-8 text-3xl font-bold text-gray-800">{getTitle()}</h1>
        
        {error && <p className="mb-4 text-red-500">{error}</p>}
        
        <div className="grid grid-cols-3 gap-4 mb-8 sm:grid-cols-4 md:grid-cols-5 justify-items-center">
          {Array.isArray(availableTallas) && availableTallas.map((talla) => {
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