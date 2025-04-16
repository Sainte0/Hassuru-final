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
    ));
  };

  return (
    <div className="flex justify-center mt-8 space-x-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
            ${currentPage === page
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }
            sm:px-4 sm:py-2
            md:px-5 md:py-2.5
            lg:px-6 lg:py-3
            text-base md:text-lg`}
        >
          {page}
        </button>
      ))}
    </div>
  );
}
