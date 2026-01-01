"use client";

import { requestEvent } from "@/app/actions/eventActions"; // La acción que acabamos de crear
import Link from "next/link";
import { FaArrowLeft, FaCalendarPlus, FaImage, FaMapMarkedAlt, FaLink } from "react-icons/fa";
import { useState } from "react";

export default function RequestEventPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <Link 
          href="/events" 
          className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2 text-sm font-bold mb-4"
        >
          <FaArrowLeft /> Volver a la Galería
        </Link>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600 flex items-center gap-3">
            <FaCalendarPlus className="text-pink-500" /> Solicitar Evento
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
            Rellena los datos para que el equipo de eventos anuncie tu fiesta.
        </p>
      </div>

      <form 
        action={requestEvent} 
        onSubmit={() => setIsSubmitting(true)}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-t-4 border-pink-500 space-y-6"
      >
        
        {/* Link del Foro */}
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <FaLink /> Enlace del Post (Foro)
            </label>
            <input 
                type="url" 
                name="gtawLink"
                placeholder="https://foro.gtaw.es/topic/..."
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                required
            />
        </div>

        {/* Flyer */}
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <FaImage /> URL del Flyer (Imagen Vertical)
            </label>
            <input 
                type="url" 
                name="flyerUrl"
                placeholder="https://i.imgur.com/..."
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                required
            />
            <p className="text-xs text-gray-500 mt-1">Recomendamos subir la imagen a Imgur.</p>
        </div>

        {/* Mapa */}
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <FaMapMarkedAlt /> URL del Mapa (Opcional)
            </label>
            <input 
                type="url" 
                name="mapUrl"
                placeholder="https://i.imgur.com/..."
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            />
        </div>

        <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex justify-center items-center gap-2 disabled:opacity-50"
        >
            {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
        </button>

      </form>
    </div>
  );
}