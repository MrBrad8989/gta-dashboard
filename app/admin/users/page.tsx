"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";  // ← AÑADIR

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
  // ...  resto del código igual ... 

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">👥 Gestión de Usuarios</h1>
          <div className="text-sm text-gray-400">
            Total: {users.length} usuarios
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
                    {/* ✅ CAMBIAR ESTE TD */}
                    <td className="px-6 py-4">
                      <UserAvatar 
                        discordId={user.discordId}
                        avatar={user.avatar}
                        name={user.name}
                        size="lg"
                        className="ring-2 ring-gray-700"
                      />
                    </td>
                    {/* ...  resto del código igual ... */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}