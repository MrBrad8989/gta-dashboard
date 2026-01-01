"use client";

import { signIn, useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar"; // Importamos nuestro componente
import { FaDiscord } from "react-icons/fa";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Cargando...</div>;
  }

  // 1. SI NO ESTÁ LOGUEADO: Muestra pantalla de Login
  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-24">
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
      </main>
    );
  }

  // 2. SI ESTÁ LOGUEADO: Muestra el Dashboard con Sidebar
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Barra Lateral Fija */}
      <Sidebar />

      {/* Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Panel General</h1>
          <div className="text-sm text-gray-500">
            Último acceso: {new Date().toLocaleDateString()}
          </div>
        </header>

        {/* Widgets de Ejemplo (Resumen) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Estado de Cuenta</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">Activa</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Mis Propiedades</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Tickets Abiertos</h3>
            <p className="text-2xl font-bold text-indigo-600 mt-2">Ninguno</p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-blue-700">
            <strong>Novedad:</strong> Bienvenido al nuevo sistema de gestión. Usa el menú lateral para navegar.
          </p>
        </div>
      </main>
    </div>
  );
}