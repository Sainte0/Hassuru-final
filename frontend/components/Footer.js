import React from "react";
import { FaInstagram, FaTiktok } from "react-icons/fa";

export default function Footer() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const url = 'https://api.whatsapp.com/send?phone=3512595858&text=';
    window.open(url, "_blank");
  };

  return (
    <footer className="p-1 text-black bg-white border-t-2 border-black shadow-md">
      <div className="container flex flex-col items-center justify-between mx-auto space-y-4 rounded-sm md:flex-row md:space-y-0">
        <div className="flex space-x-6">
          <a href="https://www.instagram.com/hassuru.ar/?hl=es" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="w-6 h-6 hover:text-gray-500" />
          </a>
          <a href="https://www.tiktok.com/@hassuru.ar" aria-label="Tiktok" target="_blank" rel="noopener noreferrer">
            <FaTiktok className="w-6 h-6 hover:text-gray-500" />
          </a>
        </div>
        <div className="text-sm text-center md:text-right">
          <p className='mt-4'>Email: hassuru.ar@gmail.com</p>
          <button className='text-green-700' onClick={handleSubmit}>Tel: 351 259 5858</button>
        </div>
      </div>
      <div className="pb-4 mt-4 text-sm text-center">
        &copy; 2025 @Hassuru. Todos los derechos reservados.
      </div>
    </footer>
  );
}
