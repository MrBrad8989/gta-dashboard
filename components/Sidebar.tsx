"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaBuilding, FaUsers, FaBug, FaSignOutAlt, FaMapMarkedAlt } from "react-icons/fa";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname(); // Para saber en qué página estamos y resaltarla

  // Si no hay sesión, no mostramos nada (o un esqueleto)
  if (!session) return null;

  const role = session.user.role; // "ADMIN" o "USER"

  const menuItems = [
    { name: "Inicio", path: "/", icon: <FaHome /> },
    { name: "Mis Propiedades", path: "/properties", icon: <FaBuilding /> },
  ];

  // Opciones SOLO para Staff/Admins
  const adminItems = [
    { name: "Gestión Usuarios", path: "/admin/users", icon: <FaUsers /> },
    { name: "Mapa Global (PM)", path: "/admin/map", icon: <FaMapMarkedAlt /> },
    { name: "Reportes & Bugs", path: "/admin/reports", icon: <FaBug /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col shadow-xl">
      {/* Encabezado del Sidebar */}
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <img 
          src={session.user.image || "/default-avatar.png"} 
          alt="Avatar" 
          className="w-10 h-10 rounded-full border-2 border-indigo-500"
        />
        <div>
          <h2 className="font-bold text-sm">{session.user.name}</h2>
          {/* CÓDIGO DE DEPURACIÓN */}
          <div className="flex flex-col mt-1">
             <span className="text-xs bg-yellow-600 px-2 py-1 rounded text-black font-bold font-mono">
               DEBUG: '{role}'
             </span>
             <span className="text-[10px] text-gray-400">
               ID: {session.user.id}
             </span>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Menú General */}
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">General</p>
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === item.path 
                ? "bg-indigo-600 text-white" 
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
                    ? "bg-red-900 text-white" 
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