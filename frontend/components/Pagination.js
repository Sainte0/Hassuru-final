import React from "react";

export default function Pagination({ totalPages, currentPage, onPageChange }) {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Número máximo de páginas visibles

    if (totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Siempre mostrar la primera página
      pageNumbers.push(1);

      // Calcular el rango de páginas alrededor de la página actual
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Ajustar el rango si estamos cerca del inicio o del final
      if (currentPage <= 3) {
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      // Agregar puntos suspensivos y páginas intermedias
      if (startPage > 2) {
        pageNumbers.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      // Siempre mostrar la última página
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="flex justify-center mt-8 space-x-2">
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => page !== '...' && onPageChange(page)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
            ${page === '...' 
              ? "cursor-default"
              : currentPage === page
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }
            sm:px-4 sm:py-2
            md:px-5 md:py-2.5
            lg:px-6 lg:py-3
            text-base md:text-lg`}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}
    </div>
  );
}
