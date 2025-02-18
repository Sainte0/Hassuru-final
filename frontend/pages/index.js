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
    fetchProducts();
    fetchDolarBlue();
    if (!tiktokLinks.length) {
      fetchTikTokLinks();
    }
  }, []);

  if (loading) return <div className="flex items-center justify-center mt-[15%]"><BounceLoader color="#BE1A1D" /></div>;
  if (error) return <div>Error: {error}</div>;

  const destacados = products.filter((product) => product.destacado === true);
  const zapatillas = products.filter((product) => product.destacado_zapatillas === true);

  return (
    <main>
      <div className="container p-4 mx-auto">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link className="w-full md:w-[50.49%] h-auto block" href="/productos/categoria/zapatillas">
            <Image
              src="/images/Sneackers.png"
              alt="Catalogo"
              width={600}
              height={500}
              className="object-cover w-full h-full"
            />
          </Link>
          <Link className="w-full md:w-[49.51%] h-auto block" href="/catalogo">
            <Image
              src="/images/Ropa.png"
              alt="Encargo"
              width={620}
              height={500}
              className="object-cover w-full h-full"
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
