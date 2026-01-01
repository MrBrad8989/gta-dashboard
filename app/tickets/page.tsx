import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";import Link from "next/link";
import { FaPlus, FaTicketAlt, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from "react-icons/fa";

// Función auxiliar para iconos de estado
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'OPEN': return <FaExclamationCircle className="text-green-500" />;
    case 'IN_PROGRESS': return <FaClock className="text-yellow-500" />;
    case 'CLOSED': return <FaCheckCircle className="text-gray-400" />;
    case 'REJECTED': return <FaTimesCircle className="text-red-500" />;
    default: return <FaTicketAlt />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'OPEN': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">ABIERTO</span>;
    case 'IN_PROGRESS': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">EN PROCESO</span>;
    case 'CLOSED': return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">CERRADO</span>;
    case 'REJECTED': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">RECHAZADO</span>;
    default: return status;
  }
};

export default async function TicketsPage() {
  // @ts-ignore
  const session = await getServerSession(authOptions);

  if (!session) return <div>Inicia sesión primero</div>;

  // Buscar tickets creados por MI usuario
  const tickets = await prisma.ticket.findMany({
    where: {
      creatorId: parseInt(session.user.id)
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Centro de Soporte</h1>
          <p className="text-gray-500">Gestiona tus reportes y solicita ayuda al Staff.</p>
        </div>
        <Link 
          href="/tickets/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition"
        >
          <FaPlus /> Crear Nuevo Ticket
        </Link>
      </div>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <FaTicketAlt className="mx-auto text-4xl text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-600">No tienes tickets activos</h3>
            <p className="text-gray-400">Si tienes algún problema, crea un ticket nuevo.</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex justify-between items-center">
              <div className="flex items-start gap-4">
                <div className="mt-1 text-xl p-3 bg-gray-50 rounded-full">
                  {getStatusIcon(ticket.status)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{ticket.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">
                      #{ticket.id} • {ticket.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                      Actualizado: {new Date(ticket.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                {getStatusLabel(ticket.status)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}