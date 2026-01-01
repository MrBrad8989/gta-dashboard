import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendMessage, updateTicketStatus } from "@/app/actions/ticketActions";
import { FaPaperPlane, FaUserCircle, FaLock, FaUnlock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { redirect } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default async function TicketDetailPage({ params }: PageProps) {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const ticketId = parseInt(params.id);
  const currentUserRole = session.user.role;
  const currentUserId = parseInt(session.user.id);

  // 1. OBTENER DATOS DEL TICKET Y MENSAJES
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      creator: true,
      messages: {
        include: { author: true },
        orderBy: { createdAt: 'asc' } // Mensajes en orden cronológico
      }
    }
  });

  if (!ticket) return <div>Ticket no encontrado</div>;

  // Seguridad: Solo el dueño o un Admin pueden ver esto
  if (ticket.creatorId !== currentUserId && currentUserRole !== "ADMIN") {
    return <div>No tienes permiso para ver este ticket.</div>;
  }

  // Bindings para Server Actions (pasar argumentos extra)
  const sendMessageWithId = sendMessage.bind(null, ticket.id);
  const closeTicket = updateTicketStatus.bind(null, ticket.id, 'CLOSED');
  const reopenTicket = updateTicketStatus.bind(null, ticket.id, 'OPEN');

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900">
      
      {/* --- CABECERA DEL TICKET --- */}
      <div className="bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-xl font-bold text-gray-800 dark:text-white">
               #{ticket.id} - {ticket.title}
             </h1>
             <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                ticket.status === 'OPEN' ? 'bg-green-100 text-green-700 border-green-200' : 
                ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-600 border-gray-300' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
             }`}>
                {ticket.status}
             </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Creado por <span className="font-bold">{ticket.creator.name}</span> • {ticket.type}
          </p>
          {ticket.proofUrl && (
             <a href={ticket.proofUrl} target="_blank" className="text-xs text-blue-500 hover:underline mt-1 block">
               Ver Pruebas Adjuntas ↗
             </a>
          )}
        </div>

        {/* --- PANEL DE CONTROL (BOTONES) --- */}
        <div className="flex gap-2">
            {ticket.status !== 'CLOSED' ? (
                <form action={closeTicket}>
                    <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow">
                        <FaLock /> Cerrar Ticket
                    </button>
                </form>
            ) : (
                <form action={reopenTicket}>
                    <button className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow">
                        <FaUnlock /> Reabrir Ticket
                    </button>
                </form>
            )}
        </div>
      </div>

      {/* --- ÁREA DE CHAT (SCROLLABLE) --- */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Descripción original del problema */}
        <div className="flex justify-center mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl max-w-2xl text-center">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Descripción del Problema</p>
                <p className="text-gray-700 dark:text-gray-300">{ticket.description}</p>
            </div>
        </div>

        {/* Mensajes */}
        {ticket.messages.map((msg) => {
            const isMe = msg.authorId === currentUserId;
            const isAdmin = msg.author.role === 'ADMIN';

            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[80%] md:max-w-[60%] ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                        {/* Avatar */}
                        <div className="flex-shrink-0 mt-1">
                             <img src={msg.author.avatar || '/default-avatar.png'} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600" />
                        </div>

                        {/* Burbuja */}
                        <div className={`p-4 rounded-2xl shadow-sm text-sm ${
                            isMe 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : isAdmin 
                                    ? 'bg-red-900/90 text-white rounded-tl-none border border-red-700' // Estilo especial Admin
                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-600'
                        }`}>
                            <div className="flex justify-between items-baseline gap-4 mb-1">
                                <span className={`font-bold text-xs ${isAdmin && !isMe ? 'text-red-300' : 'opacity-90'}`}>
                                    {msg.author.name} {isAdmin && !isMe && '(STAFF)'}
                                </span>
                                <span className="text-[10px] opacity-60">
                                    {msg.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                </div>
            );
        })}
        
        {ticket.messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-10">
                No hay mensajes nuevos. Espera a que un administrador responda.
            </div>
        )}
      </div>

      {/* --- INPUT PARA ESCRIBIR --- */}
      {ticket.status === 'CLOSED' ? (
          <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-center">
              <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                  <FaLock /> Este ticket está cerrado. No puedes enviar más mensajes.
              </p>
          </div>
      ) : (
          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
            <form action={sendMessageWithId} className="flex gap-4 max-w-5xl mx-auto">
                <input 
                    type="text" 
                    name="content"
                    autoComplete="off"
                    placeholder="Escribe una respuesta..." 
                    className="flex-1 p-4 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-white"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl transition shadow-lg flex items-center gap-2 font-bold">
                    <FaPaperPlane /> <span className="hidden md:inline">Enviar</span>
                </button>
            </form>
          </div>
      )}

    </div>
  );
}