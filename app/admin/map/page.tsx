import { prisma } from "@/lib/prisma";
import MapLoader from "@/components/MapLoader";

async function getProperties() {
  const properties = await prisma.property.findMany();
  return properties;
}

export default async function MapPage() {
  const properties = await getProperties();

  const casas = properties.filter(p => p.type === 'House').length;
  const negocios = properties.filter(p => p.type === 'Business').length;

  return (
    <div className="p-6 h-full flex flex-col">
      <header className="mb-6">
        {/* Título adaptable */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mapa Global de Propiedades</h1>
        <p className="text-gray-500 dark:text-gray-400">Visualización en tiempo real de {properties.length} inmuebles.</p>
      </header>

      <div className="flex-1 min-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden relative">
        <MapLoader properties={properties} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tarjeta Casas */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow border-l-4 border-l-blue-500 border-y border-r border-gray-200 dark:border-gray-700">
          <span className="block text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Total Casas</span>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">{casas}</span>
        </div>
        
        {/* Tarjeta Negocios */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow border-l-4 border-l-purple-500 border-y border-r border-gray-200 dark:border-gray-700">
          <span className="block text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Total Negocios</span>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">{negocios}</span>
        </div>
      </div>
    </div>
  );
}