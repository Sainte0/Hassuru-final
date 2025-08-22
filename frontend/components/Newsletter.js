import React, { useState } from "react";
import WhatsButton from "./Whatsbutton";
import { toast } from 'react-hot-toast';

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/suscriptores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        toast.success("¡Gracias por suscribirte!");
        setEmail("");
      } else {
        throw new Error("Error al suscribirte.");
      }
    } catch {
      toast.error("Error al suscribirte. Intenta nuevamente.");
    }
  };

  return (
    <div className="container p-6 mx-auto mt-10 bg-white dark:bg-dark-bg rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex flex-col items-center md:flex-row md:justify-between md:items-center md:space-y-0">
        <div className="w-full md:w-1/2">
          <h1 className="mb-4 text-lg font-bold text-left text-gray-900 dark:text-white">
            Suscríbete a nuestra Newsletter
          </h1>
          <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo electrónico"
              required
              className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-t-lg md:rounded-l-lg md:rounded-t-none md:mb-0 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white transition duration-300 bg-red-600 dark:bg-red-700 rounded-b-lg md:rounded-r-lg md:rounded-b-none hover:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Suscribirse al newsletter"
            >
              Suscribirse
            </button>
          </form>
        </div>
        <div className="w-full md:w-1/4">
          <WhatsButton />
        </div>
      </div>
    </div>
  );
}
