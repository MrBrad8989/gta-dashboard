"use client";

import { useState } from "react";
import { createReport } from "@/app/actions/reportActions";
import Link from "next/link";
import { FaArrowLeft, FaGavel, FaExclamationTriangle, FaUserSecret, FaUsers, FaCalendarAlt } from "react-icons/fa";

export default function NewReportPage() {
  // Estado para controlar qué formulario mostramos
  const [reportType, setReportType] = useState<"USER_REPORT" | "FACTION_REPORT">("USER_REPORT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-6">
        <Link 
          href="/my-reports" 
          className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2 text-sm font-bold mb-4"
        >
          <FaArrowLeft /> Cancelar y Volver
        </Link>
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-500 flex items-center gap-3">
            <FaGavel /> Crear Reporte Formal
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
            Selecciona el tipo de infracción. El formulario aplicará la plantilla oficial automáticamente.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-t-4 border-red-600 space-y-6">
        
        {/* --- SELECTOR DE TIPO (Jugador vs Facción) --- */}
        <div className="grid grid-cols-2 gap-4">
            <button
                type="button"
                onClick={() => setReportType("USER_REPORT")}
                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition ${
                    reportType === "USER_REPORT" 
                    ? "border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold shadow-sm" 
                    : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-300 dark:hover:border-red-800"
                }`}
            >
                <FaUserSecret className="text-2xl" /> Reportar Jugador
            </button>
            <button
                type="button"
                onClick={() => setReportType("FACTION_REPORT")}
                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition ${
                    reportType === "FACTION_REPORT" 
                    ? "border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold shadow-sm" 
                    : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-300 dark:hover:border-red-800"
                }`}
            >
                <FaUsers className="text-2xl" /> Reportar Facción
            </button>
        </div>

        {/* --- FORMULARIO --- */}
        <form action={createReport} onSubmit={() => setIsSubmitting(true)} className="space-y-6">
            <input type="hidden" name="type" value={reportType} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                        {reportType === "USER_REPORT" ? "Nombre del Personaje (Acusado)" : "Nombre de la Facción"}
                    </label>
                    <input 
                        type="text" 
                        name="reportedName"
                        placeholder={reportType === "USER_REPORT" ? "Ej: Ryan_Smith" : "Ej: Los Santos Vagos"}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                        <FaCalendarAlt /> Fecha y Hora del suceso
                    </label>
                    <input 
                        type="datetime-local" 
                        name="dateTime"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Motivo del Reporte (Título)</label>
                <input 
                    type="text" 
                    name="title"
                    placeholder="Ej: DM, PG, Nula interpretación..."
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Explicación de los hechos</label>
                <p className="text-xs text-gray-500 mb-2">Sé claro y conciso. Describe la situación cronológicamente.</p>
                <textarea 
                    name="description"
                    rows={6}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                    required
                ></textarea>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Pruebas Gráficas (Obligatorio)</label>
                <input 
                    type="url" 
                    name="proofUrl"
                    placeholder="https://imgur.com/..., https://youtube.com/..."
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    required
                />
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-100 dark:border-red-900/50 flex gap-3">
                <FaExclamationTriangle className="text-red-600 text-xl flex-shrink-0 mt-1" />
                <div className="text-sm text-red-800 dark:text-red-300">
                    <p className="font-bold">Normativa:</p>
                    <p className="text-xs mt-1">
                        Reportar con pruebas falsas o editadas conllevará una sanción grave. Asegúrate de tener el material original.
                    </p>
                </div>
            </div>

            <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
                {isSubmitting ? "Procesando..." : <><FaGavel /> Enviar Reporte Formal</>}
            </button>
        </form>
      </div>
    </div>
  );
}