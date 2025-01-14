import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import useStore from '../store/store';

const AddProductModal = ({ isOpen, onClose }) => {
  const [product, setProduct] = useState({
    nombre: '',
    descripcion: '',
    marca: '',
    categoria: '',
    precio: '',
    tallas: {},
    colores: [],
    image: null,
    encargo: false,
    destacado: false,
    destacado_zapatillas: false,
  });

  const { addProduct, productAdded } = useStore();
  const [tallaInput, setTallaInput] = useState('');
  const [cantidadTalla, setCantidadTalla] = useState('');
  const [colorInput, setColorInput] = useState('');

  const [imagePreview, setImagePreview] = useState(null);

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
    if (tallaInput && cantidadTalla) {
      setProduct((prev) => ({
        ...prev,
        tallas: {
          ...prev.tallas,
          [tallaInput]: parseInt(cantidadTalla, 10),
        },
      }));
      setTallaInput('');
      setCantidadTalla('');
    }
  };

  const handleRemoveTalla = (tallaToRemove) => {
    const updatedTallas = { ...product.tallas };
    delete updatedTallas[tallaToRemove];
    setProduct((prevProduct) => ({
      ...prevProduct,
      tallas: updatedTallas,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productoAEnviar = {
      nombre: product.nombre,
      descripcion: product.descripcion,
      marca: product.marca,
      categoria: product.categoria,
      precio: parseFloat(product.precio),
      tallas: product.tallas,
      colores: product.colores,
      encargo: product.encargo,
      destacado: product.destacado,
      destacado_zapatillas: product.destacado_zapatillas,
    };

    const imageFile = product.image;

    try {
      await addProduct(productoAEnviar, imageFile);
      toast.success("Producto agregado exitosamente!");
      onClose();
    } catch (error) {
      toast.error("Error al agregar el producto.");
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
          <input
            type="text"
            name="marca"
            placeholder="Marca"
            value={product.marca}
            onChange={handleInputChange}
            required
            className="w-full p-2 mb-4 border"
          />
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
          <div className="flex flex-col mb-4 sm:flex-row sm:space-x-2">
            <input
              type="text"
              value={tallaInput}
              onChange={(e) => setTallaInput(e.target.value)}
              placeholder="Agregar Talla"
              className="w-full p-2 mb-2 border sm:mb-0 sm:w-1/4"
            />
            <input
              type="number"
              value={cantidadTalla}
              onChange={(e) => setCantidadTalla(e.target.value)}
              placeholder="Cantidad"
              className="w-full p-2 mb-2 border sm:mb-0 sm:w-1/4"
            />
            <button type="button" onClick={handleAddTalla} className="px-4 py-2 mt-2 text-white bg-blue-500 rounded sm:mt-0">Agregar Talla</button>
          </div>
          <ul className="mb-4">
            {Object.entries(product.tallas).map(([talla, cantidad], index) => (
              <li key={index} className="flex items-center justify-between">
                Talla {talla}: {cantidad} unidades
                <button
                  type="button"
                  onClick={() => handleRemoveTalla(talla)}
                  className="px-4 py-2 text-white bg-red-500 rounded">
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
      </div>
    </div>
  );
};

export default AddProductModal;
