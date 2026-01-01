import { createTicket } from "@/app/actions/ticketActions";
import Link from "next/link";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";

export default function NewTicketPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <Link href="/tickets" className="text-gray-500 hover:text-gray-800 flex items-center gap-2 text-sm font-bold mb-4">
          <FaArrowLeft /> Volver al Soporte
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Abrir Nuevo Ticket</h1>
        <p className="text-gray-500">Describe tu problema detalladamente para que el Staff pueda ayudarte.</p>
      </div>

      <form action={createTicket} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6">
        
        {/* Tipo de Ticket */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Ayuda</label>
          <select 
            name="type" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            required
          >
            <option value="GENERAL_SUPPORT">Soporte General / Duda</option>
            <option value="BUG_REPORT">Reportar Bug / Fallo</option>
            <option value="USER_REPORT">Reportar a un Usuario</option>
            <option value="FACTION_REPORT">Reportar Facción ilegal/legal</option>
            <option value="ACCOUNT_HELP">Problema con mi Cuenta</option>
          </select>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Asunto</label>
          <input 
            type="text" 
            name="title"
            placeholder="Ej: He perdido mi vehículo por un bug..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Descripción Detallada</label>
          <textarea 
            name="description"
            rows={6}
            placeholder="Explica qué ha pasado, dónde y cuándo..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            required
          ></textarea>
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