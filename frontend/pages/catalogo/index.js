import React from "react";
import Catalogo from "../../components/Catalogo";
import Link from "next/link";

export default function catalogo() {
  return (
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
  );
}
