import React from "react";
import { FaInstagram, FaTiktok } from "react-icons/fa";

export default function Footer() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const url = 'https://api.whatsapp.com/send?phone=3512595858&text=';
    window.open(url, "_blank");
  };

  return (
    <footer className="p-1 text-black dark:text-white bg-white dark:bg-gray-800 border-t-2 border-black dark:border-gray-700 shadow-md transition-colors duration-300">
      <div className="container flex flex-col items-center justify-between mx-auto space-y-4 rounded-sm md:flex-row md:space-y-0">
        <div className="flex space-x-6">
          <a href="https://www.instagram.com/hassuru.ar/?hl=es" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="w-6 h-6 hover:text-gray-500 dark:hover:text-gray-400 transition-colors" />
          </a>
          <a href="https://www.tiktok.com/@hassuru.ar" aria-label="Tiktok" target="_blank" rel="noopener noreferrer">
            <FaTiktok className="w-6 h-6 hover:text-gray-500 dark:hover:text-gray-400 transition-colors" />
          </a>
        </div>
        <div className="text-sm text-center md:text-right">
          <p className='mt-4 text-gray-900 dark:text-gray-300'>Email: hassuru.ar@gmail.com</p>
          <button className='text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors' onClick={handleSubmit}>Tel: 351 259 5858</button>
        </div>
      </div>
      <div className="pb-4 mt-4 text-sm text-center text-gray-700 dark:text-gray-400">
        &copy; 2025 @Hassuru. Todos los derechos reservados.
      </div>
    </footer>
  );
}
