import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendMessage, updateTicketStatus, addUserToTicket } from "@/app/actions/ticketActions";
import { FaPaperPlane, FaLock, FaUnlock, FaUserPlus, FaUsers } from "react-icons/fa";
import { redirect } from "next/navigation";
import AttachmentPreview from "@/components/AttachmentPreview";
import TicketMessageForm from "@/components/TicketMessageForm";
import UserAvatar from "@/components/UserAvatar";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage(props: PageProps) {
  const params = await props.params;
  const ticketId = parseInt(params.id);

  if (isNaN(ticketId)) return <div className="p-8 text-red-500">ID inválido</div>;

  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const currentUserRole = session.user.role;
  const currentUserId = parseInt(session. user.id);

  // 1. BUSCAR TICKET + PARTICIPANTES (IMPORTANTE)
  const ticket = await prisma. ticket.findUnique({
    where: { id: ticketId },
    include: {
      creator: true,
      participants:  true,
      messages: {
        include: { author: true },
        orderBy: { createdAt:  'asc' }
      }
    }
  });

  if (!ticket) return <div className="p-8">Ticket no encontrado</div>;

  // 2. COMPROBAR PERMISOS (Creador OR Admin OR Participante)
  const isParticipant = ticket.participants.some(p => p.id === currentUserId);
  const canView = ticket. creatorId === currentUserId || currentUserRole === "ADMIN" || isParticipant;

  if (!canView) {
    return <div className="p-8 text-red-500 font-bold">⛔ No tienes permiso para ver este ticket privado.</div>;
  }

  // Bindings
  const sendMessageWithId = sendMessage.bind(null, ticket. id);
  const closeTicketWithReason = async (formData: FormData) => {
    "use server";
    const reason = formData.get('closeReason') as string;
    await updateTicketStatus(ticket.id, 'CLOSED', reason || 'Sin especificar');
  };
  const reopenTicket = updateTicketStatus.bind(null, ticket.id, 'OPEN');
  const addUserWithId = addUserToTicket.bind(null, ticket. id);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900">
      
      {/* --- CABECERA SUPERIOR --- */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between gap-4 shrink-0">
        
        {/* Info Ticket */}
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-xl font-bold text-gray-800 dark:text-white">
               #{ticket.id} - {ticket. title}
             </h1>
             <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                ticket.status === 'OPEN' ? 'bg-green-100 text-green-700 border-green-200' : 
                ticket. status === 'CLOSED' ?  'bg-gray-100 text-gray-600 border-gray-300' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
             }`}>
                {ticket.status}
             </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span>Autor: <b className="text-gray-700 dark: text-gray-300">{ticket.creator.name}</b></span>
            {ticket.participants. length > 0 && (
                <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-indigo-500">
                        <FaUsers /> Con: {ticket.participants.map(p => p.name).join(", ")}
                    </span>
                </>
            )}
          </div>

          {ticket.proofUrl && (
             <a href={ticket.proofUrl} target="_blank" className="text-xs text-blue-500 hover:underline mt-1 block">
               Ver Pruebas Adjuntas ↗
             </a>
          )}
        </div>

        {/* --- HERRAMIENTAS DE ADMIN --- */}
        {['FOUNDER', 'ADMIN', 'TRIAL_ADMIN', 'SUPPORT'].includes(currentUserRole) && (
          <div className="flex flex-wrap items-center gap-2">
              
              {/* FORMULARIO: AÑADIR USUARIO */}
              <form action={addUserWithId} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg border border-gray-200 dark:border-gray-600">
                  <input 
                    name="username" 
                    placeholder="Nombre Usuario exacto" 
                    className="bg-transparent text-sm px-2 py-1 outline-none w-40 text-gray-700 dark:text-gray-200"
                    required 
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded text-xs" title="Añadir al ticket">
                      <FaUserPlus />
                  </button>
              </form>

              {/* BOTONES DE ESTADO */}
              {ticket.status !== 'CLOSED' ? (
                  <>
                    {/* Botón Cerrar (con input para motivo) */}
                    <form action={closeTicketWithReason} className="flex items-center gap-2">
                      <input 
                        name="closeReason" 
                        placeholder="Motivo de cierre (opcional)" 
                        className="bg-gray-100 dark:bg-gray-700 text-sm px-2 py-1 rounded outline-none w-48 text-gray-700 dark: text-gray-200"
                      />
                      <button 
                        type="submit"
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow"
                      >
                        <FaLock /> Cerrar Ticket
                      </button>
                    </form>
                  </>
              ) : (
                  <form action={reopenTicket}>
                      <button className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow">
                          <FaUnlock /> Reabrir
                      </button>
                  </form>
              )}
          </div>
        )}
      </div>

      {/* --- CHAT --- */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Descripción */}
        <div className="flex justify-center mb-6">
            <div className="bg-blue-50 dark: bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl max-w-2xl text-center shadow-sm">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Descripción del Caso</p>
                <p className="text-gray-700 dark:text-gray-300">{ticket.description}</p>
            </div>
        </div>

        {/* Mensajes */}
        {ticket.messages. map((msg) => {
            const isMe = msg.authorId === currentUserId;
            const isAdmin = msg.author.role === 'ADMIN';
            const isSystem = msg.content. startsWith("🔒 SISTEMA:");

            if (isSystem) {
                return (
                    <div key={msg.id} className="flex justify-center my-4">
                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark: text-gray-300 text-xs px-3 py-1 rounded-full font-mono">
                            {msg.content}
                        </span>
                    </div>
                )
            }

            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                        {/* ✅ CAMBIADO: Usar UserAvatar en lugar de <img> */}
                        <div className="flex-shrink-0 mt-1">
                          <UserAvatar 
                            discordId={msg.author.discordId}
                            avatar={msg.author.avatar}
                            name={msg.author.name}
                            size="md"
                            className="border border-gray-300 dark: border-gray-600"
                          />
                        </div>
                        <div className={`p-3 md:p-4 rounded-2xl shadow-sm text-sm ${
                            isMe 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : isAdmin 
                                    ? 'bg-red-50 dark:bg-red-900/40 text-gray-800 dark:text-red-100 rounded-tl-none border border-red-200 dark:border-red-800'
                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-600'
                        }`}>
                            <div className="flex justify-between items-baseline gap-4 mb-1">
                                <span className={`font-bold text-xs ${isAdmin && !isMe ? 'text-red-500 dark:text-red-300' : 'opacity-90'}`}>
                                    {msg.author.name} {isAdmin && !isMe && '🛡️ STAFF'}
                                </span>
                                <span className="text-[10px] opacity-60">
                                    {msg.createdAt. toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            
                            {/* Attachments */}
                            {msg.attachments && Array.isArray(msg. attachments) && msg.attachments.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {(msg. attachments as string[]).map((url, index) => (
                                  <AttachmentPreview key={index} url={url} />
                                ))}
                              </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* --- INPUT --- */}
      {ticket.status === 'CLOSED' ? (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center gap-2">
                  <FaLock /> Ticket cerrado. Solo lectura.
              </p>
          </div>
      ) : (
          <div className="p-4 bg-white dark: bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
            <TicketMessageForm ticketId={ticket.id} sendMessageAction={sendMessageWithId} />
          </div>
      )}
    </div>
  );
}