import React, { useState, useEffect } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoAddCircleOutline } from "react-icons/io5";
import { toast } from "react-hot-toast";
import useStore from "../store/store";
import Image from "next/image";

const URL1 = process.env.NEXT_PUBLIC_URL;

const ProductRow = ({
  producto,
  index,
  selectedProduct,
  handleProductSelect,
  editableProducts,
  setEditableProducts,
  fetchProducts,
  setSelectedProduct,
}) => {
  const [newTalla, setNewTalla] = useState("");
  const [newStock, setNewStock] = useState(0);
  const [newColor, setNewColor] = useState("");
  const { dolarBlue, fetchDolarBlue, productAdded } = useStore();
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    fetchDolarBlue();
  }, [fetchDolarBlue]);

  useEffect(() => {
    if (productAdded) {
      fetchProducts();
    }
  }, [productAdded, fetchProducts]);

  const handleTallaChange = (e, tallaIndex) => {
    const updatedProducts = [...editableProducts];
    updatedProducts[index].tallas[tallaIndex].precioTalla = parseFloat(e.target.value);
    setEditableProducts(updatedProducts);
  };

  const handleAddTalla = () => {
    if (newTalla && parseFloat(newStock) > 0) {
      const updatedProducts = [...editableProducts];
      updatedProducts[index].tallas.push({ talla: newTalla, precioTalla: parseFloat(newStock) });
      setEditableProducts(updatedProducts);
      setNewTalla("");
      setNewStock("");
    } else {
      alert(
        "Por favor ingresa un nombre de talla válido y precio de la Talla."
      );
    }
  };
  const handleDeleteTalla = (tallaIndex) => {
    const updatedProducts = [...editableProducts];
    updatedProducts[index].tallas.splice(tallaIndex, 1);
    setEditableProducts(updatedProducts);
  };

  const handleColorChange = (e, colorId) => {
    const updatedProducts = [...editableProducts];
    const colorIndex = updatedProducts[index].colores.findIndex(
      (c) => c._id === colorId
    );
    if (colorIndex !== -1) {
      updatedProducts[index].colores[colorIndex].color = e.target.value;
      setEditableProducts(updatedProducts);
    }
  };
  const handleAddColor = () => {
    if (newColor) {
      const updatedProducts = [...editableProducts];
      updatedProducts[index].colores.push({ color: newColor });
      setEditableProducts(updatedProducts);
      setNewColor("");
    } else {
      alert("Por favor ingresa un color válido.");
    }
  };
  const handleDeleteColor = (colorId) => {
    const updatedProducts = [...editableProducts];
    updatedProducts[index].colores = updatedProducts[index].colores.filter(
      (c) => c._id !== colorId
    );
    setEditableProducts(updatedProducts);
  };

  const handleProductUpdate = async (producto) => {
    const updatedProduct = {
      ...producto,
      categoria: producto.categoria.toLowerCase(), // Normaliza a minúsculas
    };    
    const formData = new FormData();
    Object.keys(updatedProduct).forEach((key) => {
      if (key !== "image") {
        formData.append(key, updatedProduct[key]);
      }
    });
    const responseData = await fetch(`${URL1}/api/productos/${producto._id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    });
    if (responseData.ok) {
      toast.success("Producto actualizado con éxito");
      if (newImage) {
        const imageFormData = new FormData();
        imageFormData.append("image", newImage);
        const imageResponse = await fetch(
          `${URL1}/api/productos/${producto._id}/image`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: imageFormData,
          }
        );
        if (imageResponse.ok) {
          toast.success("Imagen actualizada con éxito");
          await fetchProducts();
        } else {
          toast.error("Error al actualizar la imagen");
          console.error("Error al actualizar la imagen");
        }
      }
      fetchProducts();
      setSelectedProduct(null);
    } else {
      toast.error("Error al actualizar el producto");
      console.error("Error al actualizar el producto");
    }
  };

  const handleProductDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro que quieres eliminar este producto?"
    );
    if (confirmDelete) {
      const response = await fetch(`${URL1}/api/productos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        toast.success("Producto eliminado con éxito");
        fetchProducts();
      } else {
        toast.error("Error al eliminar el producto");
        console.error("Error al eliminar el producto");
      }
    }
  };

  const handleProductChange = (e, field, index) => {
    const updatedProducts = [...editableProducts];
    const newValue = e.target.value;
    if (!updatedProducts[index]) {
      console.error(`Producto en el índice ${index} no existe.`);
      return;
    }
    updatedProducts[index][field] = newValue;
    setEditableProducts(updatedProducts);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedProducts = [...editableProducts];
      updatedProducts[index].image = URL.createObjectURL(file);
      setEditableProducts(updatedProducts);
      setNewImage(file);
    }
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

  return (
    <tr className="overflow-x-auto text-gray-600">
      <td className="px-4 py-2 border">
        <input
          type="radio"
          name="selectedProduct"
          onChange={() => handleProductSelect(producto._id)}
          checked={selectedProduct === producto._id}
        />
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <input
            type="text"
            value={producto.nombre}
            onChange={(e) => handleProductChange(e, "nombre", index)}
            className="w-full p-1 border"
          />
        ) : (
          producto.nombre
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <input
            type="text"
            value={producto.descripcion}
            onChange={(e) => handleProductChange(e, "descripcion", index)}
            className="w-full p-1 border"
          />
        ) : (
          producto.descripcion
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <input
            type="text"
            value={producto.marca}
            onChange={(e) => handleProductChange(e, "marca", index)}
            className="w-full p-1 border"
          />
        ) : (
          producto.marca
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <select
            value={producto.categoria}
            onChange={(e) => handleProductChange(e, "categoria", index)}
            className="w-full p-1 border"
          >
            <option value="ropa">Ropa</option>
            <option value="accesorios">Accesorios</option>
            <option value="zapatillas">Zapatillas</option>
          </select>
        ) : (
          producto.categoria
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <div className="flex flex-col">
            <input
              type="text"
              value={producto.precio}
              onChange={(e) => handleProductChange(e, "precio", index)}
              className="w-full p-1 mb-2 border"
              placeholder="Precio en USD"
            />
            {dolarBlue ? (
              <label className="w-full p-1">
                {(producto.precio * dolarBlue).toFixed(2)} ARS
              </label>
            ) : (
              <p>Cargando cotización...</p>
            )}
          </div>
        ) : (
          <div>
            <p>{producto.precio} USD</p>
            {dolarBlue ? (
              <p>{(producto.precio * dolarBlue).toFixed(2)} ARS</p>
            ) : (
              <p>Cargando cotización...</p>
            )}
          </div>
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <div>
            {producto.tallas.map((talla, tallaIndex) => (
              <div
                key={tallaIndex}
                className="flex flex-col sm:flex-row items-center mb-2 sm:mb-1"
              >
                <input
                  type="text"
                  value={talla.talla}
                  readOnly
                  className="w-full sm:w-1/3 p-1 mb-2 sm:mb-0 sm:mr-2 border"
                />
                <input
                  type="number"
                  value={tallaObj.precioTalla}
                  onChange={(e) => handleTallaChange(e, tallaIndex)}
                  className="w-full sm:w-1/3 p-1 mb-2 sm:mb-0 sm:mr-2 border"
                  min="0"
                  placeholder="Precio"
                />
                <button
                  onClick={() => handleDeleteTalla(tallaIndex)}
                  className="px-2 py-1 mt-2 sm:mt-0 ml-0 sm:ml-2 text-white bg-red-500 rounded"
                >
                  <RiDeleteBin5Line />
                </button>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row mt-2">
              <input
                type="text"
                value={newTalla}
                onChange={(e) => setNewTalla(e.target.value)}
                placeholder="Nueva talla"
                className="w-full sm:w-1/3 p-1 mb-2 sm:mb-0 sm:mr-2 border"
              />
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Precio"
                className="w-full sm:w-1/3 p-1 mb-2 sm:mb-0 border"
                min="0"
              />
              <button
                onClick={handleAddTalla}
                className="px-2 py-1 mt-2 sm:mt-0 ml-0 sm:ml-2 text-white bg-blue-500 rounded"
              >
                <IoAddCircleOutline />
              </button>
            </div>
          </div>
        ) : (
          <div>
            {producto.tallas.map((tallaObj, tallaIndex) => (
              <div key={tallaIndex}>
                {tallaObj.talla}: ${tallaObj.precioTalla}
              </div>
            ))}
          </div>
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <div>
            {producto.colores.map((color) => (
              <div key={color._id} className="flex items-center mb-1">
                <input
                  type="text"
                  value={color.color}
                  onChange={(e) => handleColorChange(e, color._id)}
                  className="w-1/2 p-1 border"
                />
                <button
                  onClick={() => handleDeleteColor(color._id)}
                  className="px-2 py-1 ml-2 text-white bg-red-500 rounded"
                >
                  <RiDeleteBin5Line />
                </button>
              </div>
            ))}
            <div className="mt-2">
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="Nuevo color"
                className="w-1/2 p-1 mr-2 border"
              />
              <button
                onClick={handleAddColor}
                className="px-2 py-1 mt-2 text-white bg-blue-500 rounded"
              >
                <IoAddCircleOutline />
              </button>
            </div>
          </div>
        ) : (
          <div>
            {producto.colores.map((color) => (
              <div key={color._id}>{color.color}</div>
            ))}
          </div>
        )}
      </td>
      <td className="px-4 py-2 border">
        {(producto.image || newImage) && (
          <Image
            width={300}
            height={300}
            src={newImage ? URL.createObjectURL(newImage) : producto?.image}
            alt={producto.nombre}
            className="object-cover w-16 h-16"
          />
        )}
        {selectedProduct === producto._id && (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-1 mt-2 border"
            />
          </div>
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={producto.destacado}
              onChange={handleDestacadoChange}
              className="mr-2"
            />
            Destacado
          </label>
        ) : producto.destacado ? (
          "Sí"
        ) : (
          "No"
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={producto.destacado_zapatillas}
              onChange={handleDestacadoZapatillasChange}
              className="mr-2"
            />
            Destacado Zapatillas
          </label>
        ) : producto.destacado_zapatillas ? (
          "Sí"
        ) : (
          "No"
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={producto.encargo}
              onChange={handleEncargoChange}
              className="mr-2"
            />
            Encargo
          </label>
        ) : producto.encargo ? (
          "Sí"
        ) : (
          "No"
        )}
      </td>
      <td className="px-2 py-2 text-center border">
        {selectedProduct === producto._id && (
          <div>
            <button
              onClick={() => handleProductUpdate(producto)}
              className="px-2 py-1 text-white bg-blue-500 rounded"
            >
              Guardar
            </button>
            <button
              onClick={() => setSelectedProduct(null)}
              className="px-[6px] py-1 text-white bg-red-500 rounded my-1"
            >
              Cancelar
            </button>
          </div>
        )}
        <button
          onClick={() => handleProductDelete(producto._id)}
          className="px-2 py-1 text-white bg-red-500 rounded"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
};

export default ProductRow;
