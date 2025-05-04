import React, { useState, useEffect } from "react";
import useStore from "../store/store";

export default function Detail({ product }) {
  const [showTallas, setShowTallas] = useState(false);
  const [selectedTalla, setSelectedTalla] = useState(null);
  const [customTalla, setCustomTalla] = useState("");
  const { dolarBlue, fetchDolarBlue } = useStore();

  useEffect(() => {
    fetchDolarBlue();
    
    // Actualizar el valor cada 5 minutos
    const interval = setInterval(() => {
      fetchDolarBlue();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchDolarBlue]);

  const handleCompraClick = () => {
    if (selectedTalla || customTalla) {
      const message = selectedTalla
        ? `Hola, quiero comprar esta prenda ${product.nombre} en el talle ${selectedTalla.talla}`
        : `Hola, quiero encargar esta prenda ${product.nombre} en talle ${customTalla}`;

      const whatsappUrl = `https://api.whatsapp.com/send?phone=3512595858&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    } else {
      setShowTallas(true);
    }
  };

  const handleTallaSelect = (talla) => {
    if (selectedTalla === talla) {
      setSelectedTalla(null);
    } else {
      setSelectedTalla(talla);
      setCustomTalla("");
    }
  };

  // Función para obtener la URL de la imagen
  const getImageUrl = () => {
    // Si no hay imagen, devolver una imagen por defecto
    if (!product.image) return "/placeholder.jpg";
    
    // Si la imagen es una URL de Cloudinary, usarla directamente
    if (typeof product.image === 'string' && product.image.includes('cloudinary')) {
      return product.image;
    }
    
    // Si la imagen es un objeto con data (nuevo formato), usar la ruta de la API
    if (product._id) {
      const timestamp = new Date().getTime();
      return `${process.env.NEXT_PUBLIC_URL || "http://localhost:5001"}/api/productos/${product._id}/image?t=${timestamp}`;
    }
    
    return "/placeholder.jpg";
  };

  return (
    <div className="container py-10 mx-auto sm:flex sm:flex-col lg:flex-row lg:space-x-10">
      <div className="px-2 mb-6 lg:w-1/2 sm:w-full lg:mb-0">
        <img
          src={getImageUrl()}
          alt={product.nombre}
          width={500}
          height={500}
          style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
        />
      </div>
      <div className="flex flex-col w-full p-2 space-y-4 lg:w-1/2">
        <h2 className="text-3xl font-bold text-gray-800 lg:text-4xl">{product.nombre}</h2>
        <div className="space-y-2 text-gray-800">
          <p className="text-lg font-semibold">{product.descripcion}</p>
          <p className="text-4xl font-bold">${product.precio} USD</p>
          <p className="text-lg text-gray-400">${(product.precio * dolarBlue).toFixed(2)} ARS</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowTallas(!showTallas)}
            className="flex items-center justify-between w-full px-4 py-2 text-left text-black bg-white border border-gray-400 rounded-md hover:bg-gray-100"
          >
            <span>Ver talles disponibles</span>
            <span>▼</span>
          </button>
          {showTallas && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-md">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {product.tallas.map((talla) => (
                    <button
                      key={talla._id}
                      onClick={() => handleTallaSelect(talla)}
                      className={`px-4 py-2 border rounded-md ${
                        selectedTalla?._id === talla._id
                          ? "bg-red-600 text-white border-red-600"
                          : "border-gray-300 hover:border-red-600"
                      }`}
                    >
                      {talla.talla}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-600">
          {product.tallas.some((tallaObj) => tallaObj.precioTalla > 0) ? (
            product.encargo ? (
              <span className="text-yellow-500">Disponible en 3 días</span>
            ) : (
              <span className="text-green-500">Entrega inmediata</span>
            )
          ) : (
            <span className="text-red-500">Disponible en 20 días</span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>✓</span>
          <p>Artículo verificado, 100% original.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>📦</span>
          {Object.entries(product.tallas).some(([_, stock]) => stock > 0) ? (
            <p>Quedan {Object.values(product.tallas).reduce((acc, stock) => acc + stock, 0)} en stock. Ordena pronto.</p>
          ) : (
            <p>No hay stock disponible. Pide tu talle.</p>
          )}
        </div>
        {selectedTalla && (
          <div className="mt-2 text-sm text-gray-600">
            Has seleccionado la talla: <span className="font-bold">{selectedTalla.talla}</span>
            <button
              onClick={() => setSelectedTalla(null)}
              className="ml-2 text-sm text-red-500 hover:underline"
            >
              Deseleccionar
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-2">
          <div className="p-4 text-sm text-center text-gray-600 border rounded-md">
            Envíos gratis a todo el país.
          </div>
          <div className="p-4 text-sm text-center text-gray-600 border rounded-md">
            Entrega en Córdoba Capital
          </div>
        </div>
        <div className="mt-4">
          <button
            className={`flex items-center justify-center w-full px-4 py-2 text-white bg-green-500 border border-gray-400 rounded-md hover:bg-green-600`}
            onClick={handleCompraClick}
          >
            {selectedTalla || customTalla ? "Comprar" : "Consultar stock"}
          </button>
        </div>
        <div className="p-4 mt-6 bg-white border border-gray-300 rounded-md shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">Medios de pago disponibles:</h3>
          <ul className="mt-2 space-y-2 text-gray-700">
            <li className="flex items-center">
              <span className="text-green-500">✔️</span>
              <span className="ml-2">Zelle, Cashapp, USDT/CRYPTO</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500">✔️</span>
              <span className="ml-2">Transferencia en pesos</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500">✔️</span>
              <span className="ml-2">Transferencia en U$D (solo desde cuentas internacionales)</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500">✔️</span>
              <span className="ml-2">Efectivo (Córdoba & Buenos Aires)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
