"use client"; // Indica que esto se renderiza en el cliente (navegador)

import { signIn, signOut, useSession } from "next-auth/react";
import { FaDiscord } from "react-icons/fa"; // Icono de Discord

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-col gap-8">
        
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Panel de Gestión GTA:W
        </h1>

        {session ? (
          // Si el usuario ESTÁ logueado
          <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
            <img 
              src={session.user?.image || ""} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-green-500"
            />
            <p className="text-xl mb-4">Bienvenido, {session.user?.name}</p>
            <p className="text-gray-400 mb-6">Acceso autorizado al sistema.</p>
            <button
              onClick={() => signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          // Si el usuario NO ESTÁ logueado
          <div className="text-center">
            <p className="mb-6 text-gray-400">Inicia sesión con tu cuenta de Discord para acceder.</p>
            <button
              onClick={() => signIn("discord")}
              className="flex items-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-3 rounded-lg text-lg font-bold transition shadow-lg shadow-indigo-500/20"
            >
              <FaDiscord size={24} />
              Entrar con Discord
            </button>
          </div>
        )}
      </div>
    </main>
  );
}