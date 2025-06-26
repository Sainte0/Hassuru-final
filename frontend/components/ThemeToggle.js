import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isDarkMode 
          ? 'bg-blue-600' 
          : 'bg-gray-200'
        }
        ${className}
      `}
      aria-label={`Cambiar a modo ${isDarkMode ? 'claro' : 'oscuro'}`}
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
  );
};

export default ThemeToggle; 