"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react"; // <--- Faltaba importar esto

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // Envolvemos todo en SessionProvider para que useSession funcione en Sidebar y Pages
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}