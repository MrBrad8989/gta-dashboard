import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { FaUsers, FaSearch, FaUserShield, FaBan, FaEye } from "react-icons/fa";
import { updateUserRole, toggleUserBan } from "@/app/actions/userActions";

export default async function UserManagementPage() {
  // @ts-ignore
  const session = await getServerSession(authOptions);

  // Seguridad: Solo Founder y Admin entran
  if (!session || !['FOUNDER', 'ADMIN'].includes(session.user.role)) {
    return <div className="p-10 text-center text-red-500 font-bold">Acceso Denegado</div>;
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { createdTickets: true, receivedReports: true } } }
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <FaUsers className="text-indigo-600" /> Gestión de Usuarios
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Administra roles, accesos y revisa historiales.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm">
            Total Registrados: <b>{users.length}</b>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase">Usuario</th>
                <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase">Rol Actual</th>
                <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase">Estado</th>
                <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase text-center">Tickets / Reportes</th>
                <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img src={user.avatar || "/default-avatar.png"} className="w-10 h-10 rounded-full border border-gray-200" />
                    <div>
                        <div className="font-bold text-gray-800 dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{user.discordId}</div>
                    </div>
                  </td>
                  
                  {/* SELECTOR DE ROL */}
                  <td className="p-4">
                    <form action={async (formData) => {
                        "use server";
                        await updateUserRole(user.id, formData.get("role") as string);
                    }}>
                        <select 
                            name="role" 
                            defaultValue={user.role}
                            // Auto-submit al cambiar (Truco JS en servidor: requiere botón o client component, 
                            // pero para simplificar ponemos un botón discreto o usamos onChange en un client component.
                            // Para hacerlo fácil aquí, pondremos un botón pequeño de guardar si cambias)
                            className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-xs rounded p-1 text-gray-800 dark:text-white font-bold cursor-pointer"
                        >
                            <option value="USER">USUARIO</option>
                            <option value="SUPPORT">SUPPORT</option>
                            <option value="TRIAL_ADMIN">TRIAL ADMIN</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="FOUNDER">FOUNDER</option>
                        </select>
                        <button type="submit" className="ml-2 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded hover:bg-indigo-700">Guardar</button>
                    </form>
                  </td>

                  <td className="p-4">
                    {user.isBanned ? (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">
                            <FaBan /> VETADO
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">
                            <FaUserShield /> ACTIVO
                        </span>
                    )}
                  </td>

                  <td className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-bold text-indigo-600">{user._count.createdTickets}</span> <span className="text-xs">creados</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="font-bold text-red-600">{user._count.receivedReports}</span> <span className="text-xs">recibidos</span>
                  </td>

                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    {/* Botón Ver Perfil Completo */}
                    <Link href={`/admin/users/${user.id}`} className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition" title="Ver Historial">
                        <FaEye />
                    </Link>

                    {/* Botón Banear */}
                    <form action={async () => {
                        "use server";
                        await toggleUserBan(user.id);
                    }}>
                        <button 
                            className={`p-2 rounded transition text-white ${user.isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            title={user.isBanned ? "Quitar Veto" : "Vetar Usuario"}
                        >
                            {user.isBanned ? <FaUserShield /> : <FaBan />}
                        </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}