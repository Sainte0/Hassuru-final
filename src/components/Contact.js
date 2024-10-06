import React, { useState } from "react";

export default function Contact() {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        prenda: "",
        talle: "",
        contacto: ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const { nombre, apellido, prenda, talle, contacto } = formData;
        const mensaje = `Hola, me gustaría encargar lo siguiente:
        - Nombre: ${nombre}
        - Apellido: ${apellido}
        - Prenda o par a encargar: ${prenda}
        - Talle: ${talle}
        - Número de contacto: ${contacto}`;

        const url = `https://api.whatsapp.com/send?phone=3573694877&text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
    };

    const inputStyle = "p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9F1E40]";

    return (
        <div className="flex items-center justify-center py-20">
            <div className="flex flex-col justify-between p-8 rounded-md shadow-xl bg-gray-50 w-96">
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
                    <button
                        type="submit"
                        className="p-2 text-white transition duration-300 bg-[#9F1E40] rounded-md hover:bg-[#BE1A1D]"
                    >
                        Enviar
                    </button>
                </form>
            </div>
        </div>
    );
}
