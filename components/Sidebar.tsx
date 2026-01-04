"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FaHome, 
  FaUsers, 
  FaBug, 
  FaSignOutAlt, 
  FaMapMarkedAlt, 
  FaDiscord,
  FaLifeRing,
  FaGavel,
  FaCalendarAlt, 
  FaBroadcastTower,
  FaCrown,       
  FaShieldAlt,
  FaHeadset
} from "react-icons/fa";
import UserAvatar from "./UserAvatar";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const role = session.user.role;

  // --- DEFINICIÓN DE PERMISOS ---
  const isSuperAdmin = ['FOUNDER', 'ADMIN'].includes(role);
  const canManageTickets = ['FOUNDER', 'ADMIN', 'TRIAL_ADMIN', 'SUPPORT'].includes(role);

  // Menú General
  const menuItems = [
    { name:  "Inicio", path: "/", icon: <FaHome /> },
    { name: "Soporte / Tickets", path: "/tickets", icon: <FaLifeRing /> },
    { name: "Reportes", path: "/my-reports", icon:  <FaGavel /> },
    { name: "Eventos", path:  "/events", icon: <FaCalendarAlt /> },
  ];

  const getRoleBadge = () => {
    switch (role) {
      case 'FOUNDER': return <span className="text-[10px] px-2 py-0.5 rounded text-white font-mono font-bold bg-yellow-500 flex items-center gap-1"><FaCrown /> FOUNDER</span>;
      case 'ADMIN': return <span className="text-[10px] px-2 py-0.5 rounded text-white font-mono font-bold bg-red-600 flex items-center gap-1"><FaShieldAlt /> ADMIN</span>;
      case 'TRIAL_ADMIN': return <span className="text-[10px] px-2 py-0.5 rounded text-white font-mono font-bold bg-orange-500">TRIAL ADMIN</span>;
      case 'SUPPORT': return <span className="text-[10px] px-2 py-0.5 rounded text-white font-mono font-bold bg-green-600 flex items-center gap-1"><FaHeadset /> SUPPORT</span>;
      default: return <span className="text-[10px] px-2 py-0.5 rounded text-white font-mono font-bold bg-indigo-600">USUARIO</span>;
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-xl z-50 transition-colors duration-300">
      
      {/* Encabezado */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
        {/* ✅ CAMBIADO: Usar UserAvatar */}
        <UserAvatar 
          discordId={session. user.discordId}
          avatar={session.user.image || null}
          name={session. user.name}
          size="md"
          className="border-2 border-indigo-500"
        />
        <div className="overflow-hidden">
          <h2 className="font-bold text-sm truncate text-gray-800 dark:text-white">{session.user.name}</h2>
          <div className="mt-1">{getRoleBadge()}</div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-2">General</p>
        {menuItems.map((item) => (
          <Link 
            key={item. path} 
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === item.path 
                ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-white shadow-sm" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}

        {/* SECCIÓN STAFF */}
        {canManageTickets && (
          <>
            <div className="my-4 border-t border-gray-200 dark:border-gray-800"></div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-2">Administración</p>
            
            {isSuperAdmin && (
                <>
                    <Link href="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/users' ?  "bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}`}>
                        <span className="text-lg"><FaUsers /></span>
                        <span className="text-sm font-medium">Gestión Usuarios</span>
                    </Link>
                    <Link href="/admin/map" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/map' ? "bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}`}>
                        <span className="text-lg"><FaMapMarkedAlt /></span>
                        <span className="text-sm font-medium">Mapa Global</span>
                    </Link>
                     <Link href="/tools/discord-embed" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/tools/discord-embed' ? "bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover: text-white"}`}>
                        <span className="text-lg"><FaDiscord /></span>
                        <span className="text-sm font-medium">Generador Embeds</span>
                    </Link>
                </>
            )}

            <Link href="/admin/reports" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/reports' ?  "bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}`}>
                <span className="text-lg"><FaBug /></span>
                <span className="text-sm font-medium">Panel de Tickets</span>
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
        >
          <FaSignOutAlt />
          <span className="text-sm font-bold">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}