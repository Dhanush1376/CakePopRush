import { useState, useEffect, useRef } from 'react';
import { buildApiUrl, getAccessToken } from '@/lib/api/client';

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
    distanceFormatted?: string;
  };
  eta?: {
    minMinutes: number;
    maxMinutes: number;
  };
  status: 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'arriving' | 'delivered';
  isLive: boolean;
  startTime?: number;
  agent?: {
    name: string;
    phone: string;
    avatar?: string;
    rating?: number;
  };
  deliveryOtp?: string;
  destinationLabel?: string;
  destinationAddress?: any;
};

// Default Bakery Location (Cake Pop Rush, Mumbai)
const DEFAULT_KITCHEN_LOC: TrackingLocation = { latitude: 18.9674394, longitude: 72.8116404 };
// Default Customer Location fallback
const DEFAULT_CUSTOMER_LOC: TrackingLocation = { latitude: 18.950000, longitude: 72.800000 };

export function useLiveTracking(orderId?: string, enabled: boolean = true): LiveTrackingState {
  const [state, setState] = useState<LiveTrackingState>({
    kitchen: DEFAULT_KITCHEN_LOC,
    customer: DEFAULT_CUSTOMER_LOC,
    status: 'on_the_way',
    isLive: false,
  });

  const lastRiderCoordRef = useRef<{ lat: number; lng: number } | null>(null);
  const routeFetchInProgressRef = useRef(false);

  useEffect(() => {
    if (!orderId || !enabled) return;

    let isMounted = true;

    // Handle mock demo orders without network errors
    if (orderId.startsWith('order_demo_') || orderId.toLowerCase().includes('demo')) {
      const kitchenLoc = DEFAULT_KITCHEN_LOC;
      const customerLoc = DEFAULT_CUSTOMER_LOC;
      const riderLoc: TrackingLocation = { latitude: 18.9610, longitude: 72.8080 };
      setState({
        kitchen: kitchenLoc,
        customer: customerLoc,
        rider: riderLoc,
        isLive: true,
        status: 'on_the_way',
        deliveryOtp: '492815',
        agent: {
          name: 'Raju Sharma',
          phone: '',
          rating: 4.9,
        },
        eta: { minMinutes: 8, maxMinutes: 12 },
        route: {
          coordinates: [
            [kitchenLoc.latitude, kitchenLoc.longitude],
            [riderLoc.latitude, riderLoc.longitude],
            [customerLoc.latitude, customerLoc.longitude],
          ],
          distanceFormatted: '2.4 km',
          durationSeconds: 600,
        },
      });
      return;
    }

    const fetchTrackingData = async () => {
      try {
        const token = getAccessToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(buildApiUrl(`/api/v1/orders/${encodeURIComponent(orderId)}/tracking`), {
          credentials: 'include',
          headers,
        });
        if (!res.ok) return;

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return;

        const json = await res.json();
        const data = json?.data;
        if (!data || !isMounted) return;

        // Robust coordinate validator
        const isValidCoord = (loc: any): boolean =>
          loc &&
          typeof loc.latitude === 'number' &&
          !isNaN(loc.latitude) &&
          typeof loc.longitude === 'number' &&
          !isNaN(loc.longitude);

        // Extract locations safely
        const kitchenLoc: TrackingLocation = isValidCoord(data.storeLocation)
          ? { latitude: Number(data.storeLocation.latitude), longitude: Number(data.storeLocation.longitude) }
          : DEFAULT_KITCHEN_LOC;

        const customerLoc: TrackingLocation = isValidCoord(data.customerLocation)
          ? { latitude: Number(data.customerLocation.latitude), longitude: Number(data.customerLocation.longitude) }
          : isValidCoord(data.destinationAddress)
            ? { latitude: Number(data.destinationAddress.latitude), longitude: Number(data.destinationAddress.longitude) }
            : DEFAULT_CUSTOMER_LOC;

        const riderLoc: TrackingLocation = isValidCoord(data.currentLocation)
          ? {
              latitude: Number(data.currentLocation.latitude),
              longitude: Number(data.currentLocation.longitude),
              heading: typeof data.currentLocation.heading === 'number' ? data.currentLocation.heading : 0,
            }
          : kitchenLoc;

        const isDelivered = data.delivered || data.status === 'DELIVERED';
        const isTrackingActive = Boolean(data.trackingActive && !isDelivered);

        // Check if agent location moved by > 10 meters to avoid unnecessary OSRM requests
        const prev = lastRiderCoordRef.current;
        const hasMovedSignificantly = !prev || 
          Math.abs(prev.lat - riderLoc.latitude) > 0.0001 || 
          Math.abs(prev.lng - riderLoc.longitude) > 0.0001;

        if (isDelivered) {
          setState((prev) => ({
            ...prev,
            status: 'delivered',
            isLive: false,
            deliveryOtp: undefined,
          }));
          return;
        }

        const effectiveRiderLoc: TrackingLocation = riderLoc;
        const destTitle = data.destinationAddress?.street || data.destinationAddress?.line1 || data.destinationAddress?.city || 'Delivery Destination';

        // Fetch OSRM driving route if active and (first time or moved significantly)
        if (isTrackingActive && hasMovedSignificantly && !routeFetchInProgressRef.current) {
          routeFetchInProgressRef.current = true;
          lastRiderCoordRef.current = { lat: effectiveRiderLoc.latitude, lng: effectiveRiderLoc.longitude };

          try {
            // OSRM coordinates format: lng,lat
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${effectiveRiderLoc.longitude},${effectiveRiderLoc.latitude};${customerLoc.longitude},${customerLoc.latitude}?overview=full&geometries=geojson`;
            const osrmRes = await fetch(osrmUrl);
            const osrmData = await osrmRes.json();

            if (osrmData.code === 'Ok' && osrmData.routes?.length > 0 && isMounted) {
              const route = osrmData.routes[0];
              const coords: [number, number][] = (route.geometry?.coordinates || [])
                .map((c: any) => [Number(c[1]), Number(c[0])] as [number, number])
                .filter(([lat, lng]: [number, number]) => typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng));

              // Snap ends
              if (isValidCoord(effectiveRiderLoc)) {
                coords.unshift([effectiveRiderLoc.latitude, effectiveRiderLoc.longitude]);
              }
              if (isValidCoord(customerLoc)) {
                coords.push([customerLoc.latitude, customerLoc.longitude]);
              }

              const distKm = Math.round((route.distance / 1000) * 10) / 10;
              const durMins = Math.max(2, Math.round(route.duration / 60));

              setState((prev) => ({
                ...prev,
                kitchen: kitchenLoc,
                customer: customerLoc,
                rider: effectiveRiderLoc,
                isLive: true,
                deliveryOtp: data.deliveryOtp || prev.deliveryOtp,
                agent: data.agent || prev.agent,
                destinationLabel: destTitle,
                destinationAddress: data.destinationAddress,
                status: durMins <= 3 ? 'arriving' : 'on_the_way',
                route: {
                  coordinates: coords,
                  distanceMeters: route.distance,
                  durationSeconds: route.duration,
                  distanceFormatted: `${distKm} km`,
                },
                eta: {
                  minMinutes: durMins,
                  maxMinutes: durMins + 4,
                },
              }));
            }
          } catch {
            // OSRM failed, calculate direct distance fallback
            if (isMounted) {
              const dLat = (customerLoc.latitude - effectiveRiderLoc.latitude) * Math.PI / 180;
              const dLon = (customerLoc.longitude - effectiveRiderLoc.longitude) * Math.PI / 180;
              const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                        Math.cos(effectiveRiderLoc.latitude * Math.PI / 180) * Math.cos(customerLoc.latitude * Math.PI / 180) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const distKm = Math.round(6371 * c * 10) / 10;
              const durMins = Math.max(3, Math.round((distKm / 25) * 60));

              setState((prev) => ({
                ...prev,
                kitchen: kitchenLoc,
                customer: customerLoc,
                rider: effectiveRiderLoc,
                isLive: true,
                deliveryOtp: data.deliveryOtp || prev.deliveryOtp,
                agent: data.agent || prev.agent,
                destinationLabel: destTitle,
                destinationAddress: data.destinationAddress,
                status: durMins <= 3 ? 'arriving' : 'on_the_way',
                route: prev.route || {
                  coordinates: [
                    [effectiveRiderLoc.latitude, effectiveRiderLoc.longitude],
                    [customerLoc.latitude, customerLoc.longitude],
                  ],
                  distanceMeters: distKm * 1000,
                  durationSeconds: durMins * 60,
                  distanceFormatted: `${distKm} km`,
                },
                eta: {
                  minMinutes: durMins,
                  maxMinutes: durMins + 4,
                },
              }));
            }
          } finally {
            routeFetchInProgressRef.current = false;
          }
        } else if (isMounted) {
          // Just update rider position & OTP without full route refetch
          setState((prev) => ({
            ...prev,
            kitchen: kitchenLoc,
            customer: customerLoc,
            rider: effectiveRiderLoc,
            deliveryOtp: data.deliveryOtp || prev.deliveryOtp,
            agent: data.agent || prev.agent,
            destinationLabel: destTitle || prev.destinationLabel,
            destinationAddress: data.destinationAddress || prev.destinationAddress,
            isLive: isTrackingActive,
          }));
        }
      } catch {
        // Silently skip tracking cycle on transient network hiccups
      }
    };

    // Initial fetch
    fetchTrackingData();

    // Poll every 2.5 seconds for snappy real-time tracking
    const interval = setInterval(fetchTrackingData, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderId]);

  return state;
}
