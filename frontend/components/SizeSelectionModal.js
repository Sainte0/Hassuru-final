import React from 'react';

const SizeSelectionModal = ({ isOpen, onClose, selectedSizes, setSelectedSizes }) => {
  // Define the available sizes
  const availableSizes = [
    "3.5 USA | 34.5 ARG", "4 USA | 35 ARG", "4.5 USA | 35.5 ARG",
    "5 USA | 36 ARG", "5.5 USA | 37 ARG", "6 USA | 37.5 ARG",
    "6.5 USA | 38 ARG", "7 USA | 39 ARG", "7.5 USA | 39.5 ARG",
    "8 USA | 40 ARG", "8.5 USA | 40.5 ARG", "9 USA | 41 ARG",
    "9.5 USA | 41.5 ARG", "10 USA | 42 ARG", "10.5 USA | 42.5 ARG",
    "11 USA | 43 ARG", "11.5 USA | 43.5 ARG", "12 USA | 44 ARG",
    "12.5 USA | 44.5 ARG", "13 USA | 45 ARG", "13.5 USA | 45.5 ARG",
    "14 USA | 47.5 ARG"
  ];

  const handleCheckboxChange = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size)); // Remove size if already selected
    } else {
      setSelectedSizes([...selectedSizes, size]); // Add size if not selected
    }
  };

  const handleConfirm = () => {
    onClose(); // Close the modal after confirming
  };

  return (
    isOpen ? (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl">Selecciona las Tallas</h2>
          <div className="max-h-60 overflow-y-auto">
            {availableSizes.map((size, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`size-${size}`}
                  checked={selectedSizes.includes(size)}
                  onChange={() => handleCheckboxChange(size)}
                  className="mr-2"
                />
                <label htmlFor={`size-${size}`} className="cursor-pointer">{size}</label>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleConfirm} className="px-4 py-2 text-white bg-blue-500 rounded">Confirmar</button>
            <button onClick={onClose} className="px-4 py-2 ml-2 text-white bg-red-500 rounded">Cancelar</button>
          </div>
        </div>
      </div>
    ) : null
  );
};

export default SizeSelectionModal; 