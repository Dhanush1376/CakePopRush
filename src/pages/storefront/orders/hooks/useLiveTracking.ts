import { useState, useEffect, useRef } from 'react';

export type TrackingLocation = {
  latitude: number;
  longitude: number;
  heading?: number;
  updatedAt?: string;
};

export type LiveTrackingState = {
  kitchen: TrackingLocation;
  customer: TrackingLocation;
  rider?: TrackingLocation;
  route?: {
    coordinates: [number, number][]; // [lat, lng]
    distanceMeters?: number;
    durationSeconds?: number;
  };
  eta?: {
    minMinutes: number;
    maxMinutes: number;
  };
  status: 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'arriving' | 'delivered';
  isLive: boolean;
  startTime?: number;
};

// Hardcoded mock coordinates for demo purposes
// TODO: When connected backend we need to be able to update in CMS future course
// Kitchen: Cake Pop Rush, Mumbai
const KITCHEN_LOC: TrackingLocation = { latitude: 18.9674394, longitude: 72.8116404 };
// Customer: Nearby location in Mumbai for demo
const CUSTOMER_LOC: TrackingLocation = { latitude: 18.950000, longitude: 72.800000 };

export function useLiveTracking(orderId: string): LiveTrackingState {
  const [state, setState] = useState<LiveTrackingState>({
    kitchen: KITCHEN_LOC,
    customer: CUSTOMER_LOC,
    status: 'on_the_way',
    isLive: false,
  });

  useEffect(() => {
    // Prevent fetching if we already have the route
    if (state.route) return;

    let isMounted = true;

    // Fetch real road route from OSRM
    const fetchRoute = async () => {
      try {
        // OSRM expects longitude,latitude (swapped to route from Customer to Kitchen)
        const url = `https://router.project-osrm.org/route/v1/driving/${CUSTOMER_LOC.longitude},${CUSTOMER_LOC.latitude};${KITCHEN_LOC.longitude},${KITCHEN_LOC.latitude}?overview=full&geometries=geojson`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.code === 'Ok' && data.routes.length > 0 && isMounted) {
          const route = data.routes[0];
          // OSRM returns GeoJSON coordinates as [longitude, latitude], Leaflet needs [latitude, longitude]
          const coordinates: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          
          // Force the route to exactly start and end at our markers to prevent snap-to-road gaps
          coordinates.unshift([CUSTOMER_LOC.latitude, CUSTOMER_LOC.longitude]);
          coordinates.push([KITCHEN_LOC.latitude, KITCHEN_LOC.longitude]);
          
          setState(prev => ({
            ...prev,
            route: {
              coordinates,
              distanceMeters: route.distance,
              durationSeconds: route.duration
            },
            rider: { latitude: coordinates[0][0], longitude: coordinates[0][1], heading: 0 },
            isLive: true,
            startTime: Date.now(),
            eta: {
              minMinutes: Math.floor(route.duration / 60),
              maxMinutes: Math.floor(route.duration / 60) + 5
            }
          }));
        }
      } catch (err) {
        console.error("Failed to fetch OSRM route:", err);
      }
    };

    fetchRoute();
    
    return () => { isMounted = false; };
  }, [orderId, state.route]);

  // Simulate Status Updates (Low frequency - NO 60fps React overhead)
  useEffect(() => {
    if (!state.route || !state.isLive) return;
    
    const duration = 180000; // Complete the route in 3 minutes
    const start = state.startTime || Date.now();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - start) % duration; // Infinite loop modulo
      const progress = elapsed / duration;
      
      setState(prev => {
        const nextStatus = progress > 0.95 ? 'arriving' : 'on_the_way';
        const finalStatus = nextStatus; // Never 'delivered' in looping demo
        
        // Only trigger React re-render if the status ACTUALLY changes
        if (prev.status !== finalStatus || prev.isLive !== true) {
           return { ...prev, status: finalStatus, isLive: true };
        }
        return prev;
      });
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [state.route, state.startTime, state.isLive, state.status]);

  return state;
}
