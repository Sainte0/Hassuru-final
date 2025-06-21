import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import useStore from '../store/store';

const BannersAdmin = () => {
  const { banners, fetchBannersAdmin, addBanner, updateBanner, deleteBanner, reorderBanners, loading } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    order: 0,
    active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchBannersAdmin();
  }, [fetchBannersAdmin]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBanner) {
        await updateBanner(editingBanner._id, formData, imageFile);
      } else {
        await addBanner(formData, imageFile);
      }
      
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar banner:', error);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      link: banner.link || '',
      order: banner.order,
      active: banner.active
    });
    setImagePreview(banner.imageUrl);
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este banner?')) {
      try {
        await deleteBanner(id);
      } catch (error) {
        console.error('Error al eliminar banner:', error);
      }
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await updateBanner(banner._id, { ...banner, active: !banner.active });
    } catch (error) {
      console.error('Error al cambiar estado del banner:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      link: '',
      order: 0,
      active: true
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingBanner(null);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex === dropIndex) return;

    const newBanners = [...banners];
    const draggedBanner = newBanners[dragIndex];
    newBanners.splice(dragIndex, 1);
    newBanners.splice(dropIndex, 0, draggedBanner);

    // Update order values
    const updatedBanners = newBanners.map((banner, index) => ({
      id: banner._id,
      order: index
    }));

    try {
      await reorderBanners(updatedBanners);
    } catch (error) {
      console.error('Error al reordenar banners:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Banners Promocionales</h3>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Agregar Banner
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay banners configurados. Crea el primero haciendo clic en "Agregar Banner".
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`flex items-center p-4 border rounded-lg cursor-move hover:bg-gray-50 transition-colors ${
                !banner.active ? 'opacity-60' : ''
              }`}
            >
              {/* Drag Handle */}
              <div className="mr-4 text-gray-400">
                <div className="w-6 h-6 flex items-center justify-center">
                  ⋮⋮
                </div>
              </div>

              {/* Banner Image */}
              <div className="w-20 h-16 mr-4 rounded overflow-hidden flex-shrink-0">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Banner Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{banner.title}</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    Orden: {banner.order}
                  </span>
                  {banner.active ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">
                      Activo
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                      Inactivo
                    </span>
                  )}
                </div>
                {banner.description && (
                  <p className="text-sm text-gray-600 mb-1">{banner.description}</p>
                )}
                {banner.link && (
                  <a
                    href={banner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {banner.link}
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(banner)}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  title={banner.active ? 'Desactivar' : 'Activar'}
                >
                  {banner.active ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(banner)}
                  className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Editar"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(banner._id)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  title="Eliminar"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingBanner ? 'Editar Banner' : 'Nuevo Banner'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enlace (opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen {!editingBanner && '*'}
                  </label>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!editingBanner}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="active" className="text-sm text-gray-700">
                    Banner activo
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : (editingBanner ? 'Actualizar' : 'Crear')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersAdmin; 