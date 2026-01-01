import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // Importa el archivo que acabamos de crear

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GTA:W Management",
  description: "Panel de control administrativo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}