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
    // Función para inicializar los datos
    const initializeData = async () => {
      try {
        // Obtener productos
        await fetchProducts();
        
        // Obtener valor del dólar blue (solo si no está en caché)
        const lastUpdate = localStorage.getItem('dolarBlueLastUpdate');
        const now = Date.now();
        if (!lastUpdate || now - parseInt(lastUpdate) > 5 * 60 * 1000) {
          await fetchDolarBlue();
        }
        
        // Obtener enlaces de TikTok (solo si no hay datos)
        if (!tiktokLinks.length) {
          await fetchTikTokLinks();
        }
      } catch (error) {
        console.error("Error al inicializar datos:", error);
      }
    };
    
    initializeData();
  }, []);

  if (loading) return <div className="flex items-center justify-center mt-[15%]"><BounceLoader color="#BE1A1D" /></div>;
  if (error) return <div>Error: {error}</div>;

  const destacados = products.filter((product) => product.destacado === true);
  const zapatillas = products.filter((product) => product.destacado_zapatillas === true);

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
        <Carousell dolarBlue={dolarBlue} products={destacados} title={"Destacados"} />
      </div>
      <div className="mt-8 mb-10">
        <Carousell dolarBlue={dolarBlue} products={zapatillas} title={"Zapatillas"} />
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
