import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, isSystemMode, toggleTheme, setSystemMode } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggle = () => {
    if (isSystemMode) {
      // Si está en modo sistema, cambiar a modo manual
      toggleTheme();
    } else {
      // Si está en modo manual, cambiar al modo opuesto
      toggleTheme();
    }
  };

  const handleSystemMode = () => {
    setSystemMode();
  };

  // Versión móvil más compacta
  if (isMobile) {
    return (
      <div className="flex items-center space-x-1">
        {/* Botón principal compacto */}
        <button
          onClick={handleToggle}
          className={`
            relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none
            ${isDarkMode 
              ? 'bg-blue-600' 
              : 'bg-gray-200'
            }
            ${isSystemMode ? 'ring-1 ring-green-400' : ''}
            ${className}
          `}
          aria-label={`Cambiar a modo ${isDarkMode ? 'claro' : 'oscuro'}`}
        >
          <span
            className={`
              inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300
              ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}
            `}
          />
          <div className="absolute inset-0 flex items-center justify-between px-1">
            <FaSun 
              className={`h-3 w-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-yellow-500'
              }`} 
            />
            <FaMoon 
              className={`h-3 w-3 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-400'
              }`} 
            />
          </div>
        </button>

        {/* Botón de modo sistema compacto */}
        <button
          onClick={handleSystemMode}
          className={`
            p-1 rounded-full transition-colors duration-300 focus:outline-none
            ${isSystemMode 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
            }
          `}
          aria-label="Usar modo del sistema"
          title={isSystemMode ? "Automático" : "Manual"}
        >
          <FaDesktop className="h-3 w-3" />
        </button>
      </div>
    );
  }

  // Versión desktop completa
  return (
    <div className="relative flex items-center space-x-2">
      {/* Botón principal */}
      <button
        onClick={handleToggle}
        className={`
          relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isDarkMode 
            ? 'bg-blue-600' 
            : 'bg-gray-200'
          }
          ${isSystemMode ? 'ring-2 ring-green-400' : ''}
          ${className}
        `}
        aria-label={`Cambiar a modo ${isDarkMode ? 'claro' : 'oscuro'}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span
          className={`
            inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300
            ${isDarkMode ? 'translate-x-8' : 'translate-x-1'}
          `}
        />
        <div className="absolute inset-0 flex items-center justify-between px-1">
          <FaSun 
            className={`h-4 w-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-yellow-500'
            }`} 
          />
          <FaMoon 
            className={`h-4 w-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-400'
            }`} 
          />
        </div>
      </button>

      {/* Botón de modo sistema */}
      <button
        onClick={handleSystemMode}
        className={`
          p-1.5 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500
          ${isSystemMode 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500'
          }
        `}
        aria-label="Usar modo del sistema"
        title={isSystemMode ? "Modo automático activado" : "Activar modo automático"}
      >
        <FaDesktop className="h-4 w-4" />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap z-50">
          {isSystemMode ? "Modo automático" : "Modo manual"}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle; 