import React, { useState } from "react";
import ProductRow from "./ProductRow";
import { MdFilterAltOff } from "react-icons/md";
import { MdAdd } from "react-icons/md";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import AddProductModal from './AddProductModal';
import useStore from "../store/store";

const ProductList = ({ editableProducts, setEditableProducts, selectedProduct, setSelectedProduct, fetchProducts, fetchProductsFiltered }) => {
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [encargoFilter, setEncargoFilter] = useState(false);
  const [priceSort, setPriceSort] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [duplicateFilter, setDuplicateFilter] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { dolarBlue } = useStore();
  const [isModalOpen, setModalOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  const handleProductSelect = (id) => {
    setSelectedProduct(id);
  };

  const handleMultipleSelect = (id) => {
    setSelectedProducts(prev => {
      if (prev.includes(id)) {
        return prev.filter(productId => productId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentProducts.map(product => product._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`¿Estás seguro de que deseas eliminar ${selectedProducts.length} productos?`)) {
      try {
        const token = localStorage.getItem("token");
        const deletePromises = selectedProducts.map(id =>
          fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        );
        
        await Promise.all(deletePromises);
        setSelectedProducts([]);
        fetchProducts();
      } catch (error) {
        console.error('Error al eliminar productos:', error);
      }
    }
  };

  const handleRemoveFilters = () => {
    setCategoriaFilter("");
    setNameFilter("");
    setEncargoFilter(false);
    setPriceSort("");
    setAvailabilityFilter("");
    setDuplicateFilter("");
    fetchProducts();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (typeof fetchProducts === 'function') {
      fetchProducts();
    }
  };

  // Filtrar productos
  let filteredProducts = editableProducts.filter((producto) => {
    const nameMatch = producto.nombre.toLowerCase().includes(nameFilter.toLowerCase());
    const categoryMatch = categoriaFilter ? producto.categoria === categoriaFilter : true;
    const encargoMatch = encargoFilter ? producto.encargo === true : true;
    
    // Filtro de disponibilidad
    let availabilityMatch = true;
    if (availabilityFilter) {
      const hasTallas = producto.tallas && producto.tallas.length > 0;
      if (availabilityFilter === 'inmediata' && (!hasTallas || producto.encargo)) availabilityMatch = false;
      if (availabilityFilter === '3dias' && (!hasTallas || !producto.encargo)) availabilityMatch = false;
      if (availabilityFilter === '20dias' && hasTallas) availabilityMatch = false;
    }
    
    // Filtro de duplicados
    let duplicateMatch = true;
    if (duplicateFilter) {
      const duplicates = editableProducts.filter(p => 
        p._id !== producto._id && 
        ((duplicateFilter === 'nombre' && p.nombre === producto.nombre) ||
         (duplicateFilter === 'imagen' && p.image && producto.image && 
          p.image.url === producto.image.url))
      );
      duplicateMatch = duplicates.length > 0;
    }
    
    return nameMatch && categoryMatch && encargoMatch && availabilityMatch && duplicateMatch;
  });

  // Ordenar productos por precio
  if (priceSort === "asc") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.precio - b.precio);
  } else if (priceSort === "desc") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.precio - a.precio);
  }

  // Pagination calculations
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [categoriaFilter, nameFilter, encargoFilter, priceSort, availabilityFilter, duplicateFilter]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-xl font-semibold text-black">Lista de Productos</h2>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center p-3 mb-4 text-white transition duration-200 bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 lg:hidden"
      >
        <MdAdd className="mr-2" />
        Agregar Producto
      </button>

      {/* Filtros */}
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col items-center gap-4 mb-6 sm:flex-row">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="w-full p-2 border rounded sm:w-auto"
        />
        <select
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
          className="w-full p-2 border rounded sm:w-auto"
        >
          <option value="">Seleccione una categoría</option>
          <option value="zapatillas">Zapatillas</option>
          <option value="ropa">Ropa</option>
          <option value="accesorios">Accesorios</option>
        </select>
        <select
          value={priceSort}
          onChange={(e) => setPriceSort(e.target.value)}
          className="w-full p-2 border rounded sm:w-auto"
        >
          <option value="">Ordenar por precio</option>
          <option value="asc">Menor a mayor</option>
          <option value="desc">Mayor a menor</option>
        </select>
        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="w-full p-2 border rounded sm:w-auto"
        >
          <option value="">Disponibilidad</option>
          <option value="inmediata">Entrega inmediata</option>
          <option value="3dias">Disponible en 3 días</option>
          <option value="20dias">Disponible en 20 días</option>
        </select>
        <select
          value={duplicateFilter}
          onChange={(e) => setDuplicateFilter(e.target.value)}
          className="w-full p-2 border rounded sm:w-auto"
        >
          <option value="">Filtrar duplicados</option>
          <option value="nombre">Por nombre</option>
          <option value="imagen">Por imagen</option>
        </select>
        <button
          onClick={handleRemoveFilters}
          className="flex items-center p-2 text-white transition duration-200 bg-gray-500 rounded hover:bg-gray-600"
        >
          <MdFilterAltOff className="mr-2" />
          Limpiar filtros
        </button>
      </form>

      {/* Acciones en lote */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-600">
            {selectedProducts.length} productos seleccionados
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 text-white transition duration-200 bg-red-500 rounded hover:bg-red-600"
          >
            Eliminar seleccionados
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead className="text-base">
            <tr className="text-gray-700 bg-gray-100">
              <th className="px-2 py-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === currentProducts.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-2 py-2">#</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Marca</th>
              <th className="px-4 py-2">Categoría</th>
              <th className="px-4 py-2">Precios (USD/AR)</th>
              <th className="px-4 py-2">Tallas</th>
              <th className="px-4 py-2">Colores</th>
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Destacado</th>
              <th className="px-4 py-2">Destacado Z</th>
              <th className="px-4 py-2">Encargo</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((producto, index) => (
              <ProductRow
                key={producto._id}
                producto={producto}
                index={indexOfFirstProduct + index + 1}
                selectedProduct={selectedProduct}
                handleProductSelect={handleProductSelect}
                setEditableProducts={setEditableProducts}
                fetchProducts={fetchProducts}
                editableProducts={editableProducts}
                setSelectedProduct={setSelectedProduct}
                isSelected={selectedProducts.includes(producto._id)}
                onSelect={() => handleMultipleSelect(producto._id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-600 transition-colors duration-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdChevronLeft size={24} />
          </button>

          {currentPage > 2 && (
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              1
            </button>
          )}

          {currentPage > 3 && <span>...</span>}

          {currentPage > 1 && (
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {currentPage - 1}
            </button>
          )}

          <button
            className="px-3 py-1 text-white bg-blue-500 rounded"
          >
            {currentPage}
          </button>

          {currentPage < totalPages && (
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {currentPage + 1}
            </button>
          )}

          {currentPage < totalPages - 2 && <span>...</span>}

          {currentPage < totalPages - 1 && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-600 transition-colors duration-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdChevronRight size={24} />
          </button>
        </div>

        {/* Page info */}
        <div className="text-sm text-gray-600">
          Mostrando {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} de {filteredProducts.length} productos
        </div>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        fetchProducts={fetchProducts}
      />
    </div>
  );
};

export default ProductList;
