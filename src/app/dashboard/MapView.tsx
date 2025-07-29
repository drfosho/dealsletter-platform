'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Supercluster from 'supercluster';

// Dynamic imports for Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const MapController = dynamic(() => import('@/components/MapController'), { ssr: false });

interface Deal {
  id: number;
  title: string;
  location: string;
  type: string;
  strategy: string;
  price: number;
  downPayment: number;
  confidence: string;
  totalROI?: number;
  coordinates?: [number, number];
  [key: string]: unknown;
}

interface MapViewProps {
  deals: Deal[];
  selectedLocation?: {
    city: string;
    state: string;
    fullAddress: string;
    coordinates?: { lat: number; lng: number };
  } | null;
  onDealClick: (deal: Deal) => void;
}

// Fix default icon issue with Leaflet
if (typeof window !== 'undefined') {
  delete (Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
}


const MapView = ({ deals, selectedLocation, onDealClick }: MapViewProps) => {
  const [zoom, setZoom] = useState(9);
  const [center, setCenter] = useState<[number, number]>([32.7157, -117.1611]); // Default to San Diego

  // Update map center when location is selected
  useEffect(() => {
    if (selectedLocation?.coordinates) {
      setCenter([selectedLocation.coordinates.lat, selectedLocation.coordinates.lng]);
      setZoom(12); // Zoom in closer for selected location
    }
  }, [selectedLocation]);

  // Convert location strings to coordinates (simplified geocoding)
  const dealsWithCoords = useMemo(() => {
    const locationCoords: { [key: string]: [number, number] } = {
      'San Diego, CA 92113': [32.7030, -117.1276],
      'San Diego, CA 92110': [32.7767, -117.2073],
      'Oakland, CA 94605': [37.7516, -122.1430],
      'Tampa, FL 33609': [27.9407, -82.5107],
      'Lafayette, CA 94549': [37.8857, -122.1180],
      'San Leandro, CA 94578': [37.7249, -122.1561]
    };

    return deals.map(deal => ({
      ...deal,
      coordinates: locationCoords[deal.location] || [32.7157, -117.1611] // Default to San Diego
    }));
  }, [deals]);

  // Setup clustering
  const { clusters, supercluster } = useMemo(() => {
    const points = dealsWithCoords.map(deal => ({
      type: 'Feature' as const,
      properties: {
        cluster: false,
        dealId: deal.id,
        deal: deal
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [deal.coordinates![1], deal.coordinates![0]] // Note: Leaflet uses [lat, lng]
      }
    }));

    const supercluster = new Supercluster({
      radius: 75,
      maxZoom: 20
    });

    supercluster.load(points);

    const clusters = supercluster.getClusters([-180, -85, 180, 85], Math.floor(zoom));

    return { clusters, supercluster };
  }, [dealsWithCoords, zoom]);

  // Get pin color based on ROI
  const getPinColor = useCallback((deal: Deal) => {
    const roi = deal.totalROI || 0;
    if (roi >= 50) return '#10B981'; // Green for high ROI
    if (roi >= 25) return '#F59E0B'; // Yellow for medium ROI
    return '#EF4444'; // Red for low ROI
  }, []);

  // Create custom icon for markers
  const createIcon = useCallback((color: string) => {
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="12" r="3" fill="white"/>
        </svg>
      `)}`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  }, []);

  // Create cluster icon
  const createClusterIcon = useCallback((count: number) => {
    const size = 10 + (count / 100) * 20;
    return new DivIcon({
      html: `<div style="
        background: #3b82f6;
        color: white;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        width: ${Math.max(32, size)}px;
        height: ${Math.max(32, size)}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
      ">${count}</div>`,
      className: 'leaflet-cluster-icon',
      iconSize: [Math.max(32, size), Math.max(32, size)]
    });
  }, []);

  const onClusterClick = useCallback((clusterId: number) => {
    const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(clusterId), 20);
    // Update zoom state for cluster recalculation
    setZoom(expansionZoom);
  }, [supercluster]);

  return (
    <div className="w-full h-[calc(100vh-200px)] md:h-[600px] bg-card rounded-lg overflow-hidden border border-border/60 relative">
      {/* Property count indicator */}
      <div className="absolute top-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border/60">
        <div className="text-sm font-medium text-primary">
          {deals.length} {deals.length === 1 ? 'property' : 'properties'}
          {selectedLocation && (
            <span className="text-muted ml-1">in {selectedLocation.city}</span>
          )}
        </div>
      </div>
      
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        className="leaflet-dark"
      >
        {/* Map controller for centering */}
        <MapController center={center} zoom={zoom} />
        
        {/* Dark themed tile layer using CartoDB Dark Matter */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Render markers */}
        {clusters.map((cluster) => {
          const [lng, lat] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } = cluster.properties;

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                position={[lat, lng]}
                icon={createClusterIcon(pointCount)}
                eventHandlers={{
                  click: () => onClusterClick(cluster.id as number)
                }}
              />
            );
          }

          const deal = cluster.properties.deal;
          return (
            <Marker
              key={`deal-${deal.id}`}
              position={[lat, lng]}
              icon={createIcon(getPinColor(deal))}
            >
              <Popup className="leaflet-dark-popup">
                <div className="min-w-[280px] p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sm">{deal.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{deal.location}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs font-medium">
                      {deal.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Price</span>
                      <span className="text-sm font-semibold">
                        ${deal.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Strategy</span>
                      <span className="text-sm font-medium">{deal.strategy}</span>
                    </div>
                    {deal.totalROI && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">ROI</span>
                        <span 
                          className="text-sm font-semibold"
                          style={{ color: getPinColor(deal) }}
                        >
                          {deal.totalROI.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onDealClick(deal)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;