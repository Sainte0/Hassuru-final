import React, { useEffect, useState } from "react";

export default function Pagination({ totalPages, currentPage, onPageChange }) {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getVisiblePages = () => {
    let pages = [];
    const isMobile = windowWidth < 640;
    const maxVisible = isMobile ? 3 : 5;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= Math.ceil(maxVisible / 2)) {
      pages = Array.from({ length: maxVisible }, (_, i) => i + 1);
      if (totalPages > maxVisible) pages.push('...', totalPages);
    } else if (currentPage > totalPages - Math.ceil(maxVisible / 2)) {
      pages = Array.from({ length: maxVisible }, (_, i) => totalPages - maxVisible + i + 1);
      if (totalPages > maxVisible) pages.unshift(1, '...');
    } else {
      const offset = Math.floor(maxVisible / 2);
      pages = Array.from(
        { length: maxVisible },
        (_, i) => currentPage - offset + i
      );
      pages.unshift(1, '...');
      pages.push('...', totalPages);
    }

    return pages;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center items-center py-4 bg-white shadow-lg">
      <div className="flex gap-1 items-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-sm rounded-lg disabled:bg-gray-200 disabled:text-gray-400 bg-blue-500 text-white"
        >
          ←
        </button>
        
        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`
              px-2 py-1 text-sm rounded-lg
              ${page === currentPage ? 'bg-blue-600 text-white' : ''}
              ${typeof page === 'number' ? 'hover:bg-blue-500 hover:text-white' : ''}
              ${page === '...' ? 'cursor-default' : 'bg-gray-200'}
            `}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-sm rounded-lg disabled:bg-gray-200 disabled:text-gray-400 bg-blue-500 text-white"
        >
          →
        </button>
      </div>
    </div>
  );
}
