import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";

// IMPORTANTE: Cargamos el mapa sin SSR (Server Side Rendering)
const GameMap = dynamic(() => import("@/components/GameMap"), {
  ssr: false, // Esto evita el error "window is not defined"
  loading: () => <div className="h-[600px] w-full bg-gray-900 flex items-center justify-center text-white">Cargando Mapa de Los Santos...</div>
});

async function getProperties() {
  const properties = await prisma.property.findMany();
  return properties;
}

export default async function MapPage() {
  const properties = await getProperties();

  return (
    <div className="p-6 h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mapa Global de Propiedades</h1>
        <p className="text-gray-500">Visualización en tiempo real de {properties.length} inmuebles.</p>
      </header>

      <div className="flex-1">
        {/* Aquí renderizamos el mapa con los datos de la DB */}
        <GameMap properties={properties} />
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
          <span className="block text-gray-500 text-xs">Total Casas</span>
          <span className="text-xl font-bold">{properties.filter(p => p.type === 'House').length}</span>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-purple-500">
          <span className="block text-gray-500 text-xs">Total Negocios</span>
          <span className="text-xl font-bold">{properties.filter(p => p.type === 'Business').length}</span>
        </div>
      </div>
    </div>
  );
}