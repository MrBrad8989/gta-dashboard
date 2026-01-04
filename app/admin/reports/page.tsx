import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { FaClipboardList, FaCheckCircle, FaGavel, FaLifeRing, FaHandPaper, FaUserShield, FaArrowRight } from "react-icons/fa";
import { claimTicket, assignTicketManually } from "@/app/actions/ticketActions";
import { getDiscordAvatarUrl, getDefaultDiscordAvatar } from "@/lib/avatarHelper";

export default async function AdminReportsPage() {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  
  const allowedRoles = ['FOUNDER', 'ADMIN', 'TRIAL_ADMIN', 'SUPPORT'];
  if (!session || !allowedRoles.includes(session.user.role)) {
    return <div className="p-10 text-center text-red-500 font-bold">Acceso Denegado</div>;
  }

  const currentUserId = parseInt(session.user.id);
  const userRole = session.user.role;
  const isSuperAdmin = ['FOUNDER', 'ADMIN'].includes(userRole);

  // 1. FILTRO: ¿Qué tickets veo?
  const whereCondition: any = {};
  if (!isSuperAdmin) {
      // Staff normal solo ve lo libre o lo suyo
      whereCondition.OR = [
          { assignedToId: null },
          { assignedToId: currentUserId }
      ];
  }

  // 2. CARGAMOS TICKETS
  const tickets = await prisma.ticket.findMany({
    where: whereCondition,
    orderBy: { updatedAt: 'desc' },
    include: { 
        creator: true, 
        reportedUser: true,
        assignedTo: true 
    }
  });

  // 3. CARGAMOS LISTA DE STAFF (Solo si soy Admin, para el desplegable)
  let staffMembers: { id: number; name: string | null; role: string }[] = [];
  if (isSuperAdmin) {
      staffMembers = await prisma.user.findMany({
          where: { role: { in: ['FOUNDER', 'ADMIN', 'TRIAL_ADMIN', 'SUPPORT'] } },
          select: { id: true, name: true, role: true } // Solo datos necesarios
      });
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <FaClipboardList className="text-indigo-600" />
            Panel de Tickets & Reportes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isSuperAdmin 
                ? "Modo Supervisor: Gestión total y asignación manual." 
                : "Modo Staff: Atiende tickets libres (Máx. 5 simultáneos)."}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {tickets.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
             <FaCheckCircle className="text-6xl text-green-200 dark:text-green-900 mb-4" />
             <h3 className="text-xl font-bold text-gray-800 dark:text-white">Bandeja Limpia</h3>
             <p className="text-gray-500">No hay tareas pendientes en tu vista.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Asunto</th>
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Responsable</th>
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {tickets.map((ticket) => {
                  const isReport = ticket.type === 'USER_REPORT' || ticket.type === 'FACTION_REPORT';
                  const isMine = ticket.assignedToId === currentUserId;
                  const isUnassigned = ticket.assignedToId === null;
                  
                  return (
                    <tr key={ticket.id} className={`transition group ${isMine ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                      {/* TIPO */}
                      <td className="p-4 align-top w-32">
                        <Link href={`/tickets/${ticket.id}`} className="block">
                            <span className="font-mono text-[10px] text-gray-400 mb-1 block">#{ticket.id}</span>
                            {isReport ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold border border-red-200 dark:border-red-800 uppercase">
                                    <FaGavel size={10} /> REPORTE
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold border border-blue-200 dark:border-blue-800 uppercase">
                                    <FaLifeRing size={10} /> SOPORTE
                                </span>
                            )}
                        </Link>
                      </td>

                      {/* ASUNTO */}
                      <td className="p-4 align-top">
                        <Link href={`/tickets/${ticket.id}`} className="block group-hover:text-indigo-500 transition">
                            <div className="font-bold text-gray-800 dark:text-white text-sm mb-1">
                               {ticket.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 opacity-80">
                               {ticket.description.substring(0, 60)}...
                            </div>
                        </Link>
                      </td>

                      {/* RESPONSABLE */}
                      <td className="p-4 align-top">
                        {ticket.assignedTo ? (
                            <div className="flex items-center gap-2">
                                <img 
                                  src={getDiscordAvatarUrl(ticket.assignedTo.discordId, ticket.assignedTo.avatar)}
                                  alt={ticket.assignedTo.name || 'Staff'}
                                  className="w-6 h-6 rounded-full border border-gray-600"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const discordId = ticket.assignedTo?.discordId || '0';
                                    target.src = getDefaultDiscordAvatar(discordId);
                                  }}
                                />
                                <span className={`text-xs font-bold ${isMine ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {isMine ? 'Tú (Reclamado)' : ticket.assignedTo.name}
                                </span>
                            </div>
                        ) : (
                            <span className="text-xs text-gray-400 italic flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                Libre
                            </span>
                        )}
                      </td>

                      {/* ACCIONES (RECLAMAR / ASIGNAR) */}
                      <td className="p-4 align-top text-right">
                        <div className="flex flex-col gap-2 items-end">
                            
                            {/* BOTÓN RECLAMAR (Para todos si está libre) */}
                            {isUnassigned && ticket.status !== 'CLOSED' && (
                                <form action={async () => {
                                    "use server";
                                    await claimTicket(ticket.id);
                                }}>
                                    <button className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow flex items-center gap-1 transition">
                                        <FaHandPaper /> Reclamar
                                    </button>
                                </form>
                            )}

                            {/* HERRAMIENTA ADMIN: ASIGNAR MANUALMENTE */}
                            {isSuperAdmin && ticket.status !== 'CLOSED' && (
                                <form action={assignTicketManually} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded border border-gray-200 dark:border-gray-600">
                                    <input type="hidden" name="ticketId" value={ticket.id} />
                                    <select 
                                        name="targetUserId" 
                                        className="text-[10px] bg-transparent text-gray-800 dark:text-white border-none focus:ring-0 cursor-pointer w-24"
                                        defaultValue=""
                                        required
                                    >
                                        <option value="" disabled>Asignar a...</option>
                                        {staffMembers.map(staff => (
                                            <option key={staff.id} value={staff.id} className="text-black">
                                                {staff.name} ({staff.role})
                                            </option>
                                        ))}
                                    </select>
                                    <button type="submit" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 p-1">
                                        <FaArrowRight size={12} />
                                    </button>
                                </form>
                            )}

                            {/* Enlace al chat si ya está asignado */}
                            {!isUnassigned && (
                                <Link href={`/tickets/${ticket.id}`} className="text-indigo-600 hover:underline text-xs font-bold">
                                    Ver Chat &rarr;
                                </Link>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}