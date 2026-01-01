"use client";

import { createTicket } from "@/app/actions/ticketActions";
import Link from "next/link";
import { FaArrowLeft, FaLifeRing, FaBug, FaQuestionCircle, FaUserLock } from "react-icons/fa";

export default function NewTicketPage() {
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
            Utiliza este canal para dudas generales, problemas con tu cuenta o reporte de bugs técnicos.
        </p>
      </div>

      <form action={createTicket} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-t-4 border-indigo-500 dark:border-indigo-600 space-y-6">
        
        {/* SELECTOR DE TIPO SIMPLIFICADO */}
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">¿En qué podemos ayudarte?</label>
            <div className="grid grid-cols-3 gap-2">
                <label className="cursor-pointer">
                    <input type="radio" name="type" value="GENERAL_SUPPORT" className="peer sr-only" required defaultChecked />
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 peer-checked:bg-indigo-50 peer-checked:border-indigo-500 dark:peer-checked:bg-indigo-900/30 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <FaQuestionCircle className="mx-auto mb-1 text-indigo-500" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Duda General</span>
                    </div>
                </label>
                <label className="cursor-pointer">
                    <input type="radio" name="type" value="BUG_REPORT" className="peer sr-only" required />
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 peer-checked:bg-indigo-50 peer-checked:border-indigo-500 dark:peer-checked:bg-indigo-900/30 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <FaBug className="mx-auto mb-1 text-indigo-500" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Reportar Bug</span>
                    </div>
                </label>
                <label className="cursor-pointer">
                    <input type="radio" name="type" value="ACCOUNT_HELP" className="peer sr-only" required />
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 peer-checked:bg-indigo-50 peer-checked:border-indigo-500 dark:peer-checked:bg-indigo-900/30 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <FaUserLock className="mx-auto mb-1 text-indigo-500" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Problema Cuenta</span>
                    </div>
                </label>
            </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Asunto</label>
          <input 
            type="text" 
            name="title"
            placeholder="Resumen del problema"
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Descripción</label>
          <textarea 
            name="description"
            rows={5}
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