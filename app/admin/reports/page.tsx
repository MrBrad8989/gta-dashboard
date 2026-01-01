import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  FaExternalLinkAlt,
  FaUserShield,
  FaExclamationCircle,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import Link from "next/link";

export default async function AdminReportsPage() {
  // @ts-ignore
  const session = await getServerSession(authOptions);

  // Seguridad: Solo Admins pueden entrar aquí
  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="p-8 text-red-500">
        Acceso Denegado. Área restringida al Staff.
      </div>
    );
  }

  // Buscamos TODOS los tickets (incluyendo datos del creador)
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" }, // Los más nuevos primero
    include: {
      creator: true, // Traemos el nombre y avatar de quien reportó
    },
  });

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <FaUserShield className="text-red-600" />
            Panel de Reportes
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Hay {tickets.filter((t) => t.status === "OPEN").length} tickets
            esperando atención.
          </p>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-sm">
                ID / Tipo
              </th>
              <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-sm">
                Asunto
              </th>
              <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-sm">
                Reportante
              </th>
              <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-sm">
                Pruebas
              </th>
              <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-sm">
                Estado
              </th>
              <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-sm">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <td className="p-4">
                  <span className="font-mono text-xs text-gray-400">
                    #{ticket.id}
                  </span>
                  <div className="text-xs font-bold text-indigo-500 uppercase mt-1">
                    {ticket.type.replace("_", " ")}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-gray-800 dark:text-gray-200">
                    {ticket.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px]">
                    {ticket.description}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={ticket.creator.avatar || "/default-avatar.png"}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {ticket.creator.name}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  {ticket.proofUrl ? (
                    <a
                      href={ticket.proofUrl}
                      target="_blank"
                      className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded flex items-center gap-1 w-fit hover:underline"
                    >
                      <FaExternalLinkAlt size={10} /> Ver Pruebas
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      Sin pruebas
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {ticket.status === "OPEN" && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">
                      ABIERTO
                    </span>
                  )}
                  {ticket.status === "CLOSED" && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold">
                      CERRADO
                    </span>
                  )}
                  {ticket.status === "IN_PROGRESS" && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold">
                      PROCESO
                    </span>
                  )}
                </td>
                <td className="p-4 align-top text-right">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-bold text-sm underline"
                  >
                    Gestionar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
