import React, { useEffect } from "react";
import Carousell from "../../frontend/components/Carousell";
import Image from "next/image";
import Link from "next/link";
import Newsletter from "../../frontend/components/Newsletter";
import useStore from "../store/store";
import { BounceLoader } from 'react-spinners';

export default function Home() {
  const { loading, error, products, fetchProducts, dolarBlue, fetchDolarBlue, fetchTikTokLinks, tiktokLinks } = useStore();

  useEffect(() => {
    console.log('Estado inicial de Home:', {
      loading,
      error,
      productsCount: products?.length,
      dolarBlue,
      tiktokLinksCount: tiktokLinks?.length
    });

    // Función para inicializar los datos
    const initializeData = async () => {
      console.log('Iniciando carga de datos en Home...');
      try {
        // Obtener productos
        console.log('Iniciando fetchProducts...');
        await fetchProducts();
        console.log('Productos cargados en Home:', {
          total: products?.length,
          destacados: products?.filter(p => p.destacado).length,
          zapatillas: products?.filter(p => p.destacado_zapatillas).length,
          categorias: [...new Set(products?.map(p => p.categoria))]
        });
        
        // Obtener valor del dólar blue
        const lastUpdate = localStorage.getItem('dolarBlueLastUpdate');
        const now = Date.now();
        console.log('Estado del dólar blue:', {
          ultimaActualizacion: lastUpdate,
          tiempoTranscurrido: now - parseInt(lastUpdate || 0),
          necesitaActualizacion: !lastUpdate || now - parseInt(lastUpdate) > 5 * 60 * 1000
        });

        if (!lastUpdate || now - parseInt(lastUpdate) > 5 * 60 * 1000) {
          console.log('Actualizando dólar blue...');
          await fetchDolarBlue();
          console.log('Dólar Blue actualizado:', dolarBlue);
        }
        
        // Obtener enlaces de TikTok
        console.log('Estado de TikTok links:', {
          hayLinks: tiktokLinks?.length > 0,
          cantidadLinks: tiktokLinks?.length
        });

        if (!tiktokLinks.length) {
          console.log('Cargando links de TikTok...');
          await fetchTikTokLinks();
          console.log('Links de TikTok cargados:', tiktokLinks);
        }
      } catch (error) {
        console.error("Error detallado al inicializar datos:", {
          mensaje: error.message,
          stack: error.stack,
          tipo: error.name
        });
      }
    };
    
    initializeData();
  }, []);

  if (loading) {
    console.log('Home en estado de carga...');
    return <div className="flex items-center justify-center mt-[15%]"><BounceLoader color="#BE1A1D" /></div>;
  }
  
  if (error) {
    console.error('Error en Home:', error);
    return <div>Error: {error}</div>;
  }

  const destacados = products.filter((product) => product.destacado === true);
  const zapatillas = products.filter((product) => product.destacado_zapatillas === true);

  console.log('Resumen de productos en Home:', {
    total: products.length,
    destacados: {
      cantidad: destacados.length,
      productos: destacados.map(p => ({ id: p._id, nombre: p.nombre }))
    },
    zapatillas: {
      cantidad: zapatillas.length,
      productos: zapatillas.map(p => ({ id: p._id, nombre: p.nombre }))
    }
  });

  return (
    <main>
      <div className="container p-4 mx-auto">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link className="w-full md:w-[49.51%] h-auto block" href="/productos/talla/zapatillas">
            <img
              src="https://i.ibb.co/8D7xdF7G/Sneackers.png"
              alt="Catalogo"
              width={600}
              height={500}
              style={{ objectFit: 'cover', width: '100%', height: '500px', background: '#f3f3f3', borderRadius: '12px' }}
            />
          </Link>
          <Link className="w-full md:w-[50.49%] h-auto block" href="/productos/talla/ropa">
            <img
              src="https://i.ibb.co/hk3ppsH/Ropa.png"
              alt="Encargo"
              width={620}
              height={500}
              style={{ objectFit: 'cover', width: '100%', height: '500px', background: '#f3f3f3', borderRadius: '12px' }}
            />
          </Link>
        </div>
      </div>
      <div className="mt-2">
        <Link href="/productos/categoria/ropa">
          <Carousell dolarBlue={dolarBlue} products={destacados} title={"Destacados"} />
        </Link>
      </div>
      <div className="mt-8 mb-10">
        <Link href="/productos/categoria/zapatillas">
          <Carousell dolarBlue={dolarBlue} products={zapatillas} title={"Zapatillas"} />
        </Link>
      </div>
      <div className="container grid grid-cols-1 gap-4 px-2 mx-auto mt-8 lg:px-24 md:grid-cols-3">
        {tiktokLinks.slice(0, 3).map((linkObj, index) => (
          <iframe
            key={index}
            src={linkObj.link}
            width="100%"
            height="750"
            style={{ border: "none" }}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; accelerometer; gyroscope;"
            allowFullScreen
          ></iframe>
        ))}
      </div>
      <div className="mb-4">
        <Newsletter />
      </div>
    </main>
  );
}
