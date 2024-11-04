import { useState, useEffect } from "react";
import Pagination from "../../components/Pagination";
import { BounceLoader } from 'react-spinners';

export default function Suscriptores() {
  const [currentPage, setCurrentPage] = useState(1);
  const [suscriptores, setSuscriptores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const emailsPerPage = 39;

  const currentEmails = suscriptores.slice(
    (currentPage - 1) * emailsPerPage,
    currentPage * emailsPerPage
  );
  const totalPages = Math.ceil(suscriptores.length / emailsPerPage);

  const obtenerSuscriptores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/suscriptores`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Error al obtener los suscriptores");
      const data = await response.json();
      setSuscriptores(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerSuscriptores();
  }, []);

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Lista de Suscriptores</h1>
      <div className="p-4 bg-white rounded-lg shadow-md">
        {loading ? (
          <div className="flex justify-center"><BounceLoader color="#BE1A1D" /></div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : suscriptores.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {currentEmails.map((email, index) => (
              <div
                key={index}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg shadow-sm"
              >
                {email}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay suscriptores.</p>
        )}
      </div>
      {suscriptores.length > emailsPerPage && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
