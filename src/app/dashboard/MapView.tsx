'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl, 
  FullscreenControl, 
  ScaleControl,
  GeolocateControl,
  MapRef
} from 'react-map-gl/mapbox';
import Supercluster from 'supercluster';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Deal {
  id: number;
  title: string;
  location: string;
  type: string;
  strategy: string;
  price: number;
  downPayment: number;
  confidence: string;
  totalROI?: number | null;
  coordinates?: [number, number];
  [key: string]: unknown;
}

interface MapViewProps {
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

// Mapbox public token - in production, use environment variable
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGVhbHNsZXR0ZXIiLCJhIjoiY2x3bGF2OGp4MDM0cDJqbnh4Z3NrMzdwdiJ9.J4j9J6iZ2yIpD4tTD9Y0vw';

const MapView = ({ deals, onDealClick }: MapViewProps) => {
  const [popupInfo, setPopupInfo] = useState<Deal | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -117.1611, // San Diego center
    latitude: 32.7157,
    zoom: 9
  });

  const mapRef = useRef<MapRef>(null);

  // Convert location strings to coordinates (simplified geocoding)
  const dealsWithCoords = useMemo(() => {
    const locationCoords: { [key: string]: [number, number] } = {
      'San Diego, CA 92113': [-117.1276, 32.7030],
      'San Diego, CA 92110': [-117.2073, 32.7767],
      'Oakland, CA 94605': [-122.1430, 37.7516],
      'Tampa, FL 33609': [-82.5107, 27.9407],
      'Lafayette, CA 94549': [-122.1180, 37.8857],
      'San Leandro, CA 94578': [-122.1561, 37.7249]
    };

    return deals.map(deal => ({
      ...deal,
      coordinates: locationCoords[deal.location] || [-117.1611, 32.7157] // Default to San Diego
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
        coordinates: deal.coordinates
      }
    }));

    const supercluster = new Supercluster({
      radius: 75,
      maxZoom: 20
    });

    supercluster.load(points);

    const clusters = supercluster.getClusters([-180, -85, 180, 85], Math.floor(viewState.zoom));

    return { clusters, supercluster };
  }, [dealsWithCoords, viewState.zoom]);

  // Get pin color based on ROI
  const getPinColor = useCallback((deal: Deal) => {
    const roi = deal.totalROI || 0;
    if (roi >= 50) return '#10B981'; // Green for high ROI
    if (roi >= 25) return '#F59E0B'; // Yellow for medium ROI
    return '#EF4444'; // Red for low ROI
  }, []);

  // Dark theme map style
  const mapStyle = 'mapbox://styles/mapbox/dark-v11';

  const onMapClick = useCallback(() => {
    setPopupInfo(null);
  }, []);

  const onMarkerClick = useCallback((deal: Deal, event: { originalEvent: { stopPropagation: () => void } }) => {
    event.originalEvent.stopPropagation();
    setPopupInfo(deal);
  }, []);

  const onClusterClick = useCallback((clusterId: number, event: { originalEvent: { stopPropagation: () => void } }) => {
    event.originalEvent.stopPropagation();
    const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(clusterId), 20);
    const cluster = clusters.find(c => c.properties.cluster_id === clusterId);
    
    if (cluster) {
      setViewState({
        ...viewState,
        longitude: cluster.geometry.coordinates[0],
        latitude: cluster.geometry.coordinates[1],
        zoom: expansionZoom,
      });
    }
  }, [clusters, supercluster, viewState]);

  return (
    <div className="w-full h-[600px] bg-card rounded-lg overflow-hidden border border-border/60 relative">
      
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={onMapClick}
        interactiveLayerIds={[]}
      >
        {/* Map Controls */}
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <ScaleControl position="bottom-left" />
        <GeolocateControl
          position="top-right"
          trackUserLocation={true}
          showUserHeading={true}
        />

        {/* Clustered Markers */}
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } = cluster.properties;

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                longitude={longitude}
                latitude={latitude}
                anchor="center"
                onClick={(e) => onClusterClick(cluster.id as number, e)}
              >
                <div
                  className="bg-accent text-white rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200 flex items-center justify-center font-bold text-sm"
                  style={{
                    width: `${10 + (pointCount / 100) * 20}px`,
                    height: `${10 + (pointCount / 100) * 20}px`,
                    minWidth: '32px',
                    minHeight: '32px'
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          const deal = cluster.properties.deal;
          return (
            <Marker
              key={`deal-${deal.id}`}
              longitude={longitude}
              latitude={latitude}
              anchor="bottom"
              onClick={(e) => onMarkerClick(deal, e)}
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200 flex items-center justify-center"
                style={{ backgroundColor: getPinColor(deal) }}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </Marker>
          );
        })}

        {/* Popup */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.coordinates?.[0] || 0}
            latitude={popupInfo.coordinates?.[1] || 0}
            anchor="top"
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
            className="map-popup"
          >
            <div className="bg-card p-4 rounded-lg border border-border/60 min-w-[280px]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-primary text-sm">{popupInfo.title}</h3>
                  <p className="text-xs text-muted mt-1">{popupInfo.location}</p>
                </div>
                <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                  {popupInfo.type}
                </span>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted">Price</span>
                  <span className="text-sm font-semibold text-primary">
                    ${popupInfo.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted">Strategy</span>
                  <span className="text-sm font-medium text-primary">{popupInfo.strategy}</span>
                </div>
                {popupInfo.totalROI && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">ROI</span>
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: getPinColor(popupInfo) }}
                    >
                      {popupInfo.totalROI.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => {
                  onDealClick(popupInfo);
                  setPopupInfo(null);
                }}
                className="w-full px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapView;