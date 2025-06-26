import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import ThemeToggle from './ThemeToggle';
import { FaSignOutAlt, FaHome, FaBoxes, FaUsers, FaEnvelope, FaChartBar } from 'react-icons/fa';

const AdminLayout = ({ children, title = 'Admin Panel' }) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: FaHome },
    { name: 'Productos', href: '/admin/productos', icon: FaBoxes },
    { name: 'Pedidos', href: '/admin/pedidos', icon: FaChartBar },
    { name: 'Suscriptores', href: '/admin/suscriptores', icon: FaUsers },
    { name: 'Banners', href: '/admin/banners', icon: FaEnvelope },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-dark-card shadow-sm border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
                {title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-dark-text hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <FaSignOutAlt className="mr-2" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-dark-card shadow-sm border-r border-gray-200 dark:border-dark-border min-h-screen">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <a
                    key={item.name}
                    href={item.href}
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
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 