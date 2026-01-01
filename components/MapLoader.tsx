"use client"; // <--- Esto marca este archivo como Cliente

import dynamic from "next/dynamic";

// Aquí sí podemos usar ssr: false porque estamos en un entorno de cliente ("use client")
const GameMap = dynamic(() => import("./GameMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-gray-900 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span>Cargando Mapa de Los Santos...</span>
      </div>
    </div>
  ),
});

interface Property {
  id: number;
  address: string;
  type: string;
  price: number;
  posX: number;
  posY: number;
  ownerName?: string | null;
}

export default function MapLoader({ properties }: { properties: Property[] }) {
  return <GameMap properties={properties} />;
}