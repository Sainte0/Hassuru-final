import Image from "next/image";
import React, { useState, useEffect } from "react";

export default function Contact() {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        prenda: "",
        talle: "",
        contacto: "",
        url: "",
    });

    const [currentStep, setCurrentStep] = useState(0);
    const steps = [
        { image: "/images/encargos/1.jpeg", title: "Encargos: Trae lo que quieras desde EEUU o Europa" },
        { image: "/images/encargos/2.jpeg", title: "Cómo encargar" },
        { image: "/images/encargos/3.jpeg", title: "Haz tu pedido: Nombre, talla, color" },
        { image: "/images/encargos/4.jpeg", title: "Cómo pagar" },
        { image: "/images/encargos/5.jpeg", title: "Nosotros nos encargamos de todo" },
        { image: "/images/encargos/6.jpeg", title: "Recibe el producto con envíos gratis a Argentina o showroom en Córdoba Capital" },
    ];

    // Auto-avance del carrusel cada 5 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prevStep) => (prevStep + 1) % steps.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { nombre, apellido, prenda, talle, contacto, url } = formData;
        const mensaje = `Hola, me gustaría encargar lo siguiente:
        - Nombre: ${nombre}
        - Apellido: ${apellido}
        - Prenda o par a encargar: ${prenda}
        - Talle: ${talle}
        - Número de contacto: ${contacto}
        ${url ? `- URL de referencia: ${url}` : ""}`
        const whatsappUrl = `https://api.whatsapp.com/send?phone=3512595858&text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappUrl, "_blank");
    };

    const inputStyle = "p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9F1E40]";

    const nextStep = () => {
        setCurrentStep((prevStep) => (prevStep + 1) % steps.length);
    };

    const prevStep = () => {
        setCurrentStep((prevStep) => (prevStep - 1 + steps.length) % steps.length);
    };

    return (
        <div className="flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
            <h1 className="mb-8 text-3xl font-bold text-center text-gray-800">Servicio de Encargos</h1>
            <p className="mb-8 text-center text-gray-600 max-w-2xl">
                Traemos productos originales desde EEUU y Europa. Solo productos originales, garantizados.
            </p>
            
            {/* Carrusel de pasos */}
            <div className="w-full max-w-4xl mb-12">
                <div className="relative overflow-hidden">
                    <div className="relative h-[500px] md:h-[600px]">
                        <Image
                            src={steps[currentStep].image}
                            alt={steps[currentStep].title}
                            fill
                            className="object-contain"
                            priority
                        />
                        
                        {/* Controles del carrusel */}
                        <button 
                            onClick={prevStep}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all text-white"
                            aria-label="Paso anterior"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button 
                            onClick={nextStep}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all text-white"
                            aria-label="Siguiente paso"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        
                        {/* Indicadores de paso */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 p-2">
                            {steps.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentStep(index)}
                                    className={`w-3 h-3 rounded-full ${
                                        index === currentStep ? 'bg-white' : 'bg-white bg-opacity-50'
                                    }`}
                                    aria-label={`Ir al paso ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Formulario de contacto */}
            <div className="w-full max-w-2xl p-8 rounded-lg shadow-xl bg-white">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Solicita tu Encargo</h2>
                <p className="mb-6 text-center text-gray-600">
                    Completa el formulario y nos pondremos en contacto contigo para coordinar tu pedido.
                </p>
                <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            className={inputStyle}
                            required
                        />
                        <input
                            type="text"
                            name="apellido"
                            placeholder="Apellido"
                            value={formData.apellido}
                            onChange={handleInputChange}
                            className={inputStyle}
                            required
                        />
                    </div>
                    <input
                        type="text"
                        name="prenda"
                        placeholder="Nombre del par o prenda a encargar"
                        value={formData.prenda}
                        onChange={handleInputChange}
                        className={inputStyle}
                        required
                    />
                    <input
                        type="text"
                        name="talle"
                        placeholder="Talle"
                        value={formData.talle}
                        onChange={handleInputChange}
                        className={inputStyle}
                        required
                    />
                    <input
                        type="text"
                        name="contacto"
                        placeholder="Número de contacto"
                        value={formData.contacto}
                        onChange={handleInputChange}
                        className={inputStyle}
                        required
                    />
                    <input
                        type="url"
                        name="url"
                        placeholder="URL de referencia (opcional)"
                        value={formData.url}
                        onChange={handleInputChange}
                        className={inputStyle}
                    />
                    <button
                        type="submit"
                        className="p-3 text-white transition duration-300 bg-[#9F1E40] rounded-md hover:bg-[#BE1A1D] font-medium"
                    >
                        Enviar Solicitud
                    </button>
                </form>
            </div>
            
            {/* Información adicional */}
            <div className="w-full max-w-4xl mt-12 p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-xl font-semibold text-center text-gray-800">Beneficios de Nuestro Servicio</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="p-4 text-center">
                        <div className="flex justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#9F1E40]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h4 className="mb-2 font-medium">Productos Originales</h4>
                        <p className="text-sm text-gray-600">Garantizamos la autenticidad de todos los productos</p>
                    </div>
                    <div className="p-4 text-center">
                        <div className="flex justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#9F1E40]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h4 className="mb-2 font-medium">Envíos Gratis</h4>
                        <p className="text-sm text-gray-600">Envíos sin costo a Argentina o recogida en showroom</p>
                    </div>
                    <div className="p-4 text-center">
                        <div className="flex justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#9F1E40]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h4 className="mb-2 font-medium">Servicio Completo</h4>
                        <p className="text-sm text-gray-600">Nos encargamos de todo el proceso por ti</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
