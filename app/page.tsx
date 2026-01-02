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
      <div 
        className="flex min-h-screen flex-col items-center justify-center text-white p-8 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/gtaw-bg.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay oscuro para mejor legibilidad */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        
        {/* Contenido principal */}
        <div className="relative z-10 text-center space-y-8 max-w-2xl">
          {/* Logo o título principal */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400 drop-shadow-2xl animate-pulse">
              GTA:W
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              Management System
            </h2>
          </div>
          
          <p className="text-gray-200 text-lg md:text-xl drop-shadow-md">
            Sistema Integral de Gestión y Soporte
          </p>
          
          {/* Botón de Discord mejorado */}
          <div className="pt-4">
            <button
              onClick={() => signIn("discord")}
              className="group flex items-center gap-3 bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#3c45a5] text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/80 hover:scale-105 mx-auto border-2 border-white/10"
            >
              <FaDiscord size={32} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>Conectar con Discord</span>
            </button>
          </div>

          {/* Mensaje informativo */}
          <div className="mt-8 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
            <p className="text-sm text-gray-300">
              Inicia sesión con tu cuenta de Discord para acceder al panel de gestión
            </p>
          </div>
        </div>

        {/* Decoración inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
    );
  }

  // 2. SI ESTÁ LOGUEADO: Muestra SOLO el contenido (El Layout pone el Sidebar y Topbar)
  return (
    <div className="space-y-6">
      {/* Banner Hero con imagen de fondo */}
      <div 
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{
          backgroundImage: 'url(/gtaw-banner.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '200px',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
        <div className="relative z-10 p-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2">
            Panel General
          </h1>
          <p className="text-xl text-gray-200 drop-shadow-md">
            Bienvenido de nuevo, <span className="font-bold text-purple-300">{session.user.name}</span>
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <span className="text-sm text-white font-medium">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Widgets con diseño mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Widget 1 - Estado de Cuenta */}
        <div className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:scale-105">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Estado de Cuenta</h3>
              <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">Activa</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <FaHome size={24} />
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
        </div>

        {/* Widget 2 - Mis Tickets */}
        <div className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:scale-105">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Mis Tickets</h3>
              <p className="text-3xl font-extrabold text-gray-800 dark:text-white">0</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <FaTicketAlt size={24} />
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"></div>
        </div>

        {/* Widget 3 - Rol Actual */}
        <div className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:scale-105">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Rol Actual</h3>
              <p className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-cyan-600 text-transparent bg-clip-text">
                {session.user.role}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-xl text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <FaHome size={24} />
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"></div>
        </div>
      </div>

      {/* Banner de Novedades Mejorado */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-l-4 border-blue-500 p-6 rounded-xl shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-blue-500 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-blue-700 dark:text-blue-300 font-bold text-lg mb-2">
              🎉 Novedades del Sistema
            </h3>
            <p className="text-blue-600 dark:text-blue-300 leading-relaxed">
              Ya puedes usar el <strong>Generador de Embeds</strong> y el <strong>Sistema de Tickets</strong> desde el menú lateral. 
              ¡Explora todas las nuevas funcionalidades disponibles!
            </p>
          </div>
        </div>
      </div>

      {/* Sección de acceso rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 p-6 rounded-xl border border-purple-300 dark:border-purple-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">📋 Acceso Rápido</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Accede a las funciones más utilizadas</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              Tickets
            </span>
            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              Reportes
            </span>
            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              Eventos
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 p-6 rounded-xl border border-cyan-300 dark:border-cyan-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">ℹ️ Información</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Estado del sistema y estadísticas</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Última conexión:</span>
              <span className="font-medium text-gray-800 dark:text-white">Ahora</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Estado servidor:</span>
              <span className="font-medium text-green-600 dark:text-green-400">● Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}