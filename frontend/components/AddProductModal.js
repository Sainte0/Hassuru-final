import React, { useState } from 'react';
import toast from 'react-hot-toast';

const AddProductModal = ({ isOpen, onClose }) => {
  const [product, setProduct] = useState({
    nombre: '',
    descripcion: '',
    marca: '',
    categoria: '',
    tallas: [],
    colores: [],
    image: null,
    encargo: false,
    destacado: false,
    destacado_zapatillas: false,
  });

  const [tallaInput, setTallaInput] = useState('');
  const [cantidadTalla, setCantidadTalla] = useState('');
  const [precioTalla, setPrecioTalla] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const categoriasDisponibles = ['ropa', 'zapatillas', 'accesorios'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setProduct((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddTalla = () => {
    if (tallaInput && cantidadTalla && precioTalla) {
      setProduct((prev) => ({
        ...prev,
        tallas: [
          ...prev.tallas,
          {
            talla: tallaInput,
            cantidad: parseInt(cantidadTalla, 10),
            precio: parseFloat(precioTalla),
          },
        ],
      }));
      setTallaInput('');
      setCantidadTalla('');
      setPrecioTalla('');
    } else {
      toast.error('Por favor, completa todos los campos de talla, cantidad y precio.');
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
        colores: [...prev.colores, colorInput],
      }));
      setColorInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nombre, descripcion, marca, categoria, tallas, colores, image, encargo, destacado, destacado_zapatillas } = product;

    if (!nombre || !marca || !categoria || !tallas.length) {
      toast.error('Completa todos los campos requeridos.');
      return;
    }

    try {
      // Simulación de envío
      console.log({ nombre, descripcion, marca, categoria, tallas, colores, image, encargo, destacado, destacado_zapatillas });
      toast.success('Producto agregado exitosamente.');
      onClose();
    } catch (error) {
      toast.error('Error al agregar el producto.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-h-screen p-6 overflow-y-auto text-black bg-white rounded-lg shadow-lg sm:w-3/4 md:w-1/2 lg:w-1/3">
        <h2 className="mb-4 text-xl">Agregar Producto</h2>
        <form onSubmit={handleSubmit}>
          {/* Campos generales */}
          <input type="text" name="nombre" placeholder="Nombre" value={product.nombre} onChange={handleInputChange} required className="w-full p-2 mb-4 border" />
          <input type="text" name="descripcion" placeholder="Descripción" value={product.descripcion} onChange={handleInputChange} className="w-full p-2 mb-4 border" />
          <input type="text" name="marca" placeholder="Marca" value={product.marca} onChange={handleInputChange} required className="w-full p-2 mb-4 border" />
          <select name="categoria" value={product.categoria} onChange={handleInputChange} required className="w-full p-2 mb-4 border">
            <option value="">Seleccione una categoría</option>
            {categoriasDisponibles.map((categoria, index) => (
              <option key={index} value={categoria}>{categoria}</option>
            ))}
          </select>

          {/* Tallas */}
          <div className="flex flex-col mb-4">
            <input type="text" value={tallaInput} onChange={(e) => setTallaInput(e.target.value)} placeholder="Talla" className="p-2 mb-2 border" />
            <input type="number" value={cantidadTalla} onChange={(e) => setCantidadTalla(e.target.value)} placeholder="Cantidad" className="p-2 mb-2 border" />
            <input type="number" value={precioTalla} onChange={(e) => setPrecioTalla(e.target.value)} placeholder="Precio" className="p-2 mb-2 border" />
            <button type="button" onClick={handleAddTalla} className="px-4 py-2 mt-2 text-white bg-blue-500 rounded">
              Agregar Talla
            </button>
          </div>

          <ul className="mb-4">
            {product.tallas.map((talla, index) => (
              <li key={index} className="flex items-center justify-between">
                Talla {talla.talla}: {talla.cantidad} unidades - ${talla.precio.toFixed(2)}
                <button type="button" onClick={() => handleRemoveTalla(index)} className="px-4 py-2 text-white bg-red-500 rounded">Eliminar</button>
              </li>
            ))}
          </ul>

          {/* Colores */}
          <div className="flex flex-col mb-4">
            <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)} placeholder="Agregar Color" className="p-2 mb-2 border" />
            <button type="button" onClick={handleAddColor} className="px-4 py-2 mt-2 text-white bg-blue-500 rounded">Agregar Color</button>
          </div>

          {/* Imagen */}
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 mb-4 border" />
          {imagePreview && <img src={imagePreview} alt="Previsualización" className="object-contain w-full h-40 mb-4 border" />}

          {/* Acciones */}
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
