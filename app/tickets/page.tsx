import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { FaPlus, FaTicketAlt, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaUserTag } from "react-icons/fa";

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
    case 'OPEN': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">ABIERTO</span>;
    case 'IN_PROGRESS': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold border border-yellow-200">EN PROCESO</span>;
    case 'CLOSED': return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border border-gray-200">CERRADO</span>;
    case 'REJECTED': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">RECHAZADO</span>;
    default: return status;
  }
};

export default async function TicketsPage() {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session) return <div>Inicia sesión primero</div>;

  const currentUserId = parseInt(session.user.id);

  // --- CAMBIO CLAVE AQUÍ ---
  // Buscamos tickets donde SOY CREADOR -O- SOY PARTICIPANTE
  const tickets = await prisma.ticket.findMany({
    where: {
      OR: [
        { creatorId: currentUserId },                   // Opción A: Lo creé yo
        { participants: { some: { id: currentUserId } } } // Opción B: Me añadieron
      ]
    },
    orderBy: { updatedAt: 'desc' },
    include: { messages: true }
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Centro de Soporte</h1>
          <p className="text-gray-500 dark:text-gray-400">Tus reportes y consultas.</p>
        </div>
        <Link 
          href="/tickets/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition"
        >
          <FaPlus /> Crear Nuevo Ticket
        </Link>
      </div>

      <div className="grid gap-4">
        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <FaTicketAlt className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300">No tienes tickets</h3>
          </div>
        ) : (
          tickets.map((ticket) => {
            // Comprobamos si soy invitado para poner una etiqueta
            const isInvited = ticket.creatorId !== currentUserId;

            return (
              <Link 
                  key={ticket.id} 
                  href={`/tickets/${ticket.id}`}
                  className={`block bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm hover:shadow-md transition group ${
                      isInvited 
                        ? 'border-l-4 border-l-purple-500 border-y-gray-200 border-r-gray-200 dark:border-y-gray-700 dark:border-r-gray-700' // Borde morado si soy invitado
                        : 'border-gray-200 dark:border-gray-700'
                  }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1 text-2xl p-3 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition">
                        {getStatusIcon(ticket.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                              {ticket.title}
                            </h3>
                            {/* ETIQUETA VISUAL SI TE HAN AÑADIDO */}
                            {isInvited && (
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                                    <FaUserTag /> TE HAN AÑADIDO
                                </span>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs font-mono bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800 uppercase font-bold">
                            #{ticket.id} • {ticket.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(ticket.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-1">
                            {ticket.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusLabel(ticket.status)}
                      {ticket.messages.length > 0 && (
                          <span className="text-xs text-gray-400">
                              {ticket.messages.length} mensajes
                          </span>
                      )}
                    </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}