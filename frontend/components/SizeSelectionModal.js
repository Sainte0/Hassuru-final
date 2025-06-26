import React from 'react';

const SizeSelectionModal = ({ isOpen, onClose, selectedSizes, setSelectedSizes, sizePrices, setSizePrices }) => {
    // Define the available sizes
    const availableSizes = [
        "3.5 usa | 34.5 arg", "4 usa | 35 arg", "4.5 usa | 35.5 arg",
        "5 usa | 36 arg", "5.5 usa | 37 arg", "6 usa | 37.5 arg",
        "6.5 usa | 38 arg", "7 usa | 39 arg", "7.5 usa | 39.5 arg",
        "8 usa | 40 arg", "8.5 usa | 41 arg", "9 usa | 41.5 arg",
        "9.5 usa | 42 arg", "10 usa | 43 arg", "10.5 usa | 43.5 arg",
        "11 usa | 44 arg", "11.5 usa | 44.5 arg", "12 usa | 45 arg",
        "12.5 usa | 45.5 arg", "13 usa | 46.5 arg", "13.5 usa | 47 arg",
        "14 usa | 47.5 arg"
    ];

    const handleCheckboxChange = (size) => {
        if (selectedSizes.includes(size)) {
            setSelectedSizes(selectedSizes.filter(s => s !== size)); // Remove size if already selected
            const newSizePrices = { ...sizePrices };
            delete newSizePrices[size]; // Remove price entry for the unselected size
            setSizePrices(newSizePrices);
        } else {
            setSelectedSizes([...selectedSizes, size]); // Add size if not selected
        }
    };

    const handlePriceChange = (size, price) => {
        const parsedPrice = parseFloat(price);
        if (!isNaN(parsedPrice)) {
            setSizePrices(prev => ({ ...prev, [size]: parsedPrice })); // Update the price for the size
        } else {
            setSizePrices(prev => ({ ...prev, [size]: 0 })); // Default to 0 if the input is invalid
        }
    };

    const handleConfirm = () => {
        onClose(); // Close the modal after confirming
    };

    return (
        isOpen ? (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="w-full max-w-md p-6 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Selecciona las Tallas y Precios</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        {availableSizes.map((size, index) => (
                            <div key={index} className="flex items-center mb-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <input
                                    type="checkbox"
                                    id={`size-${size}`}
                                    checked={selectedSizes.includes(size)}
                                    onChange={() => handleCheckboxChange(size)}
                                    className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <label 
                                    htmlFor={`size-${size}`} 
                                    className="cursor-pointer flex-1 text-gray-900 dark:text-gray-100 font-medium"
                                >
                                    {size}
                                </label>
                                {selectedSizes.includes(size) && (
                                    <input
                                        type="number"
                                        placeholder="Precio"
                                        value={sizePrices[size] || ''}
                                        onChange={(e) => handlePriceChange(size, e.target.value)}
                                        className="ml-2 border border-gray-300 dark:border-gray-600 rounded p-2 w-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={onClose} 
                            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors duration-200"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleConfirm} 
                            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors duration-200"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        ) : null
    );
};

export default SizeSelectionModal; 