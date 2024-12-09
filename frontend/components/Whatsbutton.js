import React from "react";

export default function WhatsButton() {
  const whatsappNumber = "3512595858";
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  const handleClick = () => {
    window.open(whatsappLink, "_blank", "noopener noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className="w-full px-6 py-4 font-bold text-white transition duration-300 bg-green-500 rounded-lg hover:bg-green-600"
      aria-label="Contáctanos por WhatsApp"
    >
      Contáctanos por WhatsApp
    </button>
  );
}
