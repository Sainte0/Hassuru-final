import React, { useEffect, useState } from "react";
import Detail from "../../components/Detail";
import { useRouter } from "next/router";
import useStore from "../../store/store";
import { BounceLoader } from 'react-spinners';

export default function DetailPage() {
  const { fetchProductById, product, fetchDolarBlue } = useStore();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Obtener el producto
          await fetchProductById(id);
          
          // Verificar si necesitamos obtener el valor del dólar blue
          const lastUpdate = localStorage.getItem('dolarBlueLastUpdate');
          const now = Date.now();
          if (!lastUpdate || now - parseInt(lastUpdate) > 5 * 60 * 1000) {
            await fetchDolarBlue();
          }
        } catch (error) {
          console.error("Error al cargar datos:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id, fetchProductById, fetchDolarBlue]);

  if (loading) return <div className="flex items-center justify-center mt-[5%] bg-white dark:bg-gray-900"><BounceLoader color="#BE1A1D" /></div>;

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      {product ? <Detail product={product} /> : <div className="text-gray-900 dark:text-white">No se encontró el producto.</div>}
    </div>
  );
}
