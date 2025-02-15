import React from "react";

export default function Pagination({ totalPages, currentPage, onPageChange }) {
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const renderPageButtons = () => {
    let pages = [];
    
    if (totalPages <= 5) {
      // Si hay 5 o menos páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar siempre las primeras 5 páginas
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      // Agregar puntos suspensivos si hay más páginas
      if (totalPages > 5) {
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages.map((page, index) => (
      <button
        key={index}
        onClick={() => page !== '...' && onPageChange(page)}
        className={`px-3 py-1 rounded-lg ${
          page === '...' 
            ? "cursor-default"
            : currentPage === page
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-blue-500 hover:text-white"
        }`}
        disabled={page === '...'}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="flex justify-center mt-4 space-x-2">
      <button
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-lg ${
          currentPage === 1
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Anterior
      </button>
      {renderPageButtons()}
      <button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-lg ${
          currentPage === totalPages
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Siguiente
      </button>
    </div>
  );
}
