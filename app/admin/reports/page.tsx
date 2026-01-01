import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { FaUserShield, FaClipboardList, FaCheckCircle, FaExternalLinkAlt } from "react-icons/fa";

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

  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    include: { creator: true }
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <FaClipboardList className="text-indigo-600" />
            Reportes y Tickets
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Haz clic en un ticket para ver el chat y gestionarlo.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Pendientes</span>
          <div className="text-2xl font-bold text-indigo-600">
            {tickets.filter(t => t.status === 'OPEN').length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {tickets.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
             <FaCheckCircle className="text-6xl text-green-200 dark:text-green-900 mb-4" />
             <h3 className="text-xl font-bold text-gray-800 dark:text-white">Todo Limpio</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">ID / Tipo</th>
                  <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Asunto (Click para ver)</th>
                  <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Reportante</th>
                  <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Pruebas</th>
                  <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                    <td className="p-4 align-top">
                      <Link href={`/tickets/${ticket.id}`} className="block">
                          <span className="font-mono text-xs text-gray-400 group-hover:text-indigo-500 transition">#{ticket.id}</span>
                          <div className="text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded w-fit mt-1">
                            {ticket.type}
                          </div>
                      </Link>
                    </td>
                    <td className="p-4 align-top max-w-xs">
                      {/* Enlace principal en el Título */}
                      <Link href={`/tickets/${ticket.id}`} className="block">
                          <div className="font-bold text-gray-800 dark:text-gray-200 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                             {ticket.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2 cursor-pointer">
                             {ticket.description}
                          </div>
                      </Link>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <img src={ticket.creator.avatar || "/default-avatar.png"} className="w-6 h-6 rounded-full" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ticket.creator.name}</span>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      {ticket.proofUrl ? (
                        <a href={ticket.proofUrl} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                          <FaExternalLinkAlt size={10} /> Link
                        </a>
                      ) : <span className="text-gray-300">--</span>}
                    </td>
                    <td className="p-4 align-top">
                      <span className={`text-xs px-2 py-1 rounded font-bold border ${
                        ticket.status === 'OPEN' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {ticket.status === 'OPEN' ? 'ABIERTO' : ticket.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}