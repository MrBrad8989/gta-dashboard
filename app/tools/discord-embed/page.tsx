"use client";

import { useState } from "react";
import { FaDiscord, FaCopy, FaImage, FaPalette } from "react-icons/fa";

export default function DiscordEmbedPage() {
  // Estado básico del Embed
  const [embed, setEmbed] = useState({
    title: "Título del Anuncio",
    description: "Escribe aquí la descripción de tu mensaje...",
    color: "#5865F2",
    image: "",
    footer: "GTA Dashboard • Sistema Automático"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmbed({ ...embed, [e.target.name]: e.target.value });
  };

  const copyToClipboard = () => {
    const jsonCode = JSON.stringify({ embeds: [embed] }, null, 2);
    navigator.clipboard.writeText(jsonCode);
    alert("JSON copiado al portapapeles. ¡Pégalo en Discord!");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaDiscord className="text-[#5865F2]" /> Generador de Embeds
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Crea mensajes bonitos para tus canales de Discord.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- FORMULARIO DE EDICIÓN --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-4">
          <h2 className="font-bold text-lg text-gray-700 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Configuración</h2>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Título</label>
            <input 
              name="title" 
              value={embed.title} 
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Descripción</label>
            <textarea 
              name="description" 
              rows={4} 
              value={embed.description} 
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
               <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-2">
                 <FaPalette /> Color (Hex)
               </label>
               <div className="flex items-center gap-2">
                 <input 
                    type="color" 
                    name="color" 
                    value={embed.color} 
                    onChange={handleChange}
                    className="h-10 w-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                 />
                 <input 
                    name="color" 
                    value={embed.color} 
                    onChange={handleChange} 
                    className="flex-1 p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm font-mono uppercase"
                 />
               </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-2">
              <FaImage /> URL de Imagen (Opcional)
            </label>
            <input 
              name="image" 
              placeholder="https://..." 
              value={embed.image} 
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Footer / Pie de página</label>
            <input 
              name="footer" 
              value={embed.footer} 
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <button 
            onClick={copyToClipboard}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-4"
          >
            <FaCopy /> Copiar JSON para Discord
          </button>
        </div>

        {/* --- PREVISUALIZACIÓN (ESTILO DISCORD) --- */}
        <div>
           <h2 className="font-bold text-lg text-gray-700 dark:text-gray-200 mb-4">Vista Previa</h2>
           
           {/* Contenedor Gris Oscuro tipo Discord */}
           <div className="bg-[#36393f] p-4 rounded-lg shadow-inner border border-gray-300 dark:border-gray-900">
              <div className="flex gap-3">
                 {/* Avatar simulado Bot */}
                 <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    BOT
                 </div>

                 <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                       <span className="text-white font-bold text-sm">System Bot</span>
                       <span className="text-[#a5a7ac] text-xs px-1 bg-[#5865F2] rounded text-white">BOT</span>
                       <span className="text-[#72767d] text-xs">Hoy a las 12:00</span>
                    </div>

                    {/* El Embed en sí */}
                    <div 
                      className="mt-2 bg-[#2f3136] rounded-l-md p-4 max-w-md border-l-4 grid gap-2"
                      style={{ borderLeftColor: embed.color }}
                    >
                       <h3 className="text-white font-bold text-base">{embed.title}</h3>
                       <p className="text-[#dcddde] text-sm whitespace-pre-wrap">{embed.description}</p>
                       
                       {embed.image && (
                         <img src={embed.image} alt="Preview" className="w-full rounded-md mt-2 max-h-60 object-cover" />
                       )}

                       <div className="text-[#72767d] text-xs font-bold mt-1 flex items-center gap-1">
                         {embed.footer}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <p className="text-center text-gray-400 text-xs mt-4">
             Nota: La vista previa es aproximada. El resultado final en Discord será perfecto.
           </p>
        </div>

      </div>
    </div>
  );
}