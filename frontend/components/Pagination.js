import React from "react";

export default function Pagination({ totalPages, currentPage, onPageChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-sm md:px-3 md:py-2 rounded-lg disabled:bg-gray-200 disabled:text-gray-400 bg-blue-500 text-white"
          >
            ←
          </button>

          <div className="hidden sm:flex gap-1">
            {currentPage > 2 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="px-2 py-1 text-sm md:px-3 md:py-2 rounded-lg bg-gray-200 hover:bg-blue-500 hover:text-white"
                >
                  1
                </button>
                {currentPage > 3 && <span className="px-2">...</span>}
              </>
            )}

            {Array.from({ length: 3 }, (_, i) => {
              const pageNum = Math.min(Math.max(currentPage - 1 + i, 1), totalPages);
              if (pageNum <= 0 || pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-2 py-1 text-sm md:px-3 md:py-2 rounded-lg ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {currentPage < totalPages - 1 && (
              <>
                {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="px-2 py-1 text-sm md:px-3 md:py-2 rounded-lg bg-gray-200 hover:bg-blue-500 hover:text-white"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <div className="sm:hidden">
            <span className="px-2 py-1 text-sm bg-gray-100 rounded-lg">
              {currentPage} de {totalPages}
            </span>
          </div>

          <button
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-sm md:px-3 md:py-2 rounded-lg disabled:bg-gray-200 disabled:text-gray-400 bg-blue-500 text-white"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
