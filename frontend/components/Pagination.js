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
    
    // Lógica responsive para la cantidad de páginas a mostrar
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const maxVisiblePages = screenWidth < 640 ? 3 : 5; // 3 páginas en móvil, 5 en desktop
    
    if (totalPages <= maxVisiblePages) {
      // Si hay menos páginas que el máximo visible, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con números actuales
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Ajustar si estamos cerca del final
      if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      // Agregar primera página si no está incluida
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      // Agregar páginas intermedias
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Agregar última página si no está incluida
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages.map((page, index) => (
      <button
        key={index}
        onClick={() => page !== '...' && onPageChange(page)}
        className={`px-2 py-1 text-sm sm:px-3 sm:py-1 sm:text-base rounded-lg ${
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
    <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-4 px-2">
      <button
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className={`px-2 py-1 text-sm sm:px-3 sm:py-1 sm:text-base rounded-lg ${
          currentPage === 1
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        <span className="hidden sm:inline">Anterior</span>
        <span className="sm:hidden">←</span>
      </button>
      {renderPageButtons()}
      <button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className={`px-2 py-1 text-sm sm:px-3 sm:py-1 sm:text-base rounded-lg ${
          currentPage === totalPages
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        <span className="hidden sm:inline">Siguiente</span>
        <span className="sm:hidden">→</span>
      </button>
    </div>
  );
}
