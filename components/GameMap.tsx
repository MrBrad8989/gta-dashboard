"use client";

import { MapContainer, ImageOverlay, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- ARREGLO DE ICONOS ---
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

const businessIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// --- LÍMITES DEL MAPA ---
// Definimos el tamaño del mundo de GTA en coordenadas planas.
// Ajusta estos números si el mapa se ve estirado.
// Formato: [[Y_min, X_min], [Y_max, X_max]]
const bounds: L.LatLngBoundsExpression = [[-4000, -4000], [8000, 6000]];

interface Property {
  id: number;
  address: string;
  type: string;
  price: number;
  posX: number;
  posY: number;
  ownerName?: string | null;
}

export default function GameMap({ properties }: { properties: Property[] }) {
  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-lg border-2 border-gray-800 z-0 bg-[#0fa8d2]">
      <MapContainer
        center={[2000, 1000]} // Centro aproximado
        zoom={-1}             // Zoom inicial bajo para ver toda la imagen
        minZoom={-2}
        maxZoom={2}
        crs={L.CRS.Simple}    // Sistema de coordenadas simple (Plano)
        className="h-full w-full"
        maxBounds={bounds}
      >
        {/* EN LUGAR DE TILELAYER, USAMOS IMAGEOVERLAY.
           Carga la imagen desde tu carpeta 'public' local. 
           Nunca fallará por DNS o servidores caídos.
        */}
        <ImageOverlay
          url="/gta-map.jpg"
          bounds={bounds}
        />

        {properties.map((prop) => {
          // Ajuste de Coordenadas: [Y, X]
          // Si los puntos no coinciden con el mapa, ajusta los números del 'bounds' arriba.
          const position: [number, number] = [prop.posY, prop.posX];

          return (
            <Marker 
              key={prop.id} 
              position={position}
              icon={prop.type === 'Business' ? businessIcon : defaultIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong className="block text-lg">{prop.address}</strong>
                  <span className="text-xs font-mono bg-gray-200 px-1 rounded text-black font-bold">
                    {prop.type}
                  </span>
                  <p className="my-1 text-green-600 font-bold">${prop.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">
                    X: {prop.posX} | Y: {prop.posY}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}