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
    if (availabilityFilter && producto._id !== selectedProduct) {
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

  // Ordenar duplicados juntos cuando el filtro está activo
  if (duplicateFilter === 'nombre') {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      if (a.nombre === b.nombre) {
        return 0; // Mantener orden original si son iguales
      }
      return a.nombre.localeCompare(b.nombre);
    });
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
    <div className="p-4 sm:p-6 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Lista de Productos
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center px-4 py-3 text-white font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transform hover:scale-105"
        >
          <MdAdd className="mr-2 text-lg" />
          Agregar Producto
        </button>
      </div>

      {/* Filters Section */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Filtros y Búsqueda
        </h3>
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Todas las categorías</option>
            <option value="zapatillas">Zapatillas</option>
            <option value="ropa">Ropa</option>
            <option value="accesorios">Accesorios</option>
          </select>
          <select
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Ordenar por precio</option>
            <option value="asc">Menor a mayor</option>
            <option value="desc">Mayor a menor</option>
          </select>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Disponibilidad</option>
            <option value="inmediata">Entrega inmediata</option>
            <option value="3dias">Disponible en 5 días</option>
            <option value="20dias">Disponible en 20 días</option>
          </select>
          <select
            value={duplicateFilter}
            onChange={(e) => setDuplicateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Filtrar duplicados</option>
            <option value="nombre">Por nombre</option>
            <option value="imagen">Por imagen</option>
          </select>
          <button
            onClick={handleRemoveFilters}
            className="flex items-center justify-center px-3 py-2 text-white font-medium transition-all duration-200 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transform hover:scale-105"
          >
            <MdFilterAltOff className="mr-2" />
            Limpiar
          </button>
        </form>
      </div>

      {/* Bulk Actions Section */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {selectedProducts.length} productos seleccionados
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 text-white font-medium transition-all duration-200 bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transform hover:scale-105"
          >
            Eliminar seleccionados
          </button>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="w-full">
          <div className="min-w-full">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-2 py-3 border-b border-gray-200 dark:border-gray-700 w-8">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === currentProducts.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </th>
                  <th className="px-1 py-3 text-xs font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 w-8">#</th>
                  <th className="px-2 py-3 text-xs font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 w-1/6">Nombre</th>
                  <th className="px-2 py-3 text-xs font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 w-1/6 max-w-0">Descripción</th>
                  <th className="px-2 py-3 text-xs font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 w-16">Marca</th>
                  <th className="px-2 py-3 text-xs font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 w-20">Cat.</th>
                  <th className="px-2 py-3 text-xs font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 w-24">Precios</th>
                  <th className="px-2 py-3 text-xs font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 w-16">Tallas</th>
                  <th className="px-2 py-3 text-xs font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 w-16">Colores</th>
                  <th className="px-2 py-3 text-xs font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 w-12">Img</th>
                  <th className="px-2 py-3 text-xs font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 w-12">Dest.</th>
                  <th className="px-2 py-3 text-xs font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 w-12">DestZ</th>
                  <th className="px-2 py-3 text-xs font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 w-12">Enc.</th>
                  <th className="px-2 py-3 text-xs font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-bg">
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
        </div>
      </div>

      {/* Pagination Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4">
        {/* Pagination Controls */}
        <div className="flex items-center justify-center sm:justify-start gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-600 dark:text-gray-400 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Página anterior"
          >
            <MdChevronLeft size={20} />
          </button>

          {currentPage > 2 && (
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Ir a página 1"
            >
              1
            </button>
          )}

          {currentPage > 3 && (
            <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
          )}

          {currentPage > 1 && (
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Ir a página ${currentPage - 1}`}
            >
              {currentPage - 1}
            </button>
          )}

          <button className="px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg">
            {currentPage}
          </button>

          {currentPage < totalPages && (
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Ir a página ${currentPage + 1}`}
            >
              {currentPage + 1}
            </button>
          )}

          {currentPage < totalPages - 2 && (
            <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
          )}

          {currentPage < totalPages - 1 && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Ir a página ${totalPages}`}
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-600 dark:text-gray-400 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Página siguiente"
          >
            <MdChevronRight size={20} />
          </button>
        </div>

        {/* Page Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-right">
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
