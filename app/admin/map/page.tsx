import { prisma } from "@/lib/prisma";
import MapLoader from "@/components/MapLoader"; // Importamos el puente, no el mapa directo

async function getProperties() {
  const properties = await prisma.property.findMany();
  return properties;
}

export default async function MapPage() {
  const properties = await getProperties();

  // Cálculos simples para los contadores
  const casas = properties.filter(p => p.type === 'House').length;
  const negocios = properties.filter(p => p.type === 'Business').length;

  return (
    <div className="p-6 h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mapa Global de Propiedades</h1>
        <p className="text-gray-500">Visualización en tiempo real de {properties.length} inmuebles.</p>
      </header>

      <div className="flex-1 min-h-[600px]">
        {/* Usamos el MapLoader que se encarga de cargar Leaflet sin romper el servidor */}
        <MapLoader properties={properties} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
          <span className="block text-gray-500 text-xs font-bold uppercase">Total Casas</span>
          <span className="text-2xl font-bold text-gray-800">{casas}</span>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-purple-500">
          <span className="block text-gray-500 text-xs font-bold uppercase">Total Negocios</span>
          <span className="text-2xl font-bold text-gray-800">{negocios}</span>
        </div>
      </div>
    </div>
  );
}