import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './DeliveryMap.module.css';
import { LiveTrackingState } from '../hooks/useLiveTracking';

// Note: To render React components to HTML for Leaflet DivIcons safely, we use ReactDOMServer in a real app,
// but for simplicity and bundle size, we can construct the HTML strings directly.

const createMarkerIcon = (iconSvg: string, iconColor: string = '#07C2BB', bgColor: string = 'rgba(255, 255, 255, 0.85)') => {
  return L.divIcon({
    className: styles.markerWrapper,
    html: `
      <div style="position: absolute; bottom: 0; left: -500px; width: 1000px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; pointer-events: none;">
        <div class="${styles.markerLabel}" style="pointer-events: auto; margin-bottom: 12px; background: ${bgColor};">
          <div class="${styles.markerIconBox}" style="color: ${iconColor};">
            ${iconSvg}
          </div>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0], 
  });
};

const createRiderIcon = (heading: number = 0) => {
  return L.divIcon({
    className: styles.riderMarkerWrapper,
    html: `
      <div style="position: absolute; bottom: 0; left: -500px; width: 1000px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; pointer-events: none;">
        <div id="rider-scooty-g" style="pointer-events: auto; margin-bottom: -30px; z-index: 10; display: flex; justify-content: center; align-items: center; transform-origin: center; transition: transform 0.2s linear;">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="60" viewBox="0 0 40 60" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3));">
            <!-- Front wheel -->
            <rect x="17" y="4" width="6" height="12" fill="#222" rx="3" />
            <!-- Rear wheel -->
            <rect x="17" y="44" width="6" height="12" fill="#222" rx="3" />
            
            <!-- Scooter Main Body (Chassis) -->
            <rect x="11" y="10" width="18" height="38" fill="#EAEAEA" rx="9" />
            <!-- Footrest area -->
            <rect x="13" y="24" width="14" height="14" fill="#333" rx="3" />
            
            <!-- Handlebars -->
            <path d="M 8 16 Q 20 10 32 16" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round" />
            
            <!-- Headlight -->
            <rect x="17" y="10" width="6" height="3" fill="#FFF" rx="1" />
            
            <!-- Delivery Box (Back) -->
            <rect x="6" y="38" width="28" height="22" fill="#FFC107" rx="4" stroke="#D97706" stroke-width="2" />
            <rect x="9" y="41" width="22" height="16" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1" rx="2" />
            
            <!-- Rider Torso -->
            <rect x="11" y="21" width="18" height="14" fill="#14B8A6" rx="6" />
            
            <!-- Rider Arms -->
            <path d="M 12 25 Q 7 24 8 17" fill="none" stroke="#14B8A6" stroke-width="4.5" stroke-linecap="round" />
            <path d="M 28 25 Q 33 24 32 17" fill="none" stroke="#14B8A6" stroke-width="4.5" stroke-linecap="round" />
            
            <!-- Helmet -->
            <circle cx="20" cy="24" r="8" fill="#222" />
            <!-- Helmet Visor -->
            <path d="M 14 23 Q 20 17 26 23" fill="none" stroke="#555" stroke-width="3" stroke-linecap="round" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// SVGs as strings for Leaflet
const storeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const homeSvg = `<img src="/metalogo.png" alt="Meta Logo" style="width: 52px; height: 52px; object-fit: contain; border-radius: 50%;" />`;

const kitchenIcon = createMarkerIcon(storeSvg, '#F59E0B', 'rgba(255, 255, 255, 0.95)');
const customerIcon = createMarkerIcon(homeSvg, '#F20D6F');


interface MapControllerProps {
  state: LiveTrackingState;
  mapRef: React.MutableRefObject<L.Map | null>;
  isTrackingRef: React.MutableRefObject<boolean>;
  isSheetExpanded?: boolean;
}

const MapController = forwardRef<{ recenter: () => void }, MapControllerProps>(({ state, mapRef, isTrackingRef, isSheetExpanded }, ref) => {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
    
    // Disable tracking if user manually interacts with the map
    const disableTracking = () => { isTrackingRef.current = false; };
    map.on('dragstart', disableTracking);
    map.on('wheel', disableTracking);
    map.on('touchstart', disableTracking);
    
    return () => {
      map.off('dragstart', disableTracking);
      map.off('wheel', disableTracking);
      map.off('touchstart', disableTracking);
    };
  }, [map]);

  const recenter = () => {
    if (state.rider && (state.status === 'on_the_way' || state.status === 'arriving')) {
      // Zoom in close to the rider. The animation loop will immediately pan to them.
      map.setZoom(17, { animate: true, duration: 1 });
    } else {
      const bounds = L.latLngBounds([]);
      bounds.extend([state.customer.latitude, state.customer.longitude]);
      bounds.extend([state.kitchen.latitude, state.kitchen.longitude]);
      map.fitBounds(bounds, { paddingBottomRight: [0, window.innerHeight * 0.4], paddingTopLeft: [50, 50], maxZoom: 16 });
    }
  };

  useImperativeHandle(ref, () => ({
    recenter
  }));

  // Auto-recenter once when the route is loaded and live
  useEffect(() => {
    if (state.route && state.isLive) {
      recenter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.route, state.isLive]);

    // Ensure map correctly sizes when the container might have changed size
    useEffect(() => {
      // Trigger multiple invalidations during initial load and animations to prevent blank grey areas
      const intervals = [100, 300, 500, 1000];
      const timeouts = intervals.map(time => setTimeout(() => {
        if (map) {
          map.invalidateSize();
        }
      }, time));
      
      return () => timeouts.forEach(clearTimeout);
    }, [map, isSheetExpanded]);

  return null;
});
MapController.displayName = 'MapController';


export interface DeliveryMapProps {
  state: LiveTrackingState;
  isSheetExpanded: boolean;
}

export interface DeliveryMapRef {
  recenter: () => void;
}

export const DeliveryMap = forwardRef<DeliveryMapRef, DeliveryMapProps>(({ state, isSheetExpanded }, ref) => {
  const riderMarkerRef = React.useRef<L.Marker>(null);
  const mapControllerRef = React.useRef<{ recenter: () => void }>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const isTrackingRef = React.useRef<boolean>(true);

  useImperativeHandle(ref, () => ({
    recenter: () => {
      isTrackingRef.current = true;
      mapControllerRef.current?.recenter();
    }
  }));

  const animationRef = React.useRef<number>(0);

  // High-performance Vanilla JS animation loop (Bypasses React State!)
  useEffect(() => {
    if (!state.route || !state.isLive || !riderMarkerRef.current) return;

    const duration = 180000; // 3 minutes
    const start = state.startTime || Date.now();
    const coordinates = state.route.coordinates;
    const totalPoints = coordinates.length;
    let lastHeading = state.rider?.heading || 0;
    
    // Track the current offset for smooth interpolation
    let currentOffsetRatio = isSheetExpanded ? 0.28 : 0.15;

    const animate = () => {
      if (!riderMarkerRef.current) return;
      
      const now = Date.now();
      const elapsed = (now - start) % duration; // Infinite loop modulo
      const progress = elapsed / duration;
      
      const exactIndex = progress * (totalPoints - 1);
      const index1 = Math.floor(exactIndex);
      const index2 = Math.min(Math.ceil(exactIndex), totalPoints - 1);
      
      const point1 = coordinates[index1];
      const point2 = coordinates[index2];
      
      const subProgress = exactIndex - index1;
      
      const lat = point1[0] + (point2[0] - point1[0]) * subProgress;
      const lng = point1[1] + (point2[1] - point1[1]) * subProgress;

      // 1. Move Marker Position
      riderMarkerRef.current.setLatLng([lat, lng]);

      // 1.5. Live Camera Tracking
      if (isTrackingRef.current && mapRef.current) {
        // Smoothly interpolate the offset ratio towards the target based on sheet state
        const targetOffsetRatio = isSheetExpanded ? 0.28 : 0.15;
        currentOffsetRatio += (targetOffsetRatio - currentOffsetRatio) * 0.1; // Smooth lerp

        const zoom = mapRef.current.getZoom();
        const targetPoint = mapRef.current.project([lat, lng], zoom);
        
        // Offset center DOWN so the marker sits securely HIGHER in the visible upper half of the screen
        targetPoint.y += window.innerHeight * currentOffsetRatio;
        
        const targetLatLng = mapRef.current.unproject(targetPoint, zoom);
        mapRef.current.setView(targetLatLng, zoom, { animate: false });
      }

      // 2. Rotate Marker
      let heading = lastHeading;
      if (index1 !== index2) {
        const dy = point2[0] - point1[0];
        const dx = point2[1] - point1[1];
        heading = (Math.atan2(dx, dy) * 180) / Math.PI;
        lastHeading = heading;
      }

      const el = riderMarkerRef.current.getElement();
      if (el) {
        const rotatingDiv = el.querySelector('#rider-scooty-g') as HTMLDivElement | null;
        if (rotatingDiv) {
          rotatingDiv.style.transform = `rotate(${heading}deg)`;
        }
      }

      // Always continue the loop for the demo
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [state.route, state.isLive, state.startTime, isSheetExpanded]);
  
  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={[state.kitchen.latitude, state.kitchen.longitude]}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 1, backgroundColor: '#F0F4F8' }}
        className={styles.cleanMap}
        zoomControl={false}
        attributionControl={false}
      >
        {/* Google Maps - Clean street network, combined with our CSS filter for a SaaS look */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
        />

        {/* Route Polyline */}
        {state.route && state.status !== 'delivered' && (
          <>
            {/* White casing for contrast */}
            <Polyline 
              positions={state.route.coordinates} 
              color="#ffffff" 
              weight={8}
              opacity={0.8}
            />
            {/* Brand pink route */}
            <Polyline 
              positions={state.route.coordinates} 
              color="#F20D6F" 
              weight={4}
              opacity={0.9}
              lineCap="round"
              lineJoin="round"
            />
          </>
        )}

        {/* Kitchen Marker */}
        {(state.status === 'preparing' || state.status === 'ready' || state.status === 'picked_up' || state.status === 'on_the_way') && (
          <Marker position={[state.kitchen.latitude, state.kitchen.longitude]} icon={kitchenIcon} />
        )}

        {/* Customer Marker */}
        <Marker position={[state.customer.latitude, state.customer.longitude]} icon={customerIcon} />

        {/* Rider Marker */}
        {state.rider && (state.status === 'picked_up' || state.status === 'on_the_way' || state.status === 'arriving') && (
          <Marker 
            position={[state.rider.latitude, state.rider.longitude]} 
            icon={createRiderIcon(state.rider.heading)} 
            ref={riderMarkerRef}
          />
        )}

        {/* Controller handles side-effects like panning */}
        <MapController state={state} ref={mapControllerRef} mapRef={mapRef} isTrackingRef={isTrackingRef} isSheetExpanded={isSheetExpanded} />
      </MapContainer>
    </div>
  );
});
DeliveryMap.displayName = 'DeliveryMap';
