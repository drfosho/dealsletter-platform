'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapControllerProps {
  center: [number, number];
  zoom: number;
}

export default function MapController({ center, zoom }: MapControllerProps) {
  const map = useMap();
  
  useEffect(() => {
    // Force the map to update view with animation
    map.flyTo(center, zoom, {
      duration: 0.5,
      animate: true
    });
  }, [map, center, zoom]);
  
  return null;
}