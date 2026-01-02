"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  discordId: string;
  name: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
  lastLogin: string;
  isBanned: boolean;
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/users")
        .then(async (res) => {
          if (!res. ok) {
            const text = await res.text();
            throw new Error(`Error ${res.status}: ${text}`);
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setUsers(data);
            // Buscar el rol del usuario actual
            const currentUser = data.find((u: User) => u.discordId === session. user?. discordId);
            setCurrentUserRole(currentUser?.role || null);
          } else {
            setError("Formato de datos inválido");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error loading users:", err);
          setError(err.message || "Error al cargar usuarios");
          setLoading(false);
        });
    }
  }, [status, session]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al actualizar rol");
      }

      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err:  any) {
      console.error(err);
      alert(err.message || "Error al actualizar el rol");
    }
  };

  const handleBanToggle = async (userId: number, currentBan: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON. stringify({ userId, isBanned:  !currentBan }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al actualizar estado");
      }

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, isBanned: ! currentBan } : u))
      );
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al actualizar el estado del usuario");
    }
  };

  const getAvatarUrl = (user: User) => {
    if (!user.avatar) {
      return `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discordId) % 5}.png`;
    }
    
    return `https://cdn.discordapp.com/avatars/${user.discordId}/${user. avatar}.${
      user.avatar.startsWith("a_") ? "gif" : "png"
    }? size=128`;
  };

  const getRoleBadge = (role: string) => {
    const badges:  Record<string, { bg: string; text: string; emoji: string }> = {
      FOUNDER: { bg: "bg-purple-900", text: "text-purple-200", emoji: "👑" },
      ADMIN:  { bg: "bg-red-900", text: "text-red-200", emoji: "⚡" },
      TRIAL_ADMIN: { bg: "bg-orange-900", text: "text-orange-200", emoji: "🔰" },
      SUPPORT: { bg: "bg-blue-900", text: "text-blue-200", emoji: "🛠️" },
      USER: { bg: "bg-gray-700", text: "text-gray-200", emoji: "👤" },
    };

    const badge = badges[role] || badges. USER;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.emoji} {role. replace('_', '-')}
      </span>
    );
  };

  const canEditUser = (targetUser: User) => {
    // FOUNDER puede editar a todos
    if (currentUserRole === 'FOUNDER') return true;
    
    // Nadie puede editar al FOUNDER excepto el FOUNDER
    if (targetUser. role === 'FOUNDER') return false;
    
    // ADMIN puede editar a todos menos FOUNDER
    if (currentUserRole === 'ADMIN') return true;
    
    return false;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Cargando usuarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-2">❌ Error</h2>
          <p>{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">👥 Gestión de Usuarios</h1>
          <div className="text-sm text-gray-400">
            Total:  {users.length} usuarios
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">Avatar</th>
                  <th className="px-6 py-3 text-left">Usuario</th>
                  <th className="px-6 py-3 text-left">Discord ID</th>
                  <th className="px-6 py-3 text-left">Rol</th>
                  <th className="px-6 py-3 text-left">Registro</th>
                  <th className="px-6 py-3 text-left">Último Login</th>
                  <th className="px-6 py-3 text-left">Estado</th>
                  <th className="px-6 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={getAvatarUrl(user)}
                        alt={user.name || "Usuario"}
                        className="w-12 h-12 rounded-full ring-2 ring-gray-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discordId) % 5}.png`;
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {user.name || "Sin nombre"}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-sm">
                      {user.discordId}
                    </td>
                    <td className="px-6 py-4">
                      {canEditUser(user) ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e. target.value)}
                          className="bg-gray-700 border border-gray-600 rounded px-3 py-1. 5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          disabled={user.isBanned}
                        >
                          {currentUserRole === 'FOUNDER' && <option value="FOUNDER">👑 Fundador</option>}
                          <option value="ADMIN">⚡ Admin</option>
                          <option value="TRIAL_ADMIN">🔰 Trial Admin</option>
                          <option value="SUPPORT">🛠️ Soporte</option>
                          <option value="USER">👤 Usuario</option>
                        </select>
                      ) : (
                        getRoleBadge(user.role)
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("es-ES", {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(user.lastLogin).toLocaleDateString("es-ES", {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user. isBanned
                            ? "bg-red-900 text-red-200"
                            :  "bg-green-900 text-green-200"
                        }`}
                      >
                        {user.isBanned ? "🚫 Baneado" : "✅ Activo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {canEditUser(user) ? (
                        <button
                          onClick={() => handleBanToggle(user.id, user.isBanned)}
                          className={`px-4 py-2 rounded font-semibold text-sm transition-colors ${
                            user. isBanned
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {user.isBanned ? "Desbanear" : "Banear"}
                        </button>
                      ) : (
                        <span className="text-gray-500 text-sm">Sin permisos</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <div className="text-6xl mb-4">👥</div>
              <div className="text-xl">No hay usuarios registrados</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}