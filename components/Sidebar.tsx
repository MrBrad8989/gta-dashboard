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
  FaLifeRing
} from "react-icons/fa";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const role = session.user.role;

  const menuItems = [
    { name: "Inicio", path: "/", icon: <FaHome /> },
    { name: "Soporte / Tickets", path: "/tickets", icon: <FaLifeRing /> },
    // Si ya creaste la página de mis reportes, descomenta esto:
    // { name: "Mis Reportes", path: "/my-reports", icon: <FaGavel /> },
  ];

  const adminItems = [
    { name: "Gestión Usuarios", path: "/admin/users", icon: <FaUsers /> },
    { name: "Mapa Global", path: "/admin/map", icon: <FaMapMarkedAlt /> },
    { name: "Reportes & Bugs", path: "/admin/reports", icon: <FaBug /> },
    { name: "Generador Embeds", path: "/tools/discord-embed", icon: <FaDiscord /> },
  ];

  return (
    // CAMBIO 1: Fondo dinámico (Blanco en día, Gris oscuro en noche) y borde derecho
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-xl z-50 transition-colors duration-300">
      
      {/* Encabezado */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
        <img 
          src={session.user.image || "/default-avatar.png"} 
          alt="Avatar" 
          className="w-10 h-10 rounded-full border-2 border-indigo-500"
        />
        <div className="overflow-hidden">
          {/* Texto dinámico */}
          <h2 className="font-bold text-sm truncate text-gray-800 dark:text-white">{session.user.name}</h2>
          <span className={`text-[10px] px-2 py-0.5 rounded text-white font-mono font-bold ${
            role === 'ADMIN' ? 'bg-red-600' : 'bg-indigo-600'
          }`}>
            {role}
          </span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-2">General</p>
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === item.path 
                // Activo: Indigo claro en día, Indigo oscuro en noche
                ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-white shadow-sm" 
                // Inactivo: Gris oscuro en día, Gris claro en noche
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}

        {role === "ADMIN" && (
          <>
            <div className="my-4 border-t border-gray-200 dark:border-gray-800"></div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-2">Administración</p>
            {adminItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.path 
                    ? "bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-white shadow-sm" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Botón Salir */}
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