import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import ThemeToggle from './ThemeToggle';
import AddProductModal from './AddProductModal';
import { FaSignOutAlt, FaHome, FaBoxes, FaUsers, FaChartBar, FaBars, FaTimes } from 'react-icons/fa';

const AdminLayout = ({ children, title = 'Admin Panel' }) => {
  const { logout } = useAuth();
  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: FaHome },
    { name: 'Pedidos', href: '/admin/pedidos', icon: FaChartBar },
    { name: 'Suscriptores', href: '/admin/suscriptores', icon: FaUsers },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-dark-bg shadow-sm border-b border-gray-200 dark:border-dark-border">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isSidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text ml-2 lg:ml-0">
                {title}
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 dark:text-dark-text hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <FaSignOutAlt className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Cerrar sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-bg shadow-lg transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75 lg:hidden z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Menú</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="h-full overflow-y-auto">
            <div className="px-4 py-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
                      ${isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                        : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-dark-text'
                      }
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                );
              })}
              
              {/* Botón de Agregar Producto */}
              <button
                onClick={() => {
                  setModalOpen(true);
                  setSidebarOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
              >
                <FaBoxes className="mr-3 h-5 w-5" />
                Agregar Producto
              </button>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Modal de Agregar Producto */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        fetchProducts={() => {
          // Recargar la página para actualizar los productos
          window.location.reload();
        }}
      />
    </div>
  );
};

export default AdminLayout; 