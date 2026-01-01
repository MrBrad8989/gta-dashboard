import { createTicket } from "@/app/actions/ticketActions";
import Link from "next/link";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";

export default function NewTicketPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <Link 
          href="/tickets" 
          className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2 text-sm font-bold mb-4"
        >
          <FaArrowLeft /> Volver al Soporte
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Abrir Nuevo Ticket</h1>
        <p className="text-gray-500 dark:text-gray-400">Describe tu problema detalladamente para que el Staff pueda ayudarte.</p>
      </div>

      {/* FORMULARIO: Fondo blanco en día, Gris oscuro en noche */}
      <form action={createTicket} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-6">
        
        {/* Tipo de Ticket */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Tipo de Ayuda</label>
          <select 
            name="type" 
            className="w-full p-3 
                       bg-gray-50 dark:bg-gray-900 
                       text-gray-900 dark:text-white 
                       border border-gray-300 dark:border-gray-600 
                       rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          >
            {/* Las opciones heredarán el color, pero por seguridad las forzamos a oscuro si el navegador da problemas */}
            <option value="GENERAL_SUPPORT" className="dark:bg-gray-900">Soporte General / Duda</option>
            <option value="BUG_REPORT" className="dark:bg-gray-900">Reportar Bug / Fallo</option>
            <option value="USER_REPORT" className="dark:bg-gray-900">Reportar a un Usuario</option>
            <option value="FACTION_REPORT" className="dark:bg-gray-900">Reportar Facción ilegal/legal</option>
            <option value="ACCOUNT_HELP" className="dark:bg-gray-900">Problema con mi Cuenta</option>
          </select>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Asunto</label>
          <input 
            type="text" 
            name="title"
            placeholder="Ej: He perdido mi vehículo por un bug..."
            className="w-full p-3 
                       bg-gray-50 dark:bg-gray-900 
                       text-gray-900 dark:text-white 
                       border border-gray-300 dark:border-gray-600 
                       rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Descripción Detallada</label>
          <textarea 
            name="description"
            rows={6}
            placeholder="Explica qué ha pasado, dónde y cuándo..."
            className="w-full p-3 
                       bg-gray-50 dark:bg-gray-900 
                       text-gray-900 dark:text-white 
                       border border-gray-300 dark:border-gray-600 
                       rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            required
          ></textarea>
        </div>

        {/* Pruebas Gráficas (NUEVO) */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
            Pruebas Gráficas (Opcional)
          </label>
          <input 
            type="url" 
            name="proofUrl"
            placeholder="Enlace a Imgur, YouTube, Streamable..."
            className="w-full p-3 
                       bg-gray-50 dark:bg-gray-900 
                       text-gray-900 dark:text-white 
                       border border-gray-300 dark:border-gray-600 
                       rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sube tus imágenes a <a href="https://imgur.com" target="_blank" className="text-indigo-500 hover:underline">Imgur</a> o vídeos a YouTube/Streamable y pega el enlace aquí.
          </p>
        </div>

        {/* Botón */}
        <button 
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex justify-center items-center gap-2"
        >
          <FaPaperPlane /> Enviar Ticket
        </button>

      </form>
    </div>
  );
}