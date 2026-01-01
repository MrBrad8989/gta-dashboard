"use client";

import { useState } from "react";
import { requestEvent } from "@/app/actions/eventActions"; 
import Link from "next/link";
import { FaArrowLeft, FaCloudUploadAlt, FaImage, FaTrash } from "react-icons/fa";

export default function RequestEventPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para previsualizar imágenes
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);
  const [mapPreviews, setMapPreviews] = useState<string[]>([]);

  // Función para manejar la previsualización del Flyer
  const handleFlyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFlyerPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <Link href="/events" className="text-gray-500 hover:text-gray-800 dark:hover:text-white font-bold text-sm flex items-center gap-2 mb-2">
           <FaArrowLeft /> Volver a la Agenda
        </Link>
        <h1 className="text-3xl font-black text-gray-800 dark:text-white">Publicar Nuevo Evento</h1>
      </div>

      <form action={requestEvent} onSubmit={() => setIsSubmitting(true)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: DATOS */}
        <div className="lg:col-span-2 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Título del Evento</label>
                    <input name="title" type="text" placeholder="Ej: Fiesta en la Playa" className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-pink-500 outline-none" required />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fecha y Hora</label>
                    <input name="date" type="datetime-local" className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-pink-500 outline-none" required />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Enlace al Foro (GTA World)</label>
                <input name="gtawLink" type="url" placeholder="https://foro.gtaw.es/topic/..." className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-pink-500 outline-none" required />
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Descripción</label>
                <textarea name="description" rows={5} placeholder="Describe de qué trata el evento..." className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-pink-500 outline-none resize-none" required></textarea>
            </div>

            {/* SECCIÓN TÉCNICA (Checkboxes simplificados) */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-4">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm">Requisitos Técnicos</h3>
                
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="needsCars" value="true" className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500" />
                    <span className="text-sm">Necesito vehículos (decoración)</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="needsRadio" value="true" className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500" />
                    <span className="text-sm">Necesito emisora/radio en vivo</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="needsMapping" value="true" className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500" />
                    <span className="text-sm">Necesito carga de mapeo personalizado</span>
                </label>
            </div>
        </div>

        {/* COLUMNA DERECHA: SUBIDA DE IMÁGENES */}
        <div className="space-y-6">
            
            {/* SUBIDA DE FLYER (VISUAL) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Flyer Oficial (Obligatorio)</label>
                
                <div className="relative group w-full aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center overflow-hidden transition hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/10">
                    
                    {flyerPreview ? (
                        <>
                            <img src={flyerPreview} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold cursor-pointer">
                                Cambiar Imagen
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-4 text-gray-400">
                            <FaCloudUploadAlt className="text-4xl mx-auto mb-2" />
                            <p className="text-xs">Click para subir imagen</p>
                        </div>
                    )}
                    
                    <input 
                        type="file" 
                        name="flyer" 
                        accept="image/*" 
                        onChange={handleFlyerChange}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        required 
                    />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center">Formatos: JPG, PNG, WEBP (Max 5MB)</p>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-pink-600 to-violet-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? "Enviando Solicitud..." : "Enviar a Revisión"}
            </button>

        </div>
      </form>
    </div>
  );
}