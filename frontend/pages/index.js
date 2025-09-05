import React, { useEffect } from "react";
import Carousell from "../../frontend/components/Carousell";
import BannerCarousel from "../../frontend/components/BannerCarousel";
import TikTokEmbed from "../../frontend/components/TikTokEmbed";
import SEOHead from "../../frontend/components/SEOHead";
import Image from "next/image";
import Link from "next/link";
import Newsletter from "../../frontend/components/Newsletter";
import useStore from "../store/store";
import { BounceLoader } from 'react-spinners';

export default function Home() {
  const { loading, error, homeProducts, fetchHomeProducts, dolarBlue, fetchDolarBlue, fetchTikTokLinks, tiktokLinks, banners, fetchBanners } = useStore();

  useEffect(() => {
    // Función para inicializar los datos
    const initializeData = async () => {
      try {
        // Obtener productos de la home
        await fetchHomeProducts();
        
        // Obtener valor del dólar blue
        const lastUpdate = localStorage.getItem('dolarBlueLastUpdate');
        const now = Date.now();

        if (!lastUpdate || now - parseInt(lastUpdate) > 5 * 60 * 1000) {
          await fetchDolarBlue();
        }
        
        // Obtener enlaces de TikTok
        if (!tiktokLinks.length) {
          await fetchTikTokLinks();
        }

        // Obtener banners
        if (!banners.length) {
          await fetchBanners();
        }
      } catch (error) {
        console.error("Error detallado al inicializar datos: ", {
          mensaje: error.message,
          stack: error.stack,
          tipo: error.name
        });
      }
    };
    
    initializeData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center mt-[15%] bg-white dark:bg-dark-bg"><BounceLoader color="#BE1A1D" /></div>;
  }
  
  if (error) {
    return <div className="bg-white dark:bg-dark-bg text-gray-900 dark:text-white">Error: {error}</div>;
  }

  return (
    <>
      <SEOHead 
        title="Hassuru® | Sneakers Exclusivos y Streetwear de Marca en Argentina"
        description="Descubre las mejores ofertas en ropa y zapatillas de marca en Hassuru. Sneakers, ropa deportiva y accesorios con envío gratis en Argentina. ¡Compra online con confianza!"
        keywords="ropa, zapatillas, sneakers, marca, deportes, moda, Argentina, online, tienda, Nike, Adidas, Puma, Reebok"
        url="https://hassuru.ar"
      />
      <main className="bg-white dark:bg-dark-bg transition-colors duration-300">
        {/* Banner Carousel */}
        <div className="container px-4 mx-auto mt-4">
          <BannerCarousel banners={banners} />
        </div>

        <div className="container p-4 mx-auto">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Link className="w-full md:w-[49.51%] h-auto block" href="/productos/talla/zapatillas">
              <Image
                src="https://tzjkxidzrhbyypvqbtdb.supabase.co/storage/v1/object/public/product-images/banner-2160x2160-sneakers.jpg"
                alt="Catalogo"
                width={600}
                height={500}
                style={{ objectFit: 'cover', width: '100%', height: '500px', background: '#f3f3f3', borderRadius: '12px' }}
                className="dark:bg-gray-800"
                priority
              />
            </Link>
            <Link className="w-full md:w-[50.49%] h-auto block" href="/productos/talla/ropa">
              <Image
                src="https://tzjkxidzrhbyypvqbtdb.supabase.co/storage/v1/object/public/product-images/banner-2160x2160-clothing%20(1).jpg"
                alt="Encargo"
                width={620}
                height={500}
                style={{ objectFit: 'cover', width: '100%', height: '500px', background: '#f3f3f3', borderRadius: '12px' }}
                className="dark:bg-gray-800"
                priority
              />
            </Link>
          </div>
        </div>

        {/* Últimos productos por categoría */}
        <div className="mt-8">
          <Link href="/productos/categoria/ropa">
            <Carousell dolarBlue={dolarBlue} products={homeProducts.ultimosRopa} title={"Nuevos ingresos"} />
          </Link>
        </div>
        <div className="mt-2">
          <Link href="/productos/categoria/zapatillas">
            <Carousell dolarBlue={dolarBlue} products={homeProducts.ultimosZapatillas} title={"Nuevos ingresos en zapatillas"} />
          </Link>
        </div>

        {/* TikToks en horizontal */}
        <div className="container grid grid-cols-1 gap-4 px-4 mx-auto mt-8 md:grid-cols-3 bg-white dark:bg-dark-bg p-4 rounded-lg">
          {tiktokLinks.slice(0, 3).map((linkObj, index) => (
            <TikTokEmbed key={index} link={linkObj.link} index={index} />
          ))}
        </div>

        <div className="mb-4">
          <Newsletter />
        </div>
      </main>
    </>
  );
}