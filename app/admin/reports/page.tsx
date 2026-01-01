import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { FaUserShield, FaClipboardList, FaCheckCircle, FaGavel, FaLifeRing, FaFilter } from "react-icons/fa";

export default async function AdminReportsPage() {
  // @ts-ignore
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <FaUserShield className="text-5xl text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Acceso Restringido</h1>
      </div>
    );
  }

  // Traemos TODO: Tickets y Reportes, ordenados por fecha
  const tickets = await prisma.ticket.findMany({
    orderBy: { updatedAt: 'desc' }, // Los más recientes primero (que tengan actividad)
    include: { creator: true, reportedUser: true }
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <FaClipboardList className="text-indigo-600" />
            Administración de Tickets
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestión centralizada de soporte técnico y reportes de normativa.
          </p>
        </div>
        
        {/* Contadores rápidos */}
        <div className="flex gap-3">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 uppercase">Pendientes</span>
                <span className="text-xl font-bold text-indigo-600">{tickets.filter(t => t.status === 'OPEN').length}</span>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {tickets.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
             <FaCheckCircle className="text-6xl text-green-200 dark:text-green-900 mb-4" />
             <h3 className="text-xl font-bold text-gray-800 dark:text-white">Todo Limpio</h3>
             <p className="text-gray-500">No hay tickets ni reportes pendientes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Asunto / Resumen</th>
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Involucrados</th>
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {tickets.map((ticket) => {
                  const isReport = ticket.type === 'USER_REPORT' || ticket.type === 'FACTION_REPORT';
                  
                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                      <td className="p-4 align-top w-40">
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
                      <td className="p-4 align-top">
                        <Link href={`/tickets/${ticket.id}`} className="block group-hover:text-indigo-500 transition">
                            <div className="font-bold text-gray-800 dark:text-white text-sm mb-1">
                               {ticket.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 font-mono opacity-80">
                               {/* Mostramos un fragmento para identificarlo rápido */}
                               {ticket.description.slice(0, 60)}...
                            </div>
                        </Link>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                                <span className="text-gray-400">Autor:</span> 
                                <img src={ticket.creator.avatar || "/default-avatar.png"} className="w-4 h-4 rounded-full" />
                                <b>{ticket.creator.name}</b>
                            </div>
                            {ticket.reportedUser && (
                                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-1.5 py-0.5 rounded w-fit">
                                    <span className="font-bold">Acusado:</span> 
                                    {ticket.reportedUser.name}
                                </div>
                            )}
                        </div>
                      </td>
                      <td className="p-4 align-top text-right">
                        <span className={`text-[10px] px-2 py-1 rounded font-bold border ${
                          ticket.status === 'OPEN' ? 'bg-green-100 text-green-700 border-green-200' :
                          ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                          'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }`}>
                          {ticket.status}
                        </span>
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