import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSystemMode, setIsSystemMode] = useState(true); // Nuevo estado para controlar si sigue el sistema

  // Función para detectar preferencia del sistema
  const getSystemPreference = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  // Cargar tema desde localStorage al inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedSystemMode = localStorage.getItem('systemMode');
    
    if (savedSystemMode === 'true' || savedSystemMode === null) {
      // Si está en modo sistema o no hay configuración guardada
      setIsSystemMode(true);
      setIsDarkMode(getSystemPreference());
    } else {
      // Si el usuario ha configurado manualmente
      setIsSystemMode(false);
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (isSystemMode) {
        setIsDarkMode(e.matches);
      }
    };

    // Agregar listener para cambios en tiempo real
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback para navegadores más antiguos
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [isSystemMode]);

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Guardar configuración
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('systemMode', isSystemMode.toString());
  }, [isDarkMode, isSystemMode]);

  const toggleTheme = () => {
    setIsSystemMode(false); // Al hacer toggle manual, salir del modo sistema
    setIsDarkMode(!isDarkMode);
  };

  const setSystemMode = () => {
    setIsSystemMode(true);
    setIsDarkMode(getSystemPreference());
  };

  const value = {
    isDarkMode,
    isSystemMode,
    toggleTheme,
    setSystemMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 