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
  FaDiscord,      // Icono para el generador
  FaLifeRing      // Icono para soporte
} from "react-icons/fa";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const role = session.user.role;

  // Menú para TODOS los usuarios (General)
  const menuItems = [
    { name: "Inicio", path: "/", icon: <FaHome /> },
    { name: "Soporte / Tickets", path: "/tickets", icon: <FaLifeRing /> }, // Nuevo sistema
  ];

  // Opciones SOLO para Staff/Admins
  const adminItems = [
    { name: "Gestión Usuarios", path: "/admin/users", icon: <FaUsers /> },
    { name: "Mapa Global", path: "/admin/map", icon: <FaMapMarkedAlt /> },
    { name: "Reportes & Bugs", path: "/admin/reports", icon: <FaBug /> },
    { name: "Generador Embeds", path: "/tools/discord-embed", icon: <FaDiscord /> }, // Tu nueva herramienta
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col shadow-xl z-50">
      {/* Encabezado del Sidebar */}
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <img 
          src={session.user.image || "/default-avatar.png"} 
          alt="Avatar" 
          className="w-10 h-10 rounded-full border-2 border-indigo-500"
        />
        <div className="overflow-hidden">
          <h2 className="font-bold text-sm truncate">{session.user.name}</h2>
          <span className={`text-[10px] px-2 py-0.5 rounded text-white font-mono font-bold ${
            role === 'ADMIN' ? 'bg-red-600' : 'bg-indigo-600'
          }`}>
            {role}
          </span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Menú General */}
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">General</p>
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === item.path 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" 
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}

        {/* Sección Admin (Solo visible si es ADMIN) */}
        {role === "ADMIN" && (
          <>
            <div className="my-4 border-t border-gray-800"></div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Administración</p>
            {adminItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.path 
                    ? "bg-red-900 text-white shadow-lg shadow-red-900/30" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
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
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition"
        >
          <FaSignOutAlt />
          <span className="text-sm font-bold">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}