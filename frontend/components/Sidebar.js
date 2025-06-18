import React, { useState } from "react";
import AddProductModal from './AddProductModal';

const Sidebar = ({ categoriasDisponibles }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <aside className="flex-col justify-between hidden w-64 text-white bg-gray-800 lg:flex">
      <div className="p-6">
        <h1 className="mb-6 text-3xl font-bold">Dashboard Panel</h1>
        <ul>
          <li className="mb-4">
            <button
              onClick={() => setModalOpen(true)}
              className="block w-full px-4 py-2 text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600"
            >
              Agregar Producto
            </button>
          </li>
          <li>
            <a
              href="/admin/pedidos"
              className="block w-full px-4 py-2 text-white transition duration-300 bg-green-500 rounded hover:bg-green-600 text-center"
            >
              Ver pedidos
            </a>
          </li>
        </ul>
      </div>
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        categorias={categoriasDisponibles}
      />
    </aside>
  );
};

export default Sidebar;
