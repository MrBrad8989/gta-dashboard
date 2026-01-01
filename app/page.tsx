"use client";

import { signIn, useSession } from "next-auth/react";
import { FaDiscord, FaTicketAlt, FaHome } from "react-icons/fa";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Cargando...</div>;
  }

  // 1. SI NO ESTÁ LOGUEADO: Muestra pantalla de Login
  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-24">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            GTA:W Management
          </h1>
          <p className="text-gray-400 text-lg">Sistema Integral de Gestión y Soporte</p>
          <button
            onClick={() => signIn("discord")}
            className="flex items-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-3 rounded-xl text-lg font-bold transition shadow-lg shadow-indigo-500/20 mx-auto"
          >
            <FaDiscord size={28} />
            Acceder con Discord
          </button>
        </div>
      </div>
    );
  }

  // 2. SI ESTÁ LOGUEADO: Muestra SOLO el contenido (El Layout pone el Sidebar y Topbar)
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Panel General</h1>
          <p className="text-gray-500 dark:text-gray-400">Bienvenido de nuevo, {session.user.name}</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
          {new Date().toLocaleDateString()}
        </div>
      </header>

      {/* Widgets con Modo Oscuro Activado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Widget 1 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Estado de Cuenta</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">Activa</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
               <FaHome />
            </div>
          </div>
        </div>

        {/* Widget 2 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition hover:shadow-md">
           <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Mis Tickets</h3>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">0</p>
            </div>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
               <FaTicketAlt />
            </div>
          </div>
        </div>

        {/* Widget 3 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition hover:shadow-md">
           <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Rol Actual</h3>
              <p className="text-xl font-bold text-indigo-600 mt-2">{session.user.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Banner de Novedades */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded text-sm">
        <p className="text-blue-700 dark:text-blue-300">
          <strong>Novedad:</strong> Ya puedes usar el <strong>Generador de Embeds</strong> y el <strong>Sistema de Tickets</strong> desde el menú lateral.
        </p>
      </div>
    </div>
  );
}