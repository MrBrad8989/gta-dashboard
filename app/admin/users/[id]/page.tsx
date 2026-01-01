import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { FaArrowLeft, FaUserTag, FaTicketAlt, FaGavel, FaEnvelope } from "react-icons/fa";

// Definimos el tipo de las props correctamente para Next.js 15/16
interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: Props) {
  // 1. ESPERAMOS A QUE SE RESUELVAN LOS PARÁMETROS
  const resolvedParams = await params;
  const userId = parseInt(resolvedParams.id);
  
  // Verificación de seguridad por si el ID no es un número
  if (isNaN(userId)) {
      return <div className="p-8 text-red-500 font-bold">ID de usuario inválido</div>;
  }

  // @ts-ignore
  const session = await getServerSession(authOptions);
  // Verificación de rol
  if (!session || !['FOUNDER', 'ADMIN'].includes(session.user.role)) {
      return <div className="p-8 text-red-500 font-bold">Acceso denegado</div>;
  }

  // Obtenemos usuario y TODA su actividad
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      createdTickets: { orderBy: { createdAt: 'desc' } },  // Tickets que abrió
      receivedReports: { orderBy: { createdAt: 'desc' }, include: { creator: true } } // Reportes contra él
    }
  });

  if (!user) return <div className="p-8 font-bold">Usuario no encontrado</div>;

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Cabecera */}
      <Link href="/admin/users" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition mb-4">
        <FaArrowLeft /> Volver al listado
      </Link>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex items-center gap-6">
        <img src={user.avatar || "/default-avatar.png"} className="w-24 h-24 rounded-full border-4 border-indigo-100 dark:border-gray-700" />
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{user.name}</h1>
            <p className="text-gray-500 font-mono">ID: {user.discordId}</p>
            <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded font-bold text-xs uppercase">{user.role}</span>
                {user.isBanned && <span className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs uppercase">USUARIO VETADO</span>}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COLUMNA 1: Tickets de Soporte (Lo que él pregunta) */}
        <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <FaTicketAlt className="text-indigo-500" /> Sus Tickets de Soporte
            </h2>
            <div className="space-y-3">
                {user.createdTickets.length === 0 ? <p className="text-gray-400 italic">No ha creado tickets.</p> : 
                user.createdTickets.map(ticket => (
                    <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition">
                        <div className="flex justify-between">
                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{ticket.title}</span>
                            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-900 px-2 rounded text-gray-500">{ticket.status}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </Link>
                ))}
            </div>
        </div>

        {/* COLUMNA 2: Reportes en su contra (Historial Delictivo) */}
        <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <FaGavel className="text-red-500" /> Reportes Recibidos (Acusado)
            </h2>
            <div className="space-y-3">
                {user.receivedReports.length === 0 ? <p className="text-gray-400 italic">Historial limpio. Ningún reporte.</p> : 
                user.receivedReports.map(report => (
                    <Link key={report.id} href={`/tickets/${report.id}`} className="block bg-red-50 dark:bg-red-900/10 p-4 rounded border border-red-100 dark:border-red-900/30 hover:border-red-500 transition">
                        <div className="flex justify-between">
                            <span className="font-bold text-sm text-red-800 dark:text-red-200">{report.title}</span>
                            <span className="text-xs font-bold text-red-600 bg-white px-2 rounded border border-red-200">{report.status}</span>
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                             <span className="text-gray-500">Denunciante: <b>{report.creator.name}</b></span>
                             <span className="text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}