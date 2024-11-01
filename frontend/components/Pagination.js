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

  return (
    <div className="flex justify-center mt-4 space-x-2">
      <button
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-lg ${currentPage === 1
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
      >
        Anterior
      </button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index + 1)}
          className={`px-3 py-1 rounded-lg ${currentPage === index + 1
            ? "bg-blue-600 text-white"
            : "bg-gray-200 hover:bg-blue-500 hover:text-white"
            }`}
        >
          {index + 1}
        </button>
      ))}
      <button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-lg ${currentPage === totalPages
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
      >
        Siguiente
      </button>
    </div>
  );
}
