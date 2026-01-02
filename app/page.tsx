import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { FaDiscord, FaTicketAlt } from "react-icons/fa";
import LoginButton from "@/components/LoginButton";

export default async function Home() {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  const status = session ? "authenticated" : "unauthenticated";

  // 1. SI NO ESTÁ LOGUEADO:  Muestra pantalla de Login
  if (!session) {
    return (
      <div 
        className="fixed inset-0 w-full h-full overflow-auto flex flex-col items-center justify-center text-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
        style={{
          backgroundImage: "url('/login-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh"
        }}
      >
        {/* Overlay con blur */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
        
        {/* Contenido principal */}
        <div className="relative z-10 text-center space-y-6 sm:space-y-8 max-w-4xl w-full mx-auto">
          {/* Logo o título principal */}
          <div className="space-y-3 sm:space-y-4 px-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400 drop-shadow-2xl animate-pulse leading-tight">
              GTA:  W
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white drop-shadow-lg">
              Management System
            </h2>
          </div>
          
          <p className="text-gray-200 text-lg sm:text-xl md:text-2xl lg:text-3xl drop-shadow-md px-4 max-w-3xl mx-auto">
            Sistema Integral de Gestión y Soporte
          </p>
          
          {/* Botón de Discord mejorado y más grande */}
          <div className="pt-4 sm:pt-6 md:pt-8 px-4">
            <LoginButton />
          </div>

          {/* Mensaje informativo */}
          <div className="mt-6 sm:mt-8 md:mt-10 mx-4 p-4 sm:p-5 md:p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl max-w-2xl mx-auto">
            <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed">
              Inicia sesión con tu cuenta de Discord para acceder al panel de gestión
            </p>
          </div>
        </div>

        {/* Decoración inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 md:h-48 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
        
        {/* Elementos decorativos flotantes */}
        <div className="absolute top-20 left-10 w-20 h-20 sm:w-32 sm:h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 sm:w-48 sm:h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    );
  }

  // 2. SI ESTÁ LOGUEADO: Muestra SOLO el contenido con contador dinámico de tickets
  const currentUserId = parseInt(session.user.id);
  
  // Obtener el conteo real de tickets del usuario actual
  const ticketCount = await prisma.ticket.count({
    where: {
      AND: [
        { type: { notIn: ['USER_REPORT', 'FACTION_REPORT'] } },
        {
          OR: [
            { creatorId: currentUserId },
            { participants: { some: { id: currentUserId } } }
          ]
        }
      ]
    }
  });

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Banner Hero */}
      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl min-h-[200px] sm:min-h-[250px] md:min-h-[300px] bg-gradient-to-r from-purple-900 via-violet-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col justify-center h-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg mb-3">
            Panel General
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 drop-shadow-md">
            Bienvenido de nuevo, <span className="font-bold text-purple-300">{session.user.name}</span>
          </p>
          <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-3 rounded-full border border-white/20 w-fit">
            <span className="text-sm sm:text-base text-white font-medium">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long',
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6 max-w-md mx-auto">
        
        {/* Widget - Mis Tickets */}
        <div className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">Mis Tickets</h3>
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white">{ticketCount}</p>
            </div>
            <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <FaTicketAlt className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"></div>
        </div>
      </div>

      {/* Banner de Novedades */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-l-4 border-blue-500 p-6 sm:p-8 rounded-2xl shadow-lg backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="flex-shrink-0 p-3 bg-blue-500 rounded-xl">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-blue-700 dark:text-blue-300 font-bold text-xl sm:text-2xl mb-2">
              🎉 Novedades del Sistema
            </h3>
            <p className="text-base sm:text-lg text-blue-600 dark:text-blue-300 leading-relaxed">
              Ya puedes usar el <strong>Generador de Embeds</strong> y el <strong>Sistema de Tickets</strong> desde el menú lateral.   
              ¡Explora todas las nuevas funcionalidades disponibles!
            </p>
          </div>
        </div>
      </div>

      {/* Sección de acceso rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 p-6 sm:p-8 rounded-2xl border border-purple-300 dark:border-purple-700">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-3">📋 Acceso Rápido</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">Accede a las funciones más utilizadas</p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              Tickets
            </span>
            <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              Reportes
            </span>
            <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              Eventos
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 p-6 sm:p-8 rounded-2xl border border-cyan-300 dark:border-cyan-700">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-3">ℹ️ Información</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">Estado del sistema y estadísticas</p>
          <div className="space-y-3 text-sm sm:text-base">
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