import React, { useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
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
        <div id="rider-scooty-g" style="pointer-events: auto; margin-bottom: -30px; z-index: 10; display: flex; justify-content: center; align-items: center; transform-origin: center; will-change: transform; transition: transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1); transform: rotate(${heading}deg) translateZ(0);">
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

// Real Customer Destination Marker Icon
const createCustomerDestinationIcon = (label?: string) => {
  const displayLabel = label || 'Delivery Destination';
  return L.divIcon({
    className: styles.markerWrapper,
    html: `
      <div style="position: absolute; bottom: 0; left: -500px; width: 1000px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; pointer-events: none;">
        <div style="pointer-events: auto; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.28)); margin-bottom: 6px;">
          <div style="background: #F20D6F; color: white; padding: 5px 12px; border-radius: 999px; font-family: 'Urbanist', -apple-system, sans-serif; font-size: 11.5px; font-weight: 700; white-space: nowrap; margin-bottom: 4px; box-shadow: 0 2px 8px rgba(242, 13, 111, 0.4); display: flex; align-items: center; gap: 5px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>${displayLabel}</span>
          </div>
          <div style="width: 34px; height: 34px; border-radius: 50%; background: #F20D6F; border: 3px solid #FFFFFF; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.25);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div style="width: 2px; height: 6px; background: #F20D6F;"></div>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

const isValidLatLng = (lat?: any, lng?: any): boolean =>
  typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng);

interface MapControllerProps {
  state: LiveTrackingState;
  mapRef: React.MutableRefObject<L.Map | null>;
  isTrackingRef: React.MutableRefObject<boolean>;
  isSheetExpanded?: boolean;
  isFullMap?: boolean;
  riderMarkerRef: React.MutableRefObject<L.Marker | null>;
}

const MapController = forwardRef<{ recenter: () => void }, MapControllerProps>(({ state, mapRef, isTrackingRef, isSheetExpanded, isFullMap, riderMarkerRef }, ref) => {
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
    isTrackingRef.current = true;
    if (state.rider && isValidLatLng(state.rider.latitude, state.rider.longitude) && (state.status === 'on_the_way' || state.status === 'arriving' || state.status === 'picked_up')) {
      const zoom = 16;
      const targetOffsetYRatio = isSheetExpanded ? 0.35 : isFullMap ? 0.04 : 0.15;
      const targetOffsetXRatio = isSheetExpanded ? 0.12 : 0;
      
      let lat = state.rider.latitude;
      let lng = state.rider.longitude;
      if (riderMarkerRef.current) {
        try {
          const pos = riderMarkerRef.current.getLatLng();
          if (pos && isValidLatLng(pos.lat, pos.lng)) {
            lat = pos.lat;
            lng = pos.lng;
          }
        } catch { /* ignore */ }
      }
      
      if (!isValidLatLng(lat, lng)) return;
      const targetPoint = map.project([lat, lng], zoom);
      targetPoint.y += window.innerHeight * targetOffsetYRatio;
      targetPoint.x += window.innerWidth * targetOffsetXRatio;
      const targetLatLng = map.unproject(targetPoint, zoom);
      
      map.setView(targetLatLng, zoom, { animate: true, duration: 0.1 });
    } else {
      const bounds = L.latLngBounds([]);
      if (isValidLatLng(state.customer?.latitude, state.customer?.longitude)) {
        bounds.extend([state.customer!.latitude, state.customer!.longitude]);
      }
      if (isValidLatLng(state.rider?.latitude, state.rider?.longitude)) {
        bounds.extend([state.rider!.latitude, state.rider!.longitude]);
      }
      if (bounds.isValid()) {
        map.fitBounds(bounds, { paddingBottomRight: [0, window.innerHeight * 0.4], paddingTopLeft: [50, 50], maxZoom: 16 });
      }
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

  // Recenter instantly when the sheet expands or collapses
  useEffect(() => {
    if (state.route && state.isLive) {
      setTimeout(() => {
        recenter();
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSheetExpanded]);

  useEffect(() => {
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
  isFullMap?: boolean;
}

export interface DeliveryMapRef {
  recenter: () => void;
}

// Shortest-path angle unwrapper to prevent 360-degree flip when crossing North (0 deg)
function getUnwrappedHeading(currentAngle: number, targetAngle: number): number {
  let diff = (targetAngle - currentAngle) % 360;
  if (diff < -180) diff += 360;
  if (diff > 180) diff -= 360;
  return currentAngle + diff;
}

export const DeliveryMap = forwardRef<DeliveryMapRef, DeliveryMapProps>(({ state, isSheetExpanded, isFullMap }, ref) => {
  const riderMarkerRef = React.useRef<L.Marker>(null);
  const mapControllerRef = React.useRef<{ recenter: () => void }>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const isTrackingRef = React.useRef<boolean>(true);
  const nextPanTimeRef = React.useRef<number>(0);
  const prevRiderPosRef = React.useRef<{ lat: number; lng: number } | null>(null);
  const currentAngleRef = React.useRef<number>(0);
  const localHeadingRef = React.useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    recenter: () => {
      isTrackingRef.current = true;
      nextPanTimeRef.current = Date.now() + 300;
      mapControllerRef.current?.recenter();
    }
  }));

  // Real-time device orientation listener: rotates scooter smoothly at 60fps as device turns
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let compass: number | null = null;
      if ((event as any).webkitCompassHeading !== undefined && (event as any).webkitCompassHeading !== null) {
        // iOS Safari provides compass heading directly (0-360 deg)
        compass = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null && typeof event.alpha === 'number') {
        // Android compass heading
        compass = (360 - event.alpha) % 360;
      }

      if (compass !== null && !isNaN(compass)) {
        compass = Math.round(compass);
        localHeadingRef.current = compass;

        if (riderMarkerRef.current) {
          const el = riderMarkerRef.current.getElement();
          if (el) {
            const rotatingDiv = el.querySelector('#rider-scooty-g') as HTMLDivElement | null;
            if (rotatingDiv) {
              const unwrapped = getUnwrappedHeading(currentAngleRef.current, compass);
              currentAngleRef.current = unwrapped;
              rotatingDiv.style.transform = `rotate(${unwrapped}deg) translateZ(0)`;
            }
          }
        }
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);

      // On iOS 13+ devices, request permission on first user tap if required
      if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
        const handleFirstInteraction = () => {
          (DeviceOrientationEvent as any).requestPermission()
            .then((perm: string) => {
              if (perm === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation, true);
              }
            })
            .catch(() => {});
        };
        window.addEventListener('click', handleFirstInteraction, { once: true });
        window.addEventListener('touchstart', handleFirstInteraction, { once: true });
      }
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute' as any, handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  // Real-time GPS Position update directly tracking the delivery partner's logged-in device
  useEffect(() => {
    if (!state.rider || !riderMarkerRef.current || !isValidLatLng(state.rider.latitude, state.rider.longitude)) return;

    const lat = state.rider.latitude;
    const lng = state.rider.longitude;

    // Prioritize local device compass, then received device heading, then motion delta
    let targetHeading = 0;
    if (localHeadingRef.current !== null) {
      targetHeading = localHeadingRef.current;
    } else if (typeof state.rider.heading === 'number' && !isNaN(state.rider.heading)) {
      targetHeading = state.rider.heading;
    } else {
      const prev = prevRiderPosRef.current;
      if (prev && (prev.lat !== lat || prev.lng !== lng)) {
        const dy = lat - prev.lat;
        const dx = lng - prev.lng;
        if (Math.abs(dy) > 0.000005 || Math.abs(dx) > 0.000005) {
          targetHeading = (Math.atan2(dx, dy) * 180) / Math.PI;
        }
      } else if (state.customer && isValidLatLng(state.customer.latitude, state.customer.longitude)) {
        const dy = state.customer.latitude - lat;
        const dx = state.customer.longitude - lng;
        targetHeading = (Math.atan2(dx, dy) * 180) / Math.PI;
      }
    }
    prevRiderPosRef.current = { lat, lng };

    // Update bike position to exact agent device GPS coordinates
    riderMarkerRef.current.setLatLng([lat, lng]);

    // Rotate scooter icon towards travel direction with continuous angle
    const el = riderMarkerRef.current.getElement();
    if (el) {
      const rotatingDiv = el.querySelector('#rider-scooty-g') as HTMLDivElement | null;
      if (rotatingDiv) {
        const unwrapped = getUnwrappedHeading(currentAngleRef.current, targetHeading);
        currentAngleRef.current = unwrapped;
        rotatingDiv.style.transform = `rotate(${unwrapped}deg) translateZ(0)`;
      }
    }

    // Smooth camera tracking if user hasn't panned away
    if (isTrackingRef.current && mapRef.current) {
      const now = Date.now();
      if (now >= nextPanTimeRef.current) {
        nextPanTimeRef.current = now + 400;
        const targetOffsetYRatio = isSheetExpanded ? 0.35 : isFullMap ? 0.04 : 0.15;
        const targetOffsetXRatio = isSheetExpanded ? 0.12 : 0;
        const zoom = mapRef.current.getZoom();
        const targetPoint = mapRef.current.project([lat, lng], zoom);
        targetPoint.y += window.innerHeight * targetOffsetYRatio;
        targetPoint.x += window.innerWidth * targetOffsetXRatio;
        const targetLatLng = mapRef.current.unproject(targetPoint, zoom);
        mapRef.current.panTo(targetLatLng, { animate: true, duration: 0.6 });
      }
    }
  }, [state.rider?.latitude, state.rider?.longitude, state.rider?.heading, isSheetExpanded, isFullMap]);
  
  const safeCenterLat = isValidLatLng(state.customer?.latitude, state.customer?.longitude)
    ? state.customer!.latitude
    : isValidLatLng(state.rider?.latitude, state.rider?.longitude)
    ? state.rider!.latitude
    : 31.2533;
  const safeCenterLng = isValidLatLng(state.customer?.latitude, state.customer?.longitude)
    ? state.customer!.longitude
    : isValidLatLng(state.rider?.latitude, state.rider?.longitude)
    ? state.rider!.longitude
    : 75.6958;

  const customerIcon = useMemo(() => {
    return createCustomerDestinationIcon(state.destinationLabel);
  }, [state.destinationLabel]);

  const validRouteCoords = useMemo(() => {
    const raw = (state.route?.coordinates || []).filter(
      (c): c is [number, number] => Array.isArray(c) && isValidLatLng(c[0], c[1])
    );
    if (raw.length > 0 && isValidLatLng(state.rider?.latitude, state.rider?.longitude)) {
      // Find the closest index on the polyline to the rider's current position
      let minDist = Infinity;
      let closestIdx = 0;
      for (let i = 0; i < raw.length; i++) {
        const d = Math.hypot(raw[i][0] - state.rider!.latitude, raw[i][1] - state.rider!.longitude);
        if (d < minDist) {
          minDist = d;
          closestIdx = i;
        }
      }
      // Keep only remaining route from rider to destination
      const forwardPoints = raw.slice(closestIdx);
      return [[state.rider!.latitude, state.rider!.longitude] as [number, number], ...forwardPoints];
    }
    return raw;
  }, [state.route?.coordinates, state.rider?.latitude, state.rider?.longitude]);

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={[safeCenterLat, safeCenterLng]}
        zoom={14}
        style={{ height: '100%', width: '100%', zIndex: 1, backgroundColor: '#F0F4F8' }}
        className={styles.cleanMap}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
        />

        {/* Real Route Polyline connecting Rider directly to Customer */}
        {state.route && state.status !== 'delivered' && validRouteCoords.length > 1 && (
          <>
            <Polyline 
              positions={validRouteCoords} 
              color="#ffffff" 
              weight={8}
              opacity={0.8}
            />
            <Polyline 
              positions={validRouteCoords} 
              color="#F20D6F" 
              weight={4}
              opacity={0.9}
              lineCap="round"
              lineJoin="round"
            />
          </>
        )}

        {/* Customer Destination Marker */}
        {isValidLatLng(state.customer?.latitude, state.customer?.longitude) && (
          <Marker position={[state.customer.latitude, state.customer.longitude]} icon={customerIcon} />
        )}

        {/* Real Delivery Agent Rider Marker */}
        {state.rider &&
          isValidLatLng(state.rider.latitude, state.rider.longitude) &&
          (state.status === 'picked_up' || state.status === 'on_the_way' || state.status === 'arriving') && (
          <Marker 
            position={[state.rider.latitude, state.rider.longitude]} 
            icon={createRiderIcon(state.rider.heading)} 
            ref={riderMarkerRef}
          />
        )}

        <MapController state={state} ref={mapControllerRef} mapRef={mapRef} isTrackingRef={isTrackingRef} isSheetExpanded={isSheetExpanded} isFullMap={isFullMap} riderMarkerRef={riderMarkerRef} />
      </MapContainer>
    </div>
  );
});
DeliveryMap.displayName = 'DeliveryMap';
