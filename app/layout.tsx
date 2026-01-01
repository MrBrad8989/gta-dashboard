import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers"; // Importamos el theme
import Sidebar from "@/components/Sidebar";       // Importamos la Sidebar
import Topbar from "@/components/Topbar";         // Importamos la Topbar
import { getServerSession } from "next-auth";     // Para comprobar si hay login

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GTA:W Management",
  description: "Panel de Gestión",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(); // Comprobamos sesión en el servidor

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100`}>
        <Providers>
          {session ? (
            // SI ESTÁ LOGUEADO: Muestra el Layout completo (Sidebar + Topbar + Contenido)
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar Fija a la izquierda */}
              <Sidebar />
              
              {/* Columna Derecha */}
              <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Topbar />
                {/* El contenido de la página (children) va aquí con scroll propio */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-[#0b0c15] transition-colors duration-300">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            // SI NO ESTÁ LOGUEADO: Muestra solo el login (centrado)
            <main className="h-screen w-full flex items-center justify-center">
              {children}
            </main>
          )}
        </Providers>
      </body>
    </html>
  );
}