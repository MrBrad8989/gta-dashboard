"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Arreglo para los iconos rotos por defecto en Leaflet
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

// Configuración de iconos
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

// Icono especial para Negocios (Color diferente si quisieras)
const businessIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Coordenadas del centro del mapa de GTA V (aprox)
const center: [number, number] = [0, 0]; 

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
  
  // GTA V usa un sistema de coordenadas plano (No latitud/longitud real)
  // Usamos CRS.Simple para mapear X/Y directamente
  
  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-lg border-2 border-gray-800 z-0">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        scrollWheelZoom={true}
        className="h-full w-full"
        crs={L.CRS.Simple} // Importante: Sistema de coordenadas simple para juegos
        minZoom={-2}
        maxZoom={5}
      >
        {/* Usamos tiles de un servidor público de mapas de GTA V */}
        <TileLayer
          url="https://gta-assets.cdn.rs/images/tiles/{z}/{x}/{y}.png"
          noWrap={true}
          attribution='&copy; <a href="https://gta-assets.cdn.rs/">GTA Assets</a>'
        />

        {properties.map((prop) => {
          // Leaflet usa [Lat, Lng]. En GTA: Lat = Y, Lng = X
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
                  <span className="text-xs font-mono bg-gray-200 px-1 rounded">{prop.type}</span>
                  <p className="my-1 text-green-600 font-bold">${prop.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    Dueño: {prop.ownerName || "En Venta"}
                  </p>
                  <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-xs w-full">
                    Gestionar
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}