import React from 'react';

const SizeSelectionModal = ({ isOpen, onClose, selectedSizes, setSelectedSizes, sizePrices, setSizePrices }) => {
    // Define the available sizes
    const availableSizes = [
        "3.5 usa | 34.5 arg", "4 usa | 35 arg", "4.5 usa | 35.5 arg",
        "5 usa | 36 arg", "5.5 usa | 37 arg", "6 usa | 37.5 arg",
        "6.5 usa | 38 arg", "7 usa | 39 arg", "7.5 usa | 39.5 arg",
        "8 usa | 40 arg", "8.5 usa | 40.5 arg", "9 usa | 41 arg",
        "9.5 usa | 41.5 arg", "10 usa | 42 arg", "10.5 usa | 42.5 arg",
        "11 usa | 43 arg", "11.5 usa | 43.5 arg", "12 usa | 44 arg",
        "12.5 usa | 44.5 arg", "13 usa | 45 arg", "13.5 usa | 45.5 arg",
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
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <h2 className="mb-4 text-xl">Selecciona las Tallas y Precios</h2>
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
                                {selectedSizes.includes(size) && (
                                    <input
                                        type="number"
                                        placeholder="Precio"
                                        value={sizePrices[size] || ''}
                                        onChange={(e) => handlePriceChange(size, e.target.value)}
                                        className="ml-2 border rounded p-1 w-20"
                                    />
                                )}
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