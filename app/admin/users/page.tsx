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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/users")
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Error ${res.status}: ${text}`);
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setUsers(data);
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
  }, [status]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) throw new Error("Error al actualizar rol");

      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el rol");
    }
  };

  const handleBanToggle = async (userId: number, currentBan: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method:  "PATCH",
        headers:  { "Content-Type": "application/json" },
        body:  JSON.stringify({ userId, isBanned: !currentBan }),
      });

      if (!res.ok) throw new Error("Error al actualizar estado");

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, isBanned: ! currentBan } : u))
      );
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el estado del usuario");
    }
  };

  const getAvatarUrl = (user: User) => {
    if (!user.avatar) {
      return `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discordId) % 5}.png`;
    }
    
    return `https://cdn.discordapp.com/avatars/${user. discordId}/${user. avatar}.${
      user.avatar.startsWith("a_") ? "gif" : "png"
    }? size=128`;
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
        <h1 className="text-3xl font-bold mb-6">👥 Gestión de Usuarios</h1>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
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
                  <tr key={user.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <img
                        src={getAvatarUrl(user)}
                        alt={user. name || "Usuario"}
                        className="w-12 h-12 rounded-full"
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
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
                        disabled={user.isBanned}
                      >
                        <option value="USER">Usuario</option>
                        <option value="MODERATOR">Moderador</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(user.lastLogin).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          user.isBanned
                            ? "bg-red-900 text-red-200"
                            : "bg-green-900 text-green-200"
                        }`}
                      >
                        {user. isBanned ? "🚫 Baneado" : "✅ Activo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleBanToggle(user.id, user.isBanned)}
                        className={`px-4 py-2 rounded font-semibold text-sm ${
                          user.isBanned
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {user.isBanned ? "Desbanear" : "Banear"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No hay usuarios registrados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}