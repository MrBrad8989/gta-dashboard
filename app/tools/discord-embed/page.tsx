"use client";

import { useState } from "react";
import { FaCopy, FaDiscord, FaPlus, FaTrash } from "react-icons/fa";

interface EmbedField {
  name: string;
  value: string;
  inline: boolean;
}

export default function DiscordEmbedBuilder() {
  // Estado del Embed
  const [embed, setEmbed] = useState({
    title: "Título del Anuncio",
    description: "Escribe aquí la descripción de tu mensaje...",
    color: "#5865F2", // Azul Discord por defecto
    author: "",
    footer: "GTA:W Management System",
    timestamp: true,
    fields: [] as EmbedField[]
  });

  const [jsonOutput, setJsonOutput] = useState("");

  // Añadir un campo nuevo
  const addField = () => {
    setEmbed({
      ...embed,
      fields: [...embed.fields, { name: "Nuevo Campo", value: "Contenido", inline: false }]
    });
  };

  // Actualizar campo específico
  const updateField = (index: number, key: keyof EmbedField, val: any) => {
    const newFields = [...embed.fields];
    // @ts-ignore
    newFields[index][key] = val;
    setEmbed({ ...embed, fields: newFields });
  };

  // Borrar campo
  const removeField = (index: number) => {
    const newFields = embed.fields.filter((_, i) => i !== index);
    setEmbed({ ...embed, fields: newFields });
  };

  // Generar JSON
  const generateJSON = () => {
    const json = JSON.stringify({
      embeds: [{
        title: embed.title,
        description: embed.description,
        color: parseInt(embed.color.replace("#", ""), 16),
        author: { name: embed.author },
        footer: { text: embed.footer },
        timestamp: embed.timestamp ? new Date().toISOString() : undefined,
        fields: embed.fields
      }]
    }, null, 2);
    setJsonOutput(json);
    navigator.clipboard.writeText(json);
    alert("¡JSON copiado al portapapeles!");
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* COLUMNA IZQUIERDA: EDITOR */}
      <div className="w-1/2 p-8 overflow-y-auto border-r border-gray-300 bg-white">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-indigo-600">
          <FaDiscord /> Creador de Embeds
        </h1>

        <div className="space-y-4">
          {/* Configuración Básica */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">Autor</label>
            <input 
              type="text" 
              value={embed.author} 
              onChange={(e) => setEmbed({...embed, author: e.target.value})}
              className="w-full p-2 border rounded" 
              placeholder="Ej: Departamento de Policía"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">Título</label>
            <input 
              type="text" 
              value={embed.title} 
              onChange={(e) => setEmbed({...embed, title: e.target.value})}
              className="w-full p-2 border rounded font-bold" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">Descripción</label>
            <textarea 
              value={embed.description} 
              onChange={(e) => setEmbed({...embed, description: e.target.value})}
              className="w-full p-2 border rounded h-24" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500">Color (Hex)</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={embed.color} 
                  onChange={(e) => setEmbed({...embed, color: e.target.value})}
                  className="h-10 w-10 cursor-pointer border-none p-0 bg-transparent"
                />
                <input 
                  type="text" 
                  value={embed.color} 
                  onChange={(e) => setEmbed({...embed, color: e.target.value})}
                  className="w-full p-2 border rounded font-mono uppercase" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500">Footer</label>
              <input 
                type="text" 
                value={embed.footer} 
                onChange={(e) => setEmbed({...embed, footer: e.target.value})}
                className="w-full p-2 border rounded" 
              />
            </div>
          </div>

          {/* Campos Dinámicos */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-bold uppercase text-gray-500">Campos (Fields)</label>
              <button 
                onClick={addField}
                className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 flex items-center gap-1"
              >
                <FaPlus /> Añadir Campo
              </button>
            </div>
            
            <div className="space-y-3">
              {embed.fields.map((field, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded border flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      value={field.name}
                      onChange={(e) => updateField(i, 'name', e.target.value)}
                      className="w-full p-1 text-sm font-bold border rounded"
                      placeholder="Nombre del campo"
                    />
                    <textarea 
                      value={field.value}
                      onChange={(e) => updateField(i, 'value', e.target.value)}
                      className="w-full p-1 text-sm border rounded h-16"
                      placeholder="Contenido..."
                    />
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input 
                        type="checkbox" 
                        checked={field.inline}
                        onChange={(e) => updateField(i, 'inline', e.target.checked)}
                      />
                      En línea (Inline)
                    </label>
                  </div>
                  <button onClick={() => removeField(i)} className="text-red-400 hover:text-red-600 p-1">
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={generateJSON}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow mt-6 flex justify-center items-center gap-2"
          >
            <FaCopy /> Copiar JSON para Bot
          </button>
        </div>
      </div>

      {/* COLUMNA DERECHA: PREVIEW (DISCORD STYLE) */}
      <div className="w-1/2 bg-[#36393f] p-8 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-lg">
          <h3 className="text-[#b9bbbe] text-xs font-bold uppercase mb-4 tracking-wide">Vista Previa (Live Preview)</h3>
          
          {/* El Mensaje Embed */}
          <div className="flex gap-3">
             {/* Avatar dummy de un bot */}
             <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl">
               <FaDiscord />
             </div>

             <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-bold hover:underline cursor-pointer">System Bot</span>
                  <span className="text-[10px] bg-[#5865F2] text-white px-1 rounded">BOT</span>
                  <span className="text-[#72767d] text-xs">Hoy a las {new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}</span>
                </div>

                {/* El Cuerpo del Embed */}
                <div 
                  className="mt-2 bg-[#2f3136] rounded border-l-4 p-4 max-w-md shadow-sm"
                  style={{ borderLeftColor: embed.color }}
                >
                  <div className="grid gap-2">
                    {embed.author && (
                      <div className="text-white text-sm font-bold">{embed.author}</div>
                    )}
                    
                    <div className="text-white font-bold text-base hover:underline cursor-pointer">
                      {embed.title}
                    </div>
                    
                    <div className="text-[#dcddde] text-sm whitespace-pre-wrap">
                      {embed.description}
                    </div>

                    {/* Renderizado de Fields */}
                    {embed.fields.length > 0 && (
                      <div className="grid grid-cols-12 gap-2 mt-2">
                        {embed.fields.map((field, i) => (
                          <div key={i} className={`${field.inline ? 'col-span-4' : 'col-span-12'}`}>
                            <div className="text-[#b9bbbe] font-bold text-xs mb-1">{field.name}</div>
                            <div className="text-[#dcddde] text-sm whitespace-pre-wrap">{field.value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-2 mt-2 pt-2 text-xs text-[#b9bbbe]">
                      {embed.footer && <span>{embed.footer}</span>}
                      {embed.timestamp && embed.footer && <span>•</span>}
                      {embed.timestamp && <span>Hoy a las {new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}</span>}
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}