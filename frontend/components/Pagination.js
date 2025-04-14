import React from "react";

export default function Pagination({ totalPages, currentPage, onPageChange }) {
  const handlePageChange = (page) => {
    onPageChange(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const renderPageButtons = () => {
    let pages = [];
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const maxVisible = isMobile ? 3 : 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar menos páginas en móvil
      const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(totalPages, start + maxVisible - 1);

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages.map((page, index) => (
      <button
        key={index}
        onClick={() => page !== '...' && handlePageChange(page)}
        className={`px-2 py-1 text-sm sm:px-3 sm:py-1 rounded-lg ${
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
    <div className="flex justify-center items-center mt-4 gap-1 sm:gap-2">
      <button
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className={`min-w-[40px] px-2 py-2 text-sm sm:px-3 sm:py-1 sm:text-sm rounded-lg ${
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
        className={`min-w-[40px] px-2 py-2 text-sm sm:px-3 sm:py-1 sm:text-sm rounded-lg ${
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
