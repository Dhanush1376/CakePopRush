/**
 * CakePopRush Location Service
 *
 * Provides browser geolocation acquisition and server-side reverse geocoding.
 * Architecture adapted from EventDecor's proven multi-tier pattern:
 *   Tier 1: Browser navigator.geolocation (GPS/Wi-Fi)
 *   Reverse Geocoding: CakePopRush backend → Nominatim + Photon + BigDataCloud + Pincode enrichment
 *
 * No API keys are exposed in the frontend. All geocoding goes through the backend proxy.
 */

import { buildApiUrl } from '@/lib/api/client';

// ==========================================
// Types
// ==========================================

export interface DetectedAddress {
  housenumber?: string;
  building?: string;
  street?: string;
  address?: string;
  locality?: string;
  landmark?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  source?: string;
}

export type LocationStatus =
  | 'idle'
  | 'locating'
  | 'geocoding'
  | 'success'
  | 'error';

export interface LocationResult {
  success: boolean;
  data?: DetectedAddress;
  error?: string;
  permissionDenied?: boolean;
}

// ==========================================
// Browser Geolocation (Tier 1)
// ==========================================

interface GeoCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

/**
 * Acquires GPS coordinates from the browser Geolocation API.
 * Uses high accuracy mode with progressive refinement.
 */
function getBrowserCoordinates(timeoutMs = 12000): Promise<GeoCoords> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return reject(new Error('Browser environment unavailable'));
    }

    if (!navigator.geolocation) {
      return reject(new Error('Geolocation not supported by browser'));
    }

    // In modern browsers, geolocation is blocked on insecure origins (HTTP) unless localhost
    const isSecure =
      window.isSecureContext ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!isSecure) {
      return reject(new Error('Insecure context: geolocation requires HTTPS or localhost'));
    }

    let resolved = false;
    let watchId: number | null = null;
    let bestCoords: GeoCoords | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let progressiveTimer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timer) { clearTimeout(timer); timer = null; }
      if (progressiveTimer) { clearTimeout(progressiveTimer); progressiveTimer = null; }
      if (watchId !== null) {
        try { navigator.geolocation.clearWatch(watchId); } catch (_) {}
        watchId = null;
      }
    };

    const TARGET_ACCURACY_M = 35; // Pinpoint if <= 35m

    // Hard timeout: resolve with best available or reject
    timer = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      cleanup();
      if (bestCoords) {
        resolve(bestCoords);
      } else {
        const err = new Error('Geolocation request timed out');
        (err as any).code = 3;
        reject(err);
      }
    }, timeoutMs);

    const handleSuccess = (pos: GeolocationPosition) => {
      if (resolved) return;
      if (!pos?.coords) return;

      const acc = typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : 25;
      const reading: GeoCoords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: acc,
      };

      if (!bestCoords || acc < bestCoords.accuracy) {
        bestCoords = reading;
      }

      // Pinpoint accuracy achieved → resolve immediately
      if (acc <= TARGET_ACCURACY_M) {
        resolved = true;
        cleanup();
        resolve(reading);
        return;
      }

      // Decent reading but not pinpoint → wait up to 2.5s for GPS lock to sharpen
      if (!progressiveTimer) {
        progressiveTimer = setTimeout(() => {
          if (!resolved && bestCoords) {
            resolved = true;
            cleanup();
            resolve(bestCoords);
          }
        }, 2500);
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      if (resolved) return;
      if (bestCoords) {
        resolved = true;
        cleanup();
        resolve(bestCoords);
        return;
      }
      resolved = true;
      cleanup();
      reject(err);
    };

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: timeoutMs,
      maximumAge: 0,
    };

    try {
      watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, geoOptions);
    } catch (_) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (resolved) return;
          resolved = true;
          cleanup();
          if (pos?.coords) {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : 25,
            });
          } else {
            reject(new Error('No coordinates returned by GPS'));
          }
        },
        handleError,
        geoOptions,
      );
    }
  });
}

// ==========================================
// Reverse Geocoding via Backend Proxy
// ==========================================

/**
 * Calls the CakePopRush backend reverse-geocode endpoint.
 * The backend handles Nominatim/Photon/BigDataCloud with proper User-Agent.
 */
async function reverseGeocode(latitude: number, longitude: number): Promise<DetectedAddress | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const url = buildApiUrl(`/api/v1/location/reverse-geocode?lat=${latitude}&lng=${longitude}`);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json?.success && json.data) {
        return json.data as DetectedAddress;
      }
    }
  } catch (err: any) {
    console.warn('[LocationService] Backend reverse geocode failed:', err.message);
  }
  return null;
}

// ==========================================
// Main Auto-Locate Function
// ==========================================

/**
 * Complete Auto Locate flow:
 *   1. Get GPS coordinates from browser
 *   2. Reverse-geocode via backend
 *   3. Return structured address
 *
 * @param onStatusChange - Callback for UI status updates
 */
export async function autoLocate(
  onStatusChange?: (status: LocationStatus) => void,
): Promise<LocationResult> {
  // Step 1: Get GPS coordinates
  onStatusChange?.('locating');

  let coords: GeoCoords;
  try {
    coords = await getBrowserCoordinates(12000);
  } catch (err: any) {
    const isPermissionDenied =
      err?.code === 1 ||
      /permission denied/i.test(err?.message || '') ||
      /denied/i.test(err?.message || '');

    if (isPermissionDenied) {
      onStatusChange?.('error');
      return {
        success: false,
        permissionDenied: true,
        error: 'Location access was denied. Please allow location permission or enter your address manually.',
      };
    }

    const isTimeout =
      err?.code === 3 ||
      /timed out/i.test(err?.message || '');

    onStatusChange?.('error');
    return {
      success: false,
      error: isTimeout
        ? 'Location request timed out. Please try again or enter your address manually.'
        : "We couldn't determine your location. Please enter your address manually.",
    };
  }

  // Step 2: Reverse geocode
  onStatusChange?.('geocoding');

  const addressData = await reverseGeocode(coords.latitude, coords.longitude);

  if (addressData && (addressData.city || addressData.pincode || addressData.address)) {
    onStatusChange?.('success');
    return {
      success: true,
      data: {
        ...addressData,
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
    };
  }

  // Got coordinates but no usable address
  onStatusChange?.('error');
  return {
    success: false,
    error: "We found your location, but couldn't determine the address. Please enter your details manually.",
  };
}

// ==========================================
// Address Mapping to CakePopRush Form Fields
// ==========================================

export interface CakePopRushFormFields {
  line1: string;  // FLAT, HOUSE NO., BUILDING
  line2: string;  // AREA, STREET, SECTOR
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

/**
 * Resolves Indian state name from 6-digit postal PIN code
 */
export function getStateFromPincode(pincode: string): string {
  const pin = pincode.replace(/\D/g, '').slice(0, 6);
  if (pin.length < 2) return '';
  const p2 = parseInt(pin.slice(0, 2), 10);
  const p3 = parseInt(pin.slice(0, 3), 10);

  if (p3 === 403) return 'Goa';
  if (p2 === 11) return 'Delhi';
  if (p2 >= 12 && p2 <= 13) return 'Haryana';
  if (p2 >= 14 && p2 <= 15) return 'Punjab';
  if (p2 === 16) return 'Punjab'; // Chandigarh / Punjab postal circle
  if (p2 === 17) return 'Himachal Pradesh';
  if (p2 >= 18 && p2 <= 19) return 'Jammu & Kashmir';
  if (p2 >= 20 && p2 <= 28) return (p2 === 24 || p2 === 26) ? 'Uttarakhand' : 'Uttar Pradesh';
  if (p2 >= 30 && p2 <= 34) return 'Rajasthan';
  if (p2 >= 36 && p2 <= 39) return 'Gujarat';
  if (p2 >= 40 && p2 <= 44) return 'Maharashtra';
  if (p2 >= 45 && p2 <= 48) return 'Madhya Pradesh';
  if (p2 === 49) return 'Chhattisgarh';
  if (p2 >= 50 && p2 <= 53) return p2 === 50 ? 'Telangana' : 'Andhra Pradesh';
  if (p2 >= 56 && p2 <= 59) return 'Karnataka';
  if (p2 >= 60 && p2 <= 64) return 'Tamil Nadu';
  if (p2 >= 67 && p2 <= 69) return 'Kerala';
  if (p2 >= 70 && p2 <= 74) return 'West Bengal';
  if (p2 >= 75 && p2 <= 77) return 'Odisha';
  if (p2 >= 78 && p2 <= 79) return 'Assam';
  if (p2 >= 80 && p2 <= 85) return p2 >= 81 && p2 <= 83 ? 'Jharkhand' : 'Bihar';
  return '';
}

/**
 * Intelligently maps a DetectedAddress to CakePopRush form fields.
 */
export function mapAddressToForm(addr: DetectedAddress): CakePopRushFormFields {
  // ── line1: Flat, House No., Building ──
  const line1Parts: string[] = [];
  if (addr.housenumber) line1Parts.push(addr.housenumber);
  if (addr.building && addr.building !== addr.housenumber) {
    line1Parts.push(addr.building);
  }
  const line1 = deduplicateParts(line1Parts).join(', ');

  // ── line2: Area, Street, Sector ──
  const line2Parts: string[] = [];
  if (addr.locality) line2Parts.push(addr.locality);
  if (addr.street && addr.street !== addr.locality) {
    line2Parts.push(addr.street);
  }
  // If no street/locality, try using address minus what's already in line1
  if (line2Parts.length === 0 && addr.address) {
    const cleanAddress = addr.address
      .replace(addr.housenumber || '', '')
      .replace(addr.building || '', '')
      .replace(/^[,\s]+/, '')
      .trim();
    if (cleanAddress && cleanAddress !== addr.city) {
      line2Parts.push(cleanAddress);
    }
  }
  const line2 = deduplicateParts(line2Parts).join(', ');

  // ── Landmark ──
  const landmark = addr.landmark || '';

  // ── Pincode ──
  const rawPincode = addr.pincode || '';
  const pincode = rawPincode.replace(/\D/g, '').slice(0, 6);

  // ── City ──
  let city = addr.city || addr.district || '';
  if (/^(mumbai suburban|mumbai city|greater mumbai)$/i.test(city.trim())) {
    city = 'Mumbai';
  } else if (!city && pincode && /^400\d{3}$/.test(pincode)) {
    city = 'Mumbai';
  }

  // ── State ──
  // Use real detected state first; if empty, resolve accurately via PIN code
  let state = addr.state?.trim() || '';
  if (!state && pincode) {
    state = getStateFromPincode(pincode);
  }

  return { line1, line2, landmark, city, state, pincode };
}

/**
 * Removes duplicate strings (case-insensitive) from address parts
 */
function deduplicateParts(parts: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(trimmed);
    }
  }
  return result;
}
