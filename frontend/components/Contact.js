import Image from "next/image";
import React, { useState } from "react";

export default function Contact() {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        prenda: "",
        talle: "",
        contacto: "",
        url: "",
    });

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

    return (
        <div className="flex flex-col items-center justify-between gap-4 px-4 py-20 md:flex-row">
            <div className="w-full md:w-[49.5%] lg:max-h-[500px]">
                <Image
                    width={300}
                    height={300}
                    quality={100}
                    src="/images/Explicacion.png"
                    alt="Explicación"
                    className="object-contain w-full h-full rounded-md shadow-xl"
                />
            </div>
            <div className="w-full md:w-[49.5%] h-[700px] p-8 rounded-md shadow-xl bg-gray-50 flex items-center justify-center">
                <div className="w-full">
                    <h2 className="mb-6 text-2xl font-bold text-center">Encargos</h2>
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            className={inputStyle}
                        />
                        <input
                            type="text"
                            name="apellido"
                            placeholder="Apellido"
                            value={formData.apellido}
                            onChange={handleInputChange}
                            className={inputStyle}
                        />
                        <input
                            type="text"
                            name="prenda"
                            placeholder="Nombre del par o prenda a encargar"
                            value={formData.prenda}
                            onChange={handleInputChange}
                            className={inputStyle}
                        />
                        <input
                            type="text"
                            name="talle"
                            placeholder="Talle"
                            value={formData.talle}
                            onChange={handleInputChange}
                            className={inputStyle}
                        />
                        <input
                            type="text"
                            name="contacto"
                            placeholder="Número de contacto"
                            value={formData.contacto}
                            onChange={handleInputChange}
                            className={inputStyle}
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
                            className="p-2 text-white transition duration-300 bg-[#9F1E40] rounded-md hover:bg-[#BE1A1D]"
                        >
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
