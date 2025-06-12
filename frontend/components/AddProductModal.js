import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import useStore from '../store/store';
import SizeSelectionModal from './SizeSelectionModal';

const AddProductModal = ({ isOpen, onClose, fetchProducts }) => {
  const [product, setProduct] = useState({
    nombre: '',
    descripcion: '',
    marca: [],
    categoria: '',
    precio: '',
    tallas: [],
    colores: [],
    image: null,
    encargo: false,
    destacado: false,
    destacado_zapatillas: false,
  });

  const { addProduct, productAdded } = useStore();
  const [tallaInput, setTallaInput] = useState('');
  const [precioTalla, setPrecioTalla] = useState(''); // Nuevo estado para el precio de la talla
  const [colorInput, setColorInput] = useState('');
  const [marcaInput, setMarcaInput] = useState('');

  const [imagePreview, setImagePreview] = useState(null);

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [sizePrices, setSizePrices] = useState({}); // State to hold prices for each selected size

  const categoriasDisponibles = [
    'ropa',
    'zapatillas',
    'accesorios',
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    if (name === 'precio') {
      const price = value ? parseFloat(value) : '';
      setProduct((prev) => ({
        ...prev,
        precio: price,
      }));
    } else {
      setProduct((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct((prev) => ({
        ...prev,
        image: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddTalla = () => {
    if (tallaInput && precioTalla) {
      setProduct((prev) => ({
        ...prev,
        tallas: [...prev.tallas, { talla: tallaInput, precioTalla: parseFloat(precioTalla) }],
      }));
      setTallaInput('');
      setPrecioTalla('');
    }
  };
  const handleRemoveTalla = (index) => {
    setProduct((prev) => ({
      ...prev,
      tallas: prev.tallas.filter((_, i) => i !== index),
    }));
  };

  const handleAddColor = () => {
    if (colorInput) {
      setProduct((prev) => ({
        ...prev,
        colores: [...prev.colores, { color: colorInput }],
      }));
      setColorInput('');
    }
  };

  const handleAddMarca = () => {
    if (marcaInput && !product.marca.includes(marcaInput)) {
      setProduct((prev) => ({
        ...prev,
        marca: [...prev.marca, marcaInput],
      }));
      setMarcaInput('');
    }
  };

  const handleRemoveMarca = (marcaToRemove) => {
    setProduct((prev) => ({
      ...prev,
      marca: prev.marca.filter((marca) => marca !== marcaToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validar que las tallas tengan el formato correcto
    const tallasValidas = product.tallas.every(
      (talla) =>
        talla.talla &&
        typeof talla.talla === "string" &&
        typeof talla.precioTalla === "number"
    );
  
    if (!tallasValidas) {
      toast.error("Las tallas deben contener 'talla' como texto y 'precioTalla' como número.");
      return;
    }
  
    const productoAEnviar = {
      nombre: product.nombre,
      descripcion: product.descripcion,
      marca: product.marca,
      categoria: product.categoria,
      precio: parseFloat(product.precio),
      tallas: product.tallas.map((talla) => ({
        talla: talla.talla,
        precioTalla: talla.precioTalla,
      })),
      colores: product.colores,
      encargo: product.encargo,
      destacado: product.destacado,
      destacado_zapatillas: product.destacado_zapatillas,
    };
  
    const imageFile = product.image;
  
    try {
      // Show loading toast
      const loadingToast = toast.loading("Agregando producto...");
      
      // Use the store's addProduct function which handles both the API call and store update
      await addProduct(productoAEnviar, imageFile);
      
      // Show success message
      toast.dismiss(loadingToast);
      toast.success("Producto agregado exitosamente!");
      
      // Close the modal first
      onClose();
      
      // Then refresh the product list if fetchProducts is provided
      if (typeof fetchProducts === 'function') {
        // Esperar un momento para asegurar que el modal se haya cerrado
        setTimeout(() => {
          fetchProducts();
          // Forzar una recarga completa de la página para asegurar que todos los datos estén actualizados
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      console.error("Error al agregar el producto:", error);
      toast.dismiss();
      
      // Si el error es de autenticación, redirigir al login
      if (error.message.includes('Token') || error.message.includes('autenticación')) {
        toast.error("Sesión expirada. Por favor, inicie sesión nuevamente.");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      
      toast.error(error.message || "Error al agregar el producto.");
    }
  };
  
  const handleOpenSizeModal = () => {
    setIsSizeModalOpen(true);
  };

  const handleAddSizes = () => {
    const newTallas = selectedSizes.map(size => ({
      talla: size,
      precioTalla: parseFloat(sizePrices[size]) || 0 // Ensure the price is a number
    }));

    // Check if newTallas is valid before adding
    const isValid = newTallas.every(talla => typeof talla.talla === 'string' && !isNaN(talla.precioTalla));
    
    if (isValid) {
      setProduct(prev => ({
        ...prev,
        tallas: [...prev.tallas, ...newTallas] // Add selected sizes
      }));
      
      setSelectedSizes([]); // Reset selected sizes
      setSizePrices({}); // Reset size prices
      setIsSizeModalOpen(false); // Close the modal
    } else {
      toast.error("Las tallas deben contener 'talla' como texto y 'precioTalla' como número.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-h-screen p-6 overflow-y-auto text-black bg-white rounded-lg shadow-lg sm:w-3/4 md:w-1/2 lg:w-1/3">
        <h2 className="mb-4 text-xl">Agregar Producto</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={product.nombre}
            onChange={handleInputChange}
            required
            className="w-full p-2 mb-4 border"
          />
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            value={product.descripcion}
            onChange={handleInputChange}
            className="w-full p-2 mb-4 border"
          />
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={marcaInput}
                onChange={(e) => setMarcaInput(e.target.value)}
                placeholder="Agregar marca"
                className="flex-1 p-2 border"
              />
              <button
                type="button"
                onClick={handleAddMarca}
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.marca.map((marca, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded"
                >
                  <span>{marca}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMarca(marca)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <select
            name="categoria"
            value={product.categoria}
            onChange={handleInputChange}
            required
            className="w-full p-2 mb-4 border"
          >
            <option value="">Seleccione una categoría</option>
            {categoriasDisponibles.map((categoria, index) => (
              <option key={index} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="precio"
            placeholder="Precio en USD"
            value={product.precio}
            onChange={handleInputChange}
            required
            className="w-full p-2 mb-4 border"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 mb-4 border"
          />
          {imagePreview && (
            <div className="mb-4">
              <img
                src={imagePreview}
                alt="Previsualización"
                className="object-contain w-full h-40 mb-2 border"
              />
            </div>
          )}
          <div className="flex mb-4 space-x-2">
            <input
              type="text"
              value={tallaInput}
              onChange={(e) => setTallaInput(e.target.value)}
              placeholder="Talla"
              className="w-1/2 p-2 border"
            />
            <input
              type="number"
              value={precioTalla}
              onChange={(e) => setPrecioTalla(e.target.value)}
              placeholder="Precio Talla"
              className="w-1/2 p-2 border"
            />
            <button
              type="button"
              onClick={handleAddTalla}
              className="px-4 py-2 text-white bg-blue-500 rounded"
            >
              Agregar Talla
            </button>
          </div>
          <ul className="mb-4">
            {Array.isArray(product.tallas) && product.tallas.map((talla, index) => (
              <li key={index} className="flex items-center justify-between">
                Talla {talla.talla}: ${talla.precioTalla}
                <button
                  type="button"
                  onClick={() => handleRemoveTalla(index)}
                  className="px-4 py-2 text-white bg-red-500 rounded"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-col mb-4 sm:flex-row sm:space-x-2">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="Agregar Color"
              className="w-full p-2 mb-2 border sm:mb-0 sm:w-1/4"
            />
            <button type="button" onClick={handleAddColor} className="px-4 py-2 mt-2 text-white bg-blue-500 rounded sm:mt-0">Agregar Color</button>
          </div>
          <div className="mb-4">
            <h3>Colores:</h3>
            {product.colores.map((color, index) => (
              <div key={index} className="flex items-center justify-between">
                {color.color}
                <button
                  type="button"
                  onClick={() => setProduct((prev) => ({
                    ...prev,
                    colores: prev.colores.filter((_, i) => i !== index)
                  }))}
                  className="px-4 py-2 text-white bg-red-500 rounded">
                  Eliminar
                </button>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="encargo"
                checked={product.encargo}
                onChange={handleInputChange}
                className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="encargo"
                className="ml-2 text-sm font-medium text-gray-900"
              >
                Encargo
              </label>
            </div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="destacado"
                checked={product.destacado}
                onChange={handleInputChange}
                className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="destacado"
                className="ml-2 text-sm font-medium text-gray-900"
              >
                Destacado
              </label>
            </div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="destacado_zapatillas"
                checked={product.destacado_zapatillas}
                onChange={handleInputChange}
                className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="destacado_zapatillas"
                className="ml-2 text-sm font-medium text-gray-900"
              >
                Destacado Zapatillas
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 mr-2 text-white bg-red-500 rounded">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded">Agregar Producto</button>
          </div>
        </form>
        <button onClick={handleOpenSizeModal} className="px-4 py-2 text-white bg-blue-500 rounded">Seleccionar Tallas</button>
        <SizeSelectionModal
          isOpen={isSizeModalOpen}
          onClose={() => setIsSizeModalOpen(false)}
          selectedSizes={selectedSizes}
          setSelectedSizes={setSelectedSizes}
          sizePrices={sizePrices}
          setSizePrices={setSizePrices}
        />
        <button onClick={handleAddSizes} className="px-4 py-2 text-white bg-green-500 rounded">Agregar Tallas Seleccionadas</button>
      </div>
    </div>
  );
};

export default AddProductModal;
