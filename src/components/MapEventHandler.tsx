'use client';

import { useMapEvents } from 'react-leaflet';

interface MapEventHandlerProps {
  onZoomEnd: (zoom: number) => void;
}

export default function MapEventHandler({ onZoomEnd }: MapEventHandlerProps) {
  useMapEvents({
    zoomend: (e) => {
      onZoomEnd(e.target.getZoom());
    }
  });
  
  return null;
}