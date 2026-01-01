"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaMoon, FaSun, FaBars } from "react-icons/fa";

export default function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita errores de hidratación esperando a que cargue el cliente
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-16 bg-gray-900 border-b border-gray-800"></div>;

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 transition-colors duration-300">
      
      {/* Lado Izquierdo: Título o Breadcrumbs */}
      <div className="flex items-center gap-4">
        <h2 className="text-gray-800 dark:text-white font-bold text-lg hidden md:block">
          Panel de Control
        </h2>
      </div>

      {/* Lado Derecho: Acciones */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          aria-label="Cambiar Tema"
        >
          {theme === "dark" ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
        </button>
      </div>
    </header>
  );
}