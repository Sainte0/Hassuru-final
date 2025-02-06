import React from 'react';

const SizeSelectionModal = ({ isOpen, onClose, availableSizes, selectedSizes, setSelectedSizes }) => {
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