"use client";

import { createTicket } from "@/app/actions/ticketActions";
import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft, FaLifeRing, FaBug, FaQuestionCircle, FaUserLock, FaLightbulb } from "react-icons/fa";

export default function NewTicketPage() {
  // Estado para mostrar guías dinámicas
  const [selectedType, setSelectedType] = useState("GENERAL_SUPPORT");

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <Link 
          href="/tickets" 
          className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2 text-sm font-bold mb-4"
        >
          <FaArrowLeft /> Volver a Soporte
        </Link>
        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
            <FaLifeRing /> Ticket de Soporte Técnico
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
            Elige el tipo de ayuda para ver instrucciones específicas.
        </p>
      </div>

      <form action={createTicket} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-t-4 border-indigo-500 dark:border-indigo-600 space-y-6">
        
        {/* SELECTOR DE TIPO */}
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">¿En qué podemos ayudarte?</label>
            <div className="grid grid-cols-3 gap-2">
                <label className="cursor-pointer" onClick={() => setSelectedType("GENERAL_SUPPORT")}>
                    <input type="radio" name="type" value="GENERAL_SUPPORT" className="peer sr-only" required defaultChecked />
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 peer-checked:bg-indigo-50 peer-checked:border-indigo-500 dark:peer-checked:bg-indigo-900/30 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <FaQuestionCircle className="mx-auto mb-1 text-indigo-500" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Duda General</span>
                    </div>
                </label>
                <label className="cursor-pointer" onClick={() => setSelectedType("BUG_REPORT")}>
                    <input type="radio" name="type" value="BUG_REPORT" className="peer sr-only" required />
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 peer-checked:bg-indigo-50 peer-checked:border-indigo-500 dark:peer-checked:bg-indigo-900/30 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <FaBug className="mx-auto mb-1 text-indigo-500" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Reportar Bug</span>
                    </div>
                </label>
                <label className="cursor-pointer" onClick={() => setSelectedType("ACCOUNT_HELP")}>
                    <input type="radio" name="type" value="ACCOUNT_HELP" className="peer sr-only" required />
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 peer-checked:bg-indigo-50 peer-checked:border-indigo-500 dark:peer-checked:bg-indigo-900/30 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <FaUserLock className="mx-auto mb-1 text-indigo-500" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Problema Cuenta</span>
                    </div>
                </label>
            </div>
        </div>

        {/* --- CAJA DE GUÍA DINÁMICA --- */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 transition-all">
           <div className="flex items-start gap-3">
              <FaLightbulb className="text-blue-500 mt-1 text-lg flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                 {selectedType === "GENERAL_SUPPORT" && (
                    <>
                      <p className="font-bold">Consejos para Dudas:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1 text-xs opacity-90">
                        <li>Antes de preguntar, revisa si tu duda está en la normativa.</li>
                        <li>Sé directo. Ejemplo: "No sé cómo usar el comando /me en esta situación".</li>
                      </ul>
                    </>
                 )}
                 {selectedType === "BUG_REPORT" && (
                    <>
                      <p className="font-bold">Cómo reportar un Bug:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1 text-xs opacity-90">
                        <li>Explica <strong>qué hacías</strong> justo antes del error.</li>
                        <li>Indica la hora aproximada para revisar logs.</li>
                        <li>¡Adjunta una captura o vídeo si es posible! Ayuda mucho.</li>
                      </ul>
                    </>
                 )}
                 {selectedType === "ACCOUNT_HELP" && (
                    <>
                      <p className="font-bold">Seguridad de la Cuenta:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1 text-xs opacity-90">
                        <li>NUNCA escribas tu contraseña en este formulario.</li>
                        <li>Describe el problema: "¿No te llega el correo? ¿Olvidaste el usuario?".</li>
                        <li>El Staff te pedirá pruebas de propiedad si es necesario.</li>
                      </ul>
                    </>
                 )}
              </div>
           </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Asunto</label>
          <input 
            type="text" 
            name="title"
            placeholder={
                selectedType === "BUG_REPORT" ? "Ej: Fallo al abrir el inventario del coche" :
                selectedType === "ACCOUNT_HELP" ? "Ej: No puedo acceder a mi personaje principal" :
                "Ej: Duda sobre el sistema de negocios"
            }
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Descripción</label>
          <textarea 
            name="description"
            rows={5}
            placeholder="Escribe aquí los detalles..."
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Pruebas (Opcional)</label>
          <input 
            type="url" 
            name="proofUrl"
            placeholder="URL de imagen si es necesaria"
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex justify-center items-center gap-2"
        >
          <FaLifeRing /> Crear Ticket
        </button>

      </form>
    </div>
  );
}