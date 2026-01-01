import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { FaGavel, FaPlus, FaClock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default async function MyReportsPage() {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session) return <div>Inicia sesión primero</div>;

  const currentUserId = parseInt(session.user.id);

  // BUSCAMOS SOLO REPORTES (Enviados por mí, recibidos contra mí, o donde participo)
  const reports = await prisma.ticket.findMany({
    where: {
      AND: [
        { type: { in: ['USER_REPORT', 'FACTION_REPORT'] } }, // SOLO TIPO REPORTE
        {
          OR: [
            { creatorId: currentUserId },
            { participants: { some: { id: currentUserId } } },
            { reportedUserId: currentUserId }
          ]
        }
      ]
    },
    orderBy: { updatedAt: 'desc' },
    include: { reportedUser: true }
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-500 flex items-center gap-3">
            <FaGavel /> Mis Reportes
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Historial de denuncias enviadas y recibidas.</p>
        </div>
        <Link 
          href="/reports/new" 
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition"
        >
          <FaPlus /> Nuevo Reporte
        </Link>
      </div>

      <div className="grid gap-4">
        {reports.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-red-200 dark:border-red-900/30">
            <FaGavel className="mx-auto text-4xl text-red-200 dark:text-red-900 mb-4" />
            <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300">No hay reportes activos</h3>
            <p className="text-gray-400 mt-2">Usa el botón "Nuevo Reporte" para crear uno.</p>
          </div>
        ) : (
          reports.map((report) => {
            const isReceived = report.reportedUserId === currentUserId; 

            return (
              <Link 
                  key={report.id} 
                  href={`/tickets/${report.id}`} 
                  className={`block bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm hover:shadow-md transition group ${
                      isReceived 
                        ? 'border-l-4 border-l-red-600 border-y-red-100 dark:border-y-red-900/30' 
                        : 'border-gray-200 dark:border-gray-700'
                  }`}
              >
                <div className="flex justify-between items-center">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 text-2xl p-3 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600">
                        {report.status === 'OPEN' ? <FaExclamationCircle /> : 
                         report.status === 'CLOSED' ? <FaCheckCircle /> : <FaClock />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-red-600 transition">
                              {report.title}
                            </h3>
                            {isReceived && (
                                <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded uppercase">
                                    CONTRA TI
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                             {report.reportedUser ? `Acusado: ${report.reportedUser.name}` : 'Reporte Formal'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600">
                        {report.status}
                    </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}