// src/components/MapLocationSelector.jsx
import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// Fix for default Leaflet icon not showing up correctly
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// Component to handle the map click and marker placement
function LocationMarker({ onLocationChange }) {
    const [position, setPosition] = useState(null);

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationChange(e.latlng);
        },
        locationfound(e) {
            // Optional: center map on user's current location on load
            // setPosition(e.latlng);
            // map.flyTo(e.latlng, map.getZoom());
        },
    });

    // Optional: map.locate() can be used here if needed

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}


const MapLocationSelector = ({ setFormData }) => {
    // Default start location (e.g., center of a major city or world map)
    const initialPosition = [28.644800, 77.216721]; 

    const handleLocationChange = (latlng) => {
        setFormData(prev => ({
            ...prev,
            latitude: latlng.lat,
            longitude: latlng.lng,
        }));
    };

    return (
        <div className="h-96 w-full rounded-lg overflow-hidden shadow-inner border border-gray-300">
            <MapContainer 
                center={initialPosition} 
                zoom={10} 
                scrollWheelZoom={false}
                className="h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onLocationChange={handleLocationChange} />
            </MapContainer>
        </div>
    );
};

export default MapLocationSelector;