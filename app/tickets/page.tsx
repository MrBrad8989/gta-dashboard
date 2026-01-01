import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { FaPlus, FaTicketAlt, FaBug, FaUserLock, FaQuestionCircle } from "react-icons/fa";

export default async function TicketsPage() {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session) return <div>Inicia sesión primero</div>;

  const currentUserId = parseInt(session.user.id);

  // FILTRO: Solo soporte técnico (EXCLUYENDO reportes de usuarios)
  const tickets = await prisma.ticket.findMany({
    where: {
      AND: [
        { type: { notIn: ['USER_REPORT', 'FACTION_REPORT'] } }, 
        {
          OR: [
            { creatorId: currentUserId },
            { participants: { some: { id: currentUserId } } }
          ]
        }
      ]
    },
    orderBy: { updatedAt: 'desc' },
    include: { messages: true }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'BUG_REPORT': return <FaBug className="text-red-500" />;
      case 'ACCOUNT_HELP': return <FaUserLock className="text-orange-500" />;
      default: return <FaQuestionCircle className="text-blue-500" />;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Soporte Técnico</h1>
          <p className="text-gray-500 dark:text-gray-400">Tus consultas sobre bugs, cuenta y dudas generales.</p>
        </div>
        <Link 
          href="/tickets/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition"
        >
          <FaPlus /> Abrir Ticket
        </Link>
      </div>

      <div className="grid gap-4">
        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <FaTicketAlt className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300">No tienes tickets de soporte</h3>
            <p className="text-gray-400 mt-2">Los reportes a jugadores están en la sección "Sala de Reportes".</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Link 
                key={ticket.id} 
                href={`/tickets/${ticket.id}`}
                className="block bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 text-2xl p-3 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800">
                      {getIcon(ticket.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">{ticket.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-1.5 rounded">
                              #{ticket.id}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {ticket.description.substring(0, 50)}...
                          </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                        ticket.status === 'OPEN' ? 'bg-green-100 text-green-700 border-green-200' : 
                        ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                        {ticket.status}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                  </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}