import { Router, Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import logger from '../../config/logger';

const router = Router();

// ==========================================
// In-Memory Geocode Cache (15-minute TTL)
// ==========================================

interface CacheEntry {
  data: any;
  timestamp: number;
}

const geocodeCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_CACHE_SIZE = 2000;

function getCacheKey(lat: number, lon: number): string {
  // Round to ~11 meters precision (4 decimal places)
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}

// ==========================================
// Address Normalization Utilities
// ==========================================

/**
 * Cleans administrative subdivisions from city names
 * (e.g. 'Phagwara Tahsil' → 'Phagwara')
 */
function cleanCityName(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const cleaned = raw
    .replace(/\s+(Tahsil|Tehsil|Taluk|Taluka|Mandal|Sub-district|District)\b/gi, '')
    .trim();
  if (/^(mumbai suburban|mumbai city|greater mumbai)$/i.test(cleaned)) {
    return 'Mumbai';
  }
  return cleaned;
}

/**
 * Synthesizes a natural landmark string from POI, locality, and street data.
 * Only prefixes "Near " if the POI doesn't already start with a positional word.
 */
function synthesizeLandmark(poiName: string, locality: string, street: string): string {
  if (poiName && typeof poiName === 'string') {
    const cleanPoi = poiName.trim();
    if (cleanPoi) {
      const prefix = cleanPoi.match(/^(near|opp|opposite|behind|beside)\s/i) ? '' : 'Near ';
      if (
        locality &&
        locality.toLowerCase() !== cleanPoi.toLowerCase() &&
        !cleanPoi.toLowerCase().includes(locality.toLowerCase())
      ) {
        return `${prefix}${cleanPoi}, ${locality}`;
      }
      return `${prefix}${cleanPoi}`;
    }
  }
  if (locality && typeof locality === 'string') {
    const cleanLoc = locality.trim();
    if (cleanLoc) {
      return cleanLoc.match(/^(near|opp|opposite|behind|beside)\s/i)
        ? cleanLoc
        : `Near ${cleanLoc}`;
    }
  }
  if (street && typeof street === 'string') {
    const cleanStreet = street.trim();
    if (cleanStreet) {
      return `On ${cleanStreet}`;
    }
  }
  return '';
}

/**
 * Filters out generic OSM tags that aren't meaningful building/POI names
 */
function isGenericTag(val: any): boolean {
  if (!val || typeof val !== 'string') return true;
  const lower = val.trim().toLowerCase();
  return [
    'yes', 'no', 'true', 'false',
    'residential', 'commercial', 'apartments',
    'unclassified', 'building',
  ].includes(lower);
}

// ==========================================
// Reverse Geocoding Endpoint
// ==========================================

/**
 * GET /api/v1/location/reverse-geocode?lat=12.9716&lng=77.5946
 *
 * Server-side reverse geocoding using Nominatim + Photon in parallel,
 * with BigDataCloud fallback and India postal pincode enrichment.
 * Server-side User-Agent complies with OpenStreetMap Nominatim usage policy.
 */
router.get(
  '/reverse-geocode',
  asyncHandler(async (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude (-90 to 90) and longitude (-180 to 180) are required',
      });
    }

    // Check cache first
    const cacheKey = getCacheKey(lat, lng);
    const cached = geocodeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ success: true, source: 'cache', data: cached.data });
    }

    let resolvedAddress: any = null;

    // ──────────────────────────────────────────
    // Tier 1: Parallel Nominatim + Photon query
    // ──────────────────────────────────────────
    try {
      const [osmSettled, photonSettled] = await Promise.allSettled([
        (async () => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`;
          const osmRes = await fetch(nominatimUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'CakePopRush/1.0 (https://cakepoprush.com; contact: support@cakepoprush.com)',
              Accept: 'application/json',
              'Accept-Language': 'en',
            },
          });
          clearTimeout(timeout);
          return osmRes.ok ? await osmRes.json() : null;
        })(),
        (async () => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const photonRes = await fetch(
            `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&limit=5`,
            {
              signal: controller.signal,
              headers: { Accept: 'application/json' },
            },
          );
          clearTimeout(timeout);
          return photonRes.ok ? await photonRes.json() : null;
        })(),
      ]);

      const osmData: any = osmSettled.status === 'fulfilled' ? osmSettled.value : null;
      const photonData: any = photonSettled.status === 'fulfilled' ? photonSettled.value : null;

      const a = osmData?.address || {};
      const props = photonData?.features?.[0]?.properties || {};

      // Extract structured components
      const street = props.street || a.road || a.street || '';
      const building =
        (props.name && props.name !== props.street ? props.name : '') ||
        (a.building && !isGenericTag(a.building) ? a.building : '') ||
        (a.amenity && !isGenericTag(a.amenity) ? a.amenity : '') ||
        (a.shop && !isGenericTag(a.shop) ? a.shop : '') ||
        (a.tourism && !isGenericTag(a.tourism) ? a.tourism : '') ||
        a.house_name ||
        '';
      const housenumber = a.house_number || props.housenumber || '';
      const locality =
        a.residential ||
        a.suburb ||
        a.neighbourhood ||
        props.locality ||
        props.district ||
        a.subdistrict ||
        a.locality ||
        '';

      const landmark = synthesizeLandmark(building, locality, street);

      const addressParts = [housenumber, building, street, locality].filter(Boolean);
      const address =
        addressParts.length > 0
          ? Array.from(new Set(addressParts)).join(', ')
          : osmData?.display_name || '';

      const rawCity =
        a.city || a.town || a.village || props.city || a.municipality || a.county || '';
      const city = cleanCityName(rawCity);
      const district = cleanCityName(a.county || a.state_district || props.district || city);
      const state = a.state || props.state || '';
      const pincode = (a.postcode || props.postcode || '').replace(/\D/g, '').slice(0, 6);

      if (city || pincode || address) {
        resolvedAddress = {
          latitude: lat,
          longitude: lng,
          housenumber,
          building,
          street,
          address,
          locality,
          landmark,
          city,
          district,
          state,
          pincode,
          country: a.country || props.country || 'India',
          source: 'hybrid-osm-photon',
        };
      }
    } catch (hybridErr: any) {
      logger.warn(`[Location] Hybrid geocode failed: ${hybridErr.message}`);
    }

    // ──────────────────────────────────────────
    // Tier 2: BigDataCloud Fallback
    // ──────────────────────────────────────────
    if (!resolvedAddress || (!resolvedAddress.city && !resolvedAddress.pincode)) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const bdcRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
          { signal: controller.signal, headers: { Accept: 'application/json' } },
        );
        clearTimeout(timeout);

        if (bdcRes.ok) {
          const bdcData: any = await bdcRes.json();
          if (bdcData) {
            const bdcCity = bdcData.city || bdcData.locality || '';
            const bdcLocality = bdcData.locality || bdcData.principalSubdivision || '';
            const bdcState = bdcData.principalSubdivision || '';
            const bdcPincode = (bdcData.postcode || '').replace(/\D/g, '').slice(0, 6);

            resolvedAddress = {
              latitude: lat,
              longitude: lng,
              housenumber: resolvedAddress?.housenumber || '',
              building: resolvedAddress?.building || '',
              street: resolvedAddress?.street || '',
              address: resolvedAddress?.address || (bdcLocality ? `${bdcLocality}, ${bdcCity}` : bdcCity),
              locality: resolvedAddress?.locality || bdcLocality,
              landmark: resolvedAddress?.landmark || '',
              city: resolvedAddress?.city || bdcCity,
              district: resolvedAddress?.district || bdcCity,
              state: resolvedAddress?.state || bdcState,
              pincode: resolvedAddress?.pincode || bdcPincode,
              country: bdcData.countryName || 'India',
              source: 'bigdatacloud',
            };
          }
        }
      } catch (bdcErr: any) {
        logger.warn(`[Location] BigDataCloud lookup failed: ${bdcErr.message}`);
      }
    }

    // ──────────────────────────────────────────
    // Tier 3: India Postal Pincode Enrichment
    // ──────────────────────────────────────────
    if (resolvedAddress?.pincode && (!resolvedAddress.city || !resolvedAddress.state)) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const pinRes = await fetch(
          `https://api.postalpincode.in/pincode/${resolvedAddress.pincode}`,
          { signal: controller.signal },
        );
        clearTimeout(timeout);

        if (pinRes.ok) {
          const pinData: any = await pinRes.json();
          if (
            Array.isArray(pinData) &&
            pinData[0]?.Status === 'Success' &&
            pinData[0].PostOffice?.length > 0
          ) {
            const po = pinData[0].PostOffice[0];
            resolvedAddress.city = resolvedAddress.city || po.District || po.Block || po.Region;
            resolvedAddress.district = resolvedAddress.district || po.District;
            resolvedAddress.state = resolvedAddress.state || po.State;
            resolvedAddress.locality = resolvedAddress.locality || po.Name;
          }
        }
      } catch (pinErr: any) {
        logger.warn(`[Location] Pincode enrichment failed: ${pinErr.message}`);
      }
    }

    // ──────────────────────────────────────────
    // Maharashtra & Mumbai Specific Resolution
    // ──────────────────────────────────────────
    if (resolvedAddress) {
      const isMHPincode = /^(40[0-2]|40[4-9]|4[1-4][0-9])\d{3}$/.test(resolvedAddress.pincode || '');
      const isMHCoords = lat >= 15.6 && lat <= 22.1 && lng >= 72.6 && lng <= 80.9;
      const isMumbaiCoords = lat >= 18.8 && lat <= 19.4 && lng >= 72.7 && lng <= 73.1;
      const isMumbaiPincode = /^400\d{3}$/.test(resolvedAddress.pincode || '');

      if (isMHPincode || isMHCoords) {
        if (!resolvedAddress.state || resolvedAddress.state.toLowerCase() !== 'goa') {
          resolvedAddress.state = 'Maharashtra';
        }
      }

      if (isMumbaiCoords || isMumbaiPincode) {
        if (!resolvedAddress.city || /^(mumbai suburban|mumbai city|greater mumbai)$/i.test(resolvedAddress.city)) {
          resolvedAddress.city = 'Mumbai';
        }
      }
    }

    // ──────────────────────────────────────────
    // Return result
    // ──────────────────────────────────────────
    if (resolvedAddress) {
      geocodeCache.set(cacheKey, { data: resolvedAddress, timestamp: Date.now() });
      // Evict oldest entry if cache exceeds limit
      if (geocodeCache.size > MAX_CACHE_SIZE) {
        const firstKey = geocodeCache.keys().next().value;
        if (firstKey) geocodeCache.delete(firstKey);
      }

      return res.json({
        success: true,
        data: resolvedAddress,
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Unable to resolve address details for these coordinates',
    });
  }),
);

export default router;
