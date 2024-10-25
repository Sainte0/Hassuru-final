import { useState, useEffect } from "react";
import Pagination from "../../../frontend/components/Pagination";

export default function Suscriptores() {
  const [currentPage, setCurrentPage] = useState(1);
  const [suscriptores, setSuscriptores] = useState([]);
  const emailsPerPage = 39;
  const indexOfLastEmail = currentPage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const currentEmails = suscriptores.slice(indexOfFirstEmail, indexOfLastEmail); 
  const totalPages = Math.ceil(suscriptores.length / emailsPerPage); 

  const obtenerSuscriptores = async () => {
    try {
      const response = await fetch("https://web-production-73e61.up.railway.app/api/suscriptores", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener los suscriptores");
      }
      const data = await response.json();
      setSuscriptores(data);
    } catch (error) {
      console.error("Error al obtener los suscriptores:", error);
    }
  };

  
  useEffect(() => {
    obtenerSuscriptores();
  }, []);

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Lista de Suscriptores</h1>
      <div className="p-4 bg-white rounded-lg shadow-md">
        {suscriptores.length > 0 ? (
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
