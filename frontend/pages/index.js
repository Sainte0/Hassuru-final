import React from "react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="Hassuru Logo"
            width={200}
            height={80}
            className="mx-auto"
          />
        </div>

        {/* Mensaje principal */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-red-200">
            {/* Icono de mantenimiento */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg 
                  className="w-10 h-10 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              🔧 Sitio en Mantenimiento
            </h1>

            {/* Subtítulo */}
            <h2 className="text-xl md:text-2xl font-semibold text-red-600 mb-6">
              Estamos renovando nuestro stock
            </h2>

            {/* Descripción */}
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Estamos trabajando para traerte los mejores productos con el mejor stock. 
              <br />
              <span className="font-medium text-gray-700">
                ¡Volveremos muy pronto con novedades increíbles!
              </span>
            </p>

            {/* Información adicional */}
            <div className="bg-red-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-red-800">Información importante</span>
              </div>
              <p className="text-red-700 text-sm">
                Durante este período, no podrás realizar compras ni acceder al catálogo. 
                Te recomendamos seguirnos en nuestras redes sociales para estar al tanto de las novedades.
              </p>
            </div>

            {/* Redes sociales */}
            <div className="flex justify-center space-x-4">
              <a 
                href="https://www.instagram.com/hassuru" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
              >
                📱 Instagram
              </a>
              <a 
                href="https://wa.me/5491112345678" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-gray-500 text-sm">
          <p>© 2024 Hassuru. Todos los derechos reservados.</p>
          <p className="mt-1">Gracias por tu paciencia 🙏</p>
        </div>
      </div>
    </main>
  );
}
