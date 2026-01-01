import { createTicket } from "@/app/actions/ticketActions";
import Link from "next/link";
import { FaArrowLeft, FaGavel, FaExclamationTriangle } from "react-icons/fa";

export default function NewReportPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <Link 
          href="/my-reports" 
          className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2 text-sm font-bold mb-4"
        >
          <FaArrowLeft /> Volver a Mis Reportes
        </Link>
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-500 flex items-center gap-3">
            <FaGavel /> Reportar a un Usuario
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
            Formulario exclusivo para reportar infracciones de normativa.
        </p>
      </div>

      <form action={createTicket} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-t-4 border-red-500 dark:border-red-600 space-y-6">
        
        {/* Forzamos el tipo a USER_REPORT */}
        <input type="hidden" name="type" value="USER_REPORT" />

        {/* Usuario Reportado */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
            Nombre del Usuario (Discord Exacto)
          </label>
          <input 
            type="text" 
            name="reportedUserName"
            placeholder="Ej: Usuario#1234"
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Motivo</label>
          <input 
            type="text" 
            name="title"
            placeholder="Ej: DM en zona segura"
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Explicación</label>
          <textarea 
            name="description"
            rows={5}
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Pruebas (Link)</label>
          <input 
            type="url" 
            name="proofUrl"
            placeholder="YouTube, Streamable, Imgur..."
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            required
          />
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
            <FaExclamationTriangle className="mt-0.5 text-lg" />
            <p>Los reportes falsos serán sancionados.</p>
        </div>

        <button 
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex justify-center items-center gap-2"
        >
          <FaGavel /> Enviar Reporte
        </button>
      </form>
    </div>
  );
}