import React from "react";
import Catalogo from "../../components/Catalogo";
import SEOHead from "../../components/SEOHead";
import Link from "next/link";

export default function catalogo() {
  return (
    <>
      <SEOHead 
        title="Catálogo Completo - Hassuru | Ropa y Zapatillas de Marca"
        description="Explora nuestro catálogo completo de ropa y zapatillas de marca. Encuentra sneakers, ropa deportiva y accesorios de las mejores marcas. ¡Compra online en Hassuru!"
        keywords="catálogo, ropa, zapatillas, sneakers, marca, deportes, moda, Argentina, online, tienda, Nike, Adidas, Puma, Reebok"
        url="https://hassuru.ar/catalogo"
      />
      <div>
        <Catalogo />
        <div className="flex justify-center mt-6">
          <Link href="/encargos">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all text-lg">
              ¿No encontrás lo que buscás? Hacé tu encargo personalizado aquí
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
