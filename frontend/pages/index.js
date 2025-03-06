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
     <div>
      <h1>hola mundo</h1>
     </div>
    </main>
  );
}
