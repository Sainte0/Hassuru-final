import React, { useState, useEffect, useRef } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoAddCircleOutline } from "react-icons/io5";
import { toast } from "react-hot-toast";
import useStore from "../store/store";
import Image from "next/image";
import SizeSelectionModal from './SizeSelectionModal';
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/router";

const URL1 = process.env.NEXT_PUBLIC_URL || 'https://web-production-73e61.up.railway.app';

const ProductRow = ({
  producto,
  index,
  selectedProduct,
  handleProductSelect,
  editableProducts,
  setEditableProducts,
  fetchProducts,
  setSelectedProduct,
  isSelected,
  onSelect
}) => {
  const [newTalla, setNewTalla] = useState("");
  const [newStock, setNewStock] = useState(0);
  const [newColor, setNewColor] = useState("");
  const { dolarBlue, fetchDolarBlue, productAdded } = useStore();
  const [newImage, setNewImage] = useState(null);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sizePrices, setSizePrices] = useState({});
  const { checkAuth } = useAuth();
  const router = useRouter();
  const hasFetchedRef = useRef(false);
  const [newMarca, setNewMarca] = useState("");
  const [originalProduct, setOriginalProduct] = useState(null);

  useEffect(() => {
    fetchDolarBlue();
  }, [fetchDolarBlue]);

  // Guardar el producto original cuando se inicia la edición
  useEffect(() => {
    if (selectedProduct === producto._id && !originalProduct) {
      setOriginalProduct({ ...producto });
    } else if (selectedProduct !== producto._id && originalProduct) {
      setOriginalProduct(null);
    }
  }, [selectedProduct, producto._id, originalProduct]);

  useEffect(() => {
    if (producto && producto.image) {
      if (typeof producto.image === 'string' && producto.image.includes('cloudinary')) {
        setNewImage(producto.image);
      } else {
        const timestamp = new Date().getTime();
        setNewImage(`${URL1}/api/productos/${producto._id}/image?t=${timestamp}`);
      }
    }
  }, [producto]);

  useEffect(() => {
    if (producto && typeof producto.marca === 'string') {
      const marcas = producto.marca.split(',').map(m => m.trim()).filter(Boolean);
      const updatedProduct = { ...producto, marca: marcas };
      setEditableProducts(prevProducts =>
        prevProducts.map(prod =>
          prod._id === producto._id ? updatedProduct : prod
        )
      );
    }
  }, [producto]);

  const handleTallaChange = (e, tallaIndex) => {
    const { value } = e.target;
    const updatedProduct = {
      ...producto,
      tallas: producto.tallas.map((talla, index) =>
        index === tallaIndex
          ? { ...talla, talla: value }
          : talla
      ),
    };
    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };

  const handleAddTalla = () => {
    if (newTalla && parseFloat(newStock) > 0) {
      const updatedProduct = {
        ...producto,
        tallas: [...producto.tallas, { talla: newTalla, precioTalla: parseFloat(newStock) }],
      };
      setEditableProducts((prevProducts) =>
        prevProducts.map((prod) =>
          prod._id === producto._id ? updatedProduct : prod
        )
      );
      setNewTalla("");
      setNewStock("");
    } else {
      alert("Por favor ingresa un nombre de talla válido y precio de la Talla.");
    }
  };

  const handleDeleteTalla = (tallaIndex) => {
    const updatedProduct = {
      ...producto,
      tallas: producto.tallas.filter((_, index) => index !== tallaIndex),
    };
    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };

  const handleColorChange = (e, colorIndex) => {
    const updatedProduct = {
      ...producto,
      colores: producto.colores.map((color, index) =>
        index === colorIndex ? { ...color, color: e.target.value } : color
      ),
    };

    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };


  const handleAddColor = () => {
    if (newColor.trim()) {
      const updatedProduct = {
        ...producto,
        colores: [...producto.colores, { color: newColor.trim() }],
      };

      setEditableProducts((prevProducts) =>
        prevProducts.map((prod) =>
          prod._id === producto._id ? updatedProduct : prod
        )
      );

      setNewColor(""); // Limpiar el campo de entrada
    } else {
      alert("Por favor ingresa un color válido.");
    }
  };

  const handleDeleteColor = (colorIndex) => {
    const updatedProduct = {
      ...producto,
      colores: producto.colores.filter((_, index) => index !== colorIndex),
    };

    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };


  const handleProductUpdate = async (producto) => {
    try {
      toast.loading("Actualizando producto...");
      // Enviar las marcas como array
      const updatedProduct = { 
        ...producto, 
        marca: Array.isArray(producto.marca) ? producto.marca : [producto.marca]
      };
      // Enviar la actualización al servidor
      const response = await fetch(`${URL1}/api/productos/${producto._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedProduct),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el producto");
      }
      const updatedProductData = await response.json();
      setEditableProducts(prevProducts =>
        prevProducts.map(prod =>
          prod._id === producto._id ? updatedProductData : prod
        )
      );
      fetchProducts();
      setSelectedProduct(null);
      setOriginalProduct(null);
      toast.dismiss();
      toast.success("Producto actualizado con éxito");
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      toast.dismiss();
      toast.error(error.message);
    }
  };
  const handleProductDelete = async () => {
    if (!await checkAuth()) {
      return;
    }

    try {
      const response = await fetch(`${URL1}/api/productos/${producto._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      toast.success("Producto eliminado con éxito");
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    }
  };
  

  const handleProductChange = (e, field, producto) => {
    const updatedProduct = { ...producto, [field]: e.target.value };
    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };

  const handleCancelEdit = () => {
    if (originalProduct) {
      // Restaurar el producto a su estado original
      setEditableProducts((prevProducts) =>
        prevProducts.map((prod) =>
          prod._id === producto._id ? { ...originalProduct } : prod
        )
      );
    }
    setSelectedProduct(null);
    setOriginalProduct(null);
  };


  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen válido');
      return;
    }



    try {
      // Mostrar un mensaje de carga
      toast.loading('Actualizando imagen...');

      const formData = new FormData();
      formData.append('image', file);

      // Enviar la imagen al servidor
      const response = await fetch(`${URL1}/api/productos/${producto._id}/image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la imagen');
      }

      // Obtener el producto actualizado
      const updatedProduct = await response.json();
      
      // Actualizar el estado local con el producto actualizado
      setEditableProducts(prevProducts =>
        prevProducts.map(prod =>
          prod._id === producto._id ? updatedProduct : prod
        )
      );

      // Forzar una actualización de la imagen en la interfaz
      const timestamp = new Date().getTime();
      setNewImage(`${URL1}/api/productos/${producto._id}/image?t=${timestamp}`);

      // Actualizar la lista de productos
      fetchProducts();

      // Mostrar mensaje de éxito
      toast.dismiss();
      toast.success('Imagen actualizada con éxito');
    } catch (error) {
      console.error('Error:', error);
      toast.dismiss();
      toast.error(error.message);
    }
  };

  const getImageUrl = (product) => {
    // Si no hay imagen, devolver una imagen por defecto
    if (!product || !product.image) return "/placeholder.jpg";
    
    // Si la imagen es una URL de Cloudinary, usarla directamente
    if (typeof product.image === 'string' && product.image.includes('cloudinary')) {
      return product.image;
    }
    
    // Si la imagen es un objeto con data (nuevo formato), usar la ruta de la API
    if (product._id) {
      const timestamp = new Date().getTime();
      return `${URL1}/api/productos/${product._id}/image?t=${timestamp}`;
    }
    
    return "/placeholder.jpg";
  };

  const handleDestacadoChange = (e) => {
    const updatedProduct = { ...producto, destacado: e.target.checked };
    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };

  const handleDestacadoZapatillasChange = (e) => {
    const updatedProduct = { ...producto, destacado_zapatillas: e.target.checked };
    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };

  const handleEncargoChange = (e) => {
    const updatedProduct = { ...producto, encargo: e.target.checked };
    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };

  const handleOpenSizeModal = () => {
    setSelectedSizes(producto.tallas.map(t => t.talla));
    const prices = {};
    producto.tallas.forEach(talla => {
      prices[talla.talla] = talla.precioTalla;
    });
    setSizePrices(prices);
    setIsSizeModalOpen(true);
  };

  const handleUpdateSizes = () => {
    const newTallas = selectedSizes.map(size => ({
      talla: size,
      precioTalla: parseFloat(sizePrices[size]) || 0
    }));

    setEditableProducts(prevProducts => 
      prevProducts.map(prod => 
        prod._id === producto._id ? { ...prod, tallas: newTallas } : prod
      )
    );

    setSelectedSizes([]);
    setSizePrices({});
    setIsSizeModalOpen(false);
  };

  const handleAddMarca = (producto) => {
    if (newMarca) {
      const marcasActuales = Array.isArray(producto.marca) ? producto.marca : (producto.marca ? [producto.marca] : []);
      const marcasUnicas = Array.from(new Set([...marcasActuales, newMarca.trim()]));
      const updatedProduct = {
        ...producto,
        marca: marcasUnicas,
      };
      setEditableProducts(prevProducts =>
        prevProducts.map(prod =>
          prod._id === producto._id ? updatedProduct : prod
        )
      );
      setNewMarca('');
    }
  };

  const handleRemoveMarca = (producto, marcaToRemove) => {
    const updatedProduct = {
      ...producto,
      marca: Array.isArray(producto.marca) 
        ? producto.marca.filter((marca) => marca !== marcaToRemove)
        : [],
    };
    handleProductChange({ target: { value: updatedProduct.marca } }, "marca", updatedProduct);
  };

  return (
    <tr className={`border-b border-gray-200 dark:border-gray-700 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
      <td className="px-2 py-2 border border-gray-200 dark:border-gray-700">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
        />
      </td>
      <td className="px-1 py-2 text-xs text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
        {index}
      </td>
      <td className="px-2 py-2 border border-gray-200 dark:border-gray-700">
        {selectedProduct === producto._id ? (
          <input
            type="text"
            value={producto.nombre}
            onChange={(e) => handleProductChange(e, "nombre", producto)}
            className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        ) : (
          <span className="text-xs text-gray-900 dark:text-gray-100 truncate block">{producto.nombre}</span>
        )}
      </td>
      <td className="px-2 py-2 border border-gray-200 dark:border-gray-700 max-w-0">
        {selectedProduct === producto._id ? (
          <input
            type="text"
            value={producto.descripcion}
            onChange={(e) => handleProductChange(e, "descripcion", producto)}
            className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        ) : (
          <div className="max-w-full">
            <span className="text-xs text-gray-900 dark:text-gray-100 truncate block w-full" title={producto.descripcion}>
              {producto.descripcion}
            </span>
          </div>
        )}
      </td>
      <td className="px-2 py-2 border border-gray-200 dark:border-gray-700">
        {selectedProduct === producto._id ? (
          <div>
            <div className="grid grid-cols-3 gap-1 mb-1">
              <input
                type="text"
                value={newMarca}
                onChange={e => setNewMarca(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMarca(producto);
                  }
                }}
                placeholder="Marca"
                className="col-span-2 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={() => handleAddMarca(producto)}
                className="px-1 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
              {Array.isArray(producto.marca) && producto.marca.map((marca, index) => (
                <div key={index} className="flex items-center gap-1 px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                  <span className="text-gray-900 dark:text-gray-100 truncate max-w-16">{marca}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMarca(producto, marca)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
            {Array.isArray(producto.marca) && producto.marca.map((marca, index) => (
              <div key={index} className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                <span className="text-gray-900 dark:text-gray-100 truncate max-w-16">{marca}</span>
              </div>
            ))}
          </div>
        )}
      </td>
      <td className="px-2 py-2 border border-gray-200 dark:border-gray-700">
        {selectedProduct === producto._id ? (
          <select
            value={producto.categoria}
            onChange={(e) => handleProductChange(e, "categoria", producto)}
            className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="zapatillas">Zapatillas</option>
            <option value="ropa">Ropa</option>
            <option value="accesorios">Accesorios</option>
          </select>
        ) : (
          <span className="text-xs text-gray-900 dark:text-gray-100">{producto.categoria}</span>
        )}
      </td>
      <td className="px-2 py-2 border border-gray-200 dark:border-gray-700">
        {selectedProduct === producto._id ? (
          <input
            type="number"
            value={producto.precio}
            onChange={(e) => handleProductChange(e, "precio", producto)}
            className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        ) : (
          <div className="text-xs text-gray-900 dark:text-gray-100">
            <p>${producto.precio}</p>
            <p className="text-gray-600 dark:text-gray-400">${Math.round(producto.precio * dolarBlue).toLocaleString('es-AR')} ARS</p>
          </div>
        )}
      </td>
      <td className="px-2 py-2 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-1">
          {producto.tallas.slice(0, 3).map((talla, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="text-xs text-gray-900 dark:text-gray-100">{talla.talla}</span>
              {selectedProduct === producto._id && (
                <button
                  onClick={() => handleDeleteTalla(index)}
                  className="p-0.5 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                >
                  <RiDeleteBin5Line size={12} />
                </button>
              )}
            </div>
          ))}
          {producto.tallas.length > 3 && (
            <span className="text-xs text-gray-500">+{producto.tallas.length - 3} más</span>
          )}
          {selectedProduct === producto._id && (
            <>
              <div className="grid grid-cols-3 gap-1 mb-1">
                <input
                  type="text"
                  value={newTalla}
                  onChange={(e) => setNewTalla(e.target.value)}
                  placeholder="Talla"
                  className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder="Precio"
                  className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={handleAddTalla}
                  className="p-1 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                >
                  <IoAddCircleOutline size={12} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={handleOpenSizeModal}
                  className="px-1 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  Seleccionar
                </button>
                <button
                  type="button"
                  onClick={handleUpdateSizes}
                  className="px-1 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
              <SizeSelectionModal
                isOpen={isSizeModalOpen}
                onClose={() => setIsSizeModalOpen(false)}
                selectedSizes={selectedSizes}
                setSelectedSizes={setSelectedSizes}
                sizePrices={sizePrices}
                setSizePrices={setSizePrices}
              />
            </>
          )}
        </div>
      </td>
      <td className="px-2 py-2 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-1">
          {producto.colores.slice(0, 3).map((color, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="text-xs text-gray-900 dark:text-gray-100">{color.color}</span>
              {selectedProduct === producto._id && (
                <button
                  onClick={() => handleDeleteColor(index)}
                  className="p-0.5 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                >
                  <RiDeleteBin5Line size={12} />
                </button>
              )}
            </div>
          ))}
          {producto.colores.length > 3 && (
            <span className="text-xs text-gray-500">+{producto.colores.length - 3} más</span>
          )}
          {selectedProduct === producto._id && (
            <div className="grid grid-cols-3 gap-1">
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="Color"
                className="col-span-2 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={handleAddColor}
                className="p-1 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
              >
                <IoAddCircleOutline size={12} />
              </button>
            </div>
          )}
        </div>
      </td>
      <td className="px-2 py-2 border border-gray-200 dark:border-gray-700">
        <div className="relative w-12 h-12">
          <Image
            src={newImage || getImageUrl(producto)}
            alt={producto.nombre}
            width={48}
            height={48}
            className="object-cover w-full h-full rounded border border-gray-300 dark:border-gray-600"
            unoptimized={true}
          />
          {selectedProduct === producto._id && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <span className="text-white text-xs">Cambiar</span>
              </label>
            </div>
          )}
        </div>
      </td>
      <td className="px-2 py-2 border border-gray-200 dark:border-gray-700">
        {selectedProduct === producto._id ? (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={producto.destacado}
              onChange={handleDestacadoChange}
              className="mr-1 w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-xs text-gray-900 dark:text-gray-100">Sí</span>
          </label>
        ) : (
          <span className={`inline-block px-1 py-0.5 text-xs rounded ${
            producto.destacado 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {producto.destacado ? 'Sí' : 'No'}
          </span>
        )}
      </td>
      <td className="px-2 py-2 border border-gray-200 dark:border-gray-700">
        {selectedProduct === producto._id ? (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={producto.destacado_zapatillas}
              onChange={handleDestacadoZapatillasChange}
              className="mr-1 w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-xs text-gray-900 dark:text-gray-100">Sí</span>
          </label>
        ) : (
          <span className={`inline-block px-1 py-0.5 text-xs rounded ${
            producto.destacado_zapatillas 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {producto.destacado_zapatillas ? 'Sí' : 'No'}
          </span>
        )}
      </td>
      <td className="px-2 py-2 border border-gray-200 dark:border-gray-700">
        {selectedProduct === producto._id ? (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={producto.encargo}
              onChange={handleEncargoChange}
              className="mr-1 w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-xs text-gray-900 dark:text-gray-100">Sí</span>
          </label>
        ) : (
          <span className={`inline-block px-1 py-0.5 text-xs rounded ${
            producto.encargo 
              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {producto.encargo ? 'Sí' : 'No'}
          </span>
        )}
      </td>
      <td className="px-2 py-2 text-center border border-gray-200 dark:border-gray-700">
        {selectedProduct === producto._id ? (
          <div className="space-y-1">
            <button
              onClick={() => handleProductUpdate(producto)}
              className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
              aria-label="Guardar cambios del producto"
            >
              Guardar
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-1 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
              aria-label="Cancelar edición"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleProductSelect(producto._id)}
            className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
            aria-label="Editar producto"
          >
            Editar
          </button>
        )}
        <button
          onClick={handleProductDelete}
          className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
          aria-label="Eliminar producto"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
};

export default ProductRow;
