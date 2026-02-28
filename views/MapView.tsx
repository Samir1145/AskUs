import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ArrowLeft } from 'lucide-react';

interface MapViewProps {
  onBack: () => void;
}

const MapView: React.FC<MapViewProps> = ({ onBack }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Fix for Leaflet icons not showing up correctly in some bundler/environments
      // We manually set the image paths if needed, but often basic tiles work fine.

      const map = L.map(mapContainerRef.current, {
        zoomControl: false // We can add custom controls or position them
      }).setView([20.5937, 78.9629], 5); // Default to India view or generic

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      mapInstanceRef.current = map;

      // Force a resize calculation after mount to ensure full width/height
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      // Add dummy markers to simulate members around the area
      const markers = [
        { lat: 20.5937, lng: 78.9629, label: 'Tribe Kitchen Enthusiast' },
        { lat: 19.0760, lng: 72.8777, label: 'Tech Circles Member' },
        { lat: 28.7041, lng: 77.1025, label: 'Design Circles Member' },
        { lat: 12.9716, lng: 77.5946, label: 'Fitness Circle Leader' }
      ];

      // Custom icon using Leaflet logic
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: #6B21A8; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      markers.forEach(member => {
        L.marker([member.lat, member.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`<div style="font-weight: bold; font-family: sans-serif;">${member.label}</div><div style="color: gray; font-size: 10px;">Taco Tribe Member</div>`);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white relative animate-in fade-in duration-300">
      <header className="absolute top-0 left-0 right-0 z-[1000] p-4 pointer-events-none">
        <div className="flex justify-between items-start">
          <button
            onClick={onBack}
            className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg text-gray-700 hover:bg-white pointer-events-auto transition-transform active:scale-95 border border-gray-100"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
      </header>

      <div ref={mapContainerRef} className="w-full h-full z-0 bg-gray-100" />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-100 pointer-events-none">
        <span className="text-xs font-bold text-gray-600">Location View</span>
      </div>
    </div>
  );
};

export default MapView;