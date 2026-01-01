"use client";

import { useState } from "react";
import { createReport } from "@/app/actions/reportActions"; // Usaremos una action específica
import Link from "next/link";
import { FaArrowLeft, FaGavel, FaExclamationTriangle, FaUserSecret, FaUsers, FaCalendarAlt } from "react-icons/fa";

export default function NewReportPage() {
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
            Este formulario sigue la <span className="font-bold">normativa oficial</span>. Elige el tipo de reporte:
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-t-4 border-red-600 space-y-6">
        
        {/* SELECTOR DE TIPO */}
        <div className="grid grid-cols-2 gap-4">
            <button
                type="button"
                onClick={() => setReportType("USER_REPORT")}
                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition ${
                    reportType === "USER_REPORT" 
                    ? "border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold" 
                    : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-300"
                }`}
            >
                <FaUserSecret className="text-2xl" /> Reportar Jugador
            </button>
            <button
                type="button"
                onClick={() => setReportType("FACTION_REPORT")}
                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition ${
                    reportType === "FACTION_REPORT" 
                    ? "border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold" 
                    : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-300"
                }`}
            >
                <FaUsers className="text-2xl" /> Reportar Facción
            </button>
        </div>

        <form action={createReport} onSubmit={() => setIsSubmitting(true)} className="space-y-6">
            <input type="hidden" name="type" value={reportType} />

            {/* CAMPOS COMUNES DE LA PLANTILLA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                        {reportType === "USER_REPORT" ? "Nombre del Reportado (Exacto)" : "Nombre de la Facción"}
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
                        <FaCalendarAlt /> Fecha y Hora (IC/OOC)
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
                <p className="text-xs text-gray-500 mb-2">Describe detalladamente lo ocurrido siguiendo la línea cronológica.</p>
                <textarea 
                    name="description"
                    rows={6}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                    required
                ></textarea>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Material Gráfico (Pruebas)</label>
                <input 
                    type="url" 
                    name="proofUrl"
                    placeholder="Link a Imgur, YouTube, Streamable..."
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    required
                />
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-100 dark:border-red-900/50 flex gap-3">
                <FaExclamationTriangle className="text-red-600 text-xl flex-shrink-0 mt-1" />
                <div className="text-sm text-red-800 dark:text-red-300">
                    <p className="font-bold">Advertencia:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                        <li>Los reportes sin pruebas gráficas serán rechazados automáticamente.</li>
                        <li>Mentir en un reporte conlleva sanción administrativa.</li>
                    </ul>
                </div>
            </div>

            <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
                {isSubmitting ? "Enviando..." : <><FaGavel /> Enviar Reporte</>}
            </button>
        </form>
      </div>
    </div>
  );
}