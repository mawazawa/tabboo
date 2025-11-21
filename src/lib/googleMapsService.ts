/**
 * Google Maps Service
 *
 * Purpose: Core service for address validation, autocomplete, and court lookups
 *
 * Features:
 * - Address autocomplete with session token management
 * - Address validation (USPS standardization)
 * - California court location finder
 * - Distance calculations for custody planning
 * - Privacy-safe address handling for DV cases
 *
 * API Requirements:
 * - Places API (New)
 * - Address Validation API
 * - Geocoding API
 * - Routes API (Compute Route Matrix)
 *
 * Environment Variables:
 * - VITE_GOOGLE_MAPS_API_KEY
 *
 * @see https://developers.google.com/maps/documentation
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Autocomplete session for billing optimization
 * Sessions group autocomplete requests for reduced pricing
 */
interface AutocompleteSession {
  token: string;
  createdAt: number;
  requestCount: number;
}

/**
 * Autocomplete prediction from Places API
 */
export interface AutocompletePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

/**
 * Structured address result
 */
export interface AddressResult {
  formattedAddress: string;
  streetNumber: string;
  route: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  country: string;
  placeId: string;
  latitude: number;
  longitude: number;
}

/**
 * Address validation result
 */
export interface AddressValidationResult {
  isValid: boolean;
  verdict: 'CONFIRMED' | 'UNCONFIRMED_BUT_PLAUSIBLE' | 'SUSPICIOUS' | 'INVALID';
  inputAddress: string;
  standardizedAddress: AddressResult | null;
  missingComponents: string[];
  unconfirmedComponents: string[];
  suggestions: string[];
  isPoBox: boolean;
  isResidential: boolean;
}

/**
 * California Superior Court location
 */
export interface CaliforniaCourt {
  county: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  hours: string;
  filingUrl: string;
  dvUnitPhone?: string;
  dvSpecificInfo?: string;
}

/**
 * Distance calculation result
 */
export interface DistanceResult {
  originAddress: string;
  destinationAddress: string;
  distanceMiles: number;
  durationMinutes: number;
  durationText: string;
}

// ============================================================================
// Configuration
// ============================================================================

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// API endpoints
const PLACES_AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const PLACES_DETAILS_URL = 'https://places.googleapis.com/v1/places';
const ADDRESS_VALIDATION_URL = 'https://addressvalidation.googleapis.com/v1:validateAddress';
const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const ROUTES_URL = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';

// Session management
const SESSION_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes
let currentSession: AutocompleteSession | null = null;

// ============================================================================
// Session Token Management
// ============================================================================

/**
 * Generate a new session token
 * Session tokens group autocomplete requests for billing optimization
 */
function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or create an autocomplete session
 * Sessions expire after 3 minutes of inactivity
 */
function getOrCreateSession(): AutocompleteSession {
  const now = Date.now();

  // Check if current session is expired
  if (
    currentSession &&
    now - currentSession.createdAt < SESSION_TIMEOUT_MS &&
    currentSession.requestCount < 12 // Free tier limit
  ) {
    currentSession.requestCount++;
    return currentSession;
  }

  // Create new session
  currentSession = {
    token: generateSessionToken(),
    createdAt: now,
    requestCount: 1,
  };

  return currentSession;
}

/**
 * Clear the current session (call after place selection)
 */
export function clearAutocompleteSession(): void {
  currentSession = null;
}

// ============================================================================
// Address Autocomplete
// ============================================================================

/**
 * Get address autocomplete predictions
 *
 * @param input - User's typed input
 * @param options - Optional configuration
 * @returns Array of autocomplete predictions
 *
 * @example
 * const predictions = await getAutocompletePredictions('123 Main');
 * // [{ placeId: '...', description: '123 Main St, Los Angeles, CA', ... }]
 */
export async function getAutocompletePredictions(
  input: string,
  options: {
    types?: string[];
    regionCode?: string;
    locationBias?: { lat: number; lng: number; radius: number };
  } = {}
): Promise<AutocompletePrediction[]> {
  if (!API_KEY) {
    console.warn('Google Maps API key not configured');
    return [];
  }

  if (!input || input.length < 3) {
    return [];
  }

  const session = getOrCreateSession();

  try {
    const requestBody: Record<string, unknown> = {
      input,
      sessionToken: session.token,
      includedPrimaryTypes: options.types || ['street_address', 'premise', 'subpremise'],
      includedRegionCodes: [options.regionCode || 'us'],
      languageCode: 'en',
    };

    // Add location bias for California if not specified
    if (options.locationBias) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: options.locationBias.lat,
            longitude: options.locationBias.lng,
          },
          radius: options.locationBias.radius,
        },
      };
    } else {
      // Default: bias toward California
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: 36.7783, // California center
            longitude: -119.4179,
          },
          radius: 500000, // 500km radius
        },
      };
    }

    const response = await fetch(PLACES_AUTOCOMPLETE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'suggestions.placePrediction',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Autocomplete error:', error);
      return [];
    }

    const data = await response.json();

    return (data.suggestions || []).map((suggestion: { placePrediction: {
      placeId: string;
      text: { text: string };
      structuredFormat: { mainText: { text: string }; secondaryText: { text: string } };
      types: string[];
    }}) => ({
      placeId: suggestion.placePrediction.placeId,
      description: suggestion.placePrediction.text.text,
      mainText: suggestion.placePrediction.structuredFormat?.mainText?.text || '',
      secondaryText: suggestion.placePrediction.structuredFormat?.secondaryText?.text || '',
      types: suggestion.placePrediction.types || [],
    }));
  } catch (error) {
    console.error('Autocomplete request failed:', error);
    return [];
  }
}

/**
 * Get place details by Place ID
 *
 * @param placeId - Google Place ID from autocomplete
 * @returns Structured address result
 */
export async function getPlaceDetails(placeId: string): Promise<AddressResult | null> {
  if (!API_KEY || !placeId) {
    return null;
  }

  try {
    const response = await fetch(`${PLACES_DETAILS_URL}/${placeId}`, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask':
          'id,formattedAddress,addressComponents,location,types',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Place details error:', error);
      return null;
    }

    const data = await response.json();

    // Clear session after successful place selection
    clearAutocompleteSession();

    return parseAddressComponents(data);
  } catch (error) {
    console.error('Place details request failed:', error);
    return null;
  }
}

// ============================================================================
// Address Validation
// ============================================================================

/**
 * Validate and standardize an address
 *
 * @param address - Address to validate (can be partial or full)
 * @returns Validation result with standardized address
 *
 * @example
 * const result = await validateAddress('123 main st, LA');
 * // { isValid: true, standardizedAddress: { ... }, ... }
 */
export async function validateAddress(
  address: string | {
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }
): Promise<AddressValidationResult> {
  if (!API_KEY) {
    return createInvalidResult('Google Maps API key not configured');
  }

  // Build address object
  let addressObj: Record<string, string>;
  if (typeof address === 'string') {
    addressObj = {
      addressLines: [address],
      regionCode: 'US',
    };
  } else {
    const lines: string[] = [];
    if (address.streetAddress) lines.push(address.streetAddress);

    const cityStateZip = [
      address.city,
      address.state,
      address.zipCode,
    ].filter(Boolean).join(' ');

    if (cityStateZip) lines.push(cityStateZip);

    addressObj = {
      addressLines: lines,
      regionCode: 'US',
    };
  }

  try {
    const response = await fetch(`${ADDRESS_VALIDATION_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: addressObj,
        enableUspsCass: true, // USPS standardization
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Address validation error:', error);
      return createInvalidResult(error.error?.message || 'Validation failed');
    }

    const data = await response.json();
    return parseValidationResponse(data, typeof address === 'string' ? address : addressObj.addressLines.join(', '));
  } catch (error) {
    console.error('Address validation request failed:', error);
    return createInvalidResult('Network error during validation');
  }
}

// ============================================================================
// Court Location Finder
// ============================================================================

/**
 * Get California court by county name
 *
 * @param county - California county name
 * @returns Court information or null if not found
 *
 * @example
 * const court = await getCourtByCounty('Los Angeles');
 * // { name: 'Los Angeles Superior Court', address: '...', ... }
 */
export async function getCourtByCounty(county: string): Promise<CaliforniaCourt | null> {
  // Note: In production, this would query the california_courts table
  // For now, we return from the hardcoded list

  const normalizedCounty = county.toLowerCase().trim();

  const court = CALIFORNIA_COURTS.find(
    c => c.county.toLowerCase() === normalizedCounty
  );

  return court || null;
}

/**
 * Find nearest court by coordinates
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Nearest court with distance
 */
export async function findNearestCourt(
  lat: number,
  lng: number
): Promise<{ court: CaliforniaCourt; distanceMiles: number } | null> {
  let nearest: { court: CaliforniaCourt; distance: number } | null = null;

  for (const court of CALIFORNIA_COURTS) {
    const distance = calculateHaversineDistance(
      lat,
      lng,
      court.coordinates.lat,
      court.coordinates.lng
    );

    if (!nearest || distance < nearest.distance) {
      nearest = { court, distance };
    }
  }

  return nearest
    ? { court: nearest.court, distanceMiles: nearest.distance }
    : null;
}

// ============================================================================
// Distance Calculation
// ============================================================================

/**
 * Calculate distance and duration between two addresses
 * Useful for custody/visitation planning in DV-105
 *
 * @param origin - Origin address
 * @param destination - Destination address
 * @returns Distance and duration information
 */
export async function calculateDistance(
  origin: string,
  destination: string
): Promise<DistanceResult | null> {
  if (!API_KEY || !origin || !destination) {
    return null;
  }

  try {
    const response = await fetch(ROUTES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status,condition',
      },
      body: JSON.stringify({
        origins: [{ waypoint: { address: origin } }],
        destinations: [{ waypoint: { address: destination } }],
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Route calculation error:', error);
      return null;
    }

    const data = await response.json();

    if (!data[0] || data[0].status?.code !== 0) {
      return null;
    }

    const result = data[0];
    const distanceMeters = result.distanceMeters || 0;
    const durationSeconds = parseInt(result.duration?.replace('s', '') || '0', 10);

    return {
      originAddress: origin,
      destinationAddress: destination,
      distanceMiles: metersToMiles(distanceMeters),
      durationMinutes: Math.round(durationSeconds / 60),
      durationText: formatDuration(durationSeconds),
    };
  } catch (error) {
    console.error('Route calculation request failed:', error);
    return null;
  }
}

// ============================================================================
// Privacy Utilities
// ============================================================================

/**
 * Check if an address is a PO Box
 * Important for DV cases where victims may use PO boxes for safety
 */
export function isPoBox(address: string): boolean {
  const poBoxPatterns = [
    /\bp\.?\s*o\.?\s*box\b/i,
    /\bpost\s*office\s*box\b/i,
    /\bpo\s*box\b/i,
    /\bpob\b/i,
  ];

  return poBoxPatterns.some(pattern => pattern.test(address));
}

/**
 * Check if address appears to be a California Safe at Home address
 * California's Address Confidentiality Program for DV victims
 */
export function isSafeAtHomeAddress(address: string): boolean {
  const safeAtHomePatterns = [
    /\bp\.?\s*o\.?\s*box\s*531297\b/i, // Safe at Home PO Box
    /\bsacramento,?\s*ca\s*95853\b/i, // Safe at Home ZIP
  ];

  return safeAtHomePatterns.some(pattern => pattern.test(address));
}

/**
 * Mask address for logging (privacy-safe)
 * Only logs city/county, never full address
 */
export function maskAddressForLogging(address: AddressResult): string {
  return `${address.city}, ${address.county || address.state}`;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse Google Places address components into structured format
 */
function parseAddressComponents(data: {
  formattedAddress?: string;
  addressComponents?: Array<{
    longText: string;
    shortText: string;
    types: string[];
  }>;
  location?: { latitude: number; longitude: number };
  id?: string;
}): AddressResult {
  const components = data.addressComponents || [];

  const getComponent = (type: string): string => {
    const component = components.find(c => c.types.includes(type));
    return component?.longText || '';
  };

  const getShortComponent = (type: string): string => {
    const component = components.find(c => c.types.includes(type));
    return component?.shortText || '';
  };

  return {
    formattedAddress: data.formattedAddress || '',
    streetNumber: getComponent('street_number'),
    route: getComponent('route'),
    city: getComponent('locality') || getComponent('sublocality'),
    state: getShortComponent('administrative_area_level_1'),
    zipCode: getComponent('postal_code'),
    county: getComponent('administrative_area_level_2').replace(' County', ''),
    country: getShortComponent('country'),
    placeId: data.id || '',
    latitude: data.location?.latitude || 0,
    longitude: data.location?.longitude || 0,
  };
}

/**
 * Parse Address Validation API response
 */
function parseValidationResponse(
  data: {
    result?: {
      verdict?: {
        validationGranularity?: string;
        geocodeGranularity?: string;
        inputGranularity?: string;
        addressComplete?: boolean;
        hasUnconfirmedComponents?: boolean;
        hasInferredComponents?: boolean;
        hasReplacedComponents?: boolean;
      };
      address?: {
        formattedAddress?: string;
        addressComponents?: Array<{
          componentName: { text: string };
          componentType: string;
          confirmationLevel: string;
        }>;
      };
      geocode?: {
        location?: { latitude: number; longitude: number };
        placeId?: string;
      };
      metadata?: {
        residential?: boolean;
        business?: boolean;
        poBox?: boolean;
      };
      uspsData?: {
        standardizedAddress?: {
          firstAddressLine?: string;
          cityStateZipAddressLine?: string;
        };
      };
    };
  },
  inputAddress: string
): AddressValidationResult {
  const result = data.result;
  const verdict = result?.verdict;
  const address = result?.address;
  const metadata = result?.metadata;

  // Determine validation verdict
  let validationVerdict: AddressValidationResult['verdict'] = 'INVALID';

  if (verdict?.addressComplete && !verdict.hasUnconfirmedComponents) {
    validationVerdict = 'CONFIRMED';
  } else if (verdict?.addressComplete && verdict.hasUnconfirmedComponents) {
    validationVerdict = 'UNCONFIRMED_BUT_PLAUSIBLE';
  } else if (verdict?.geocodeGranularity === 'PREMISE' || verdict?.geocodeGranularity === 'SUB_PREMISE') {
    validationVerdict = 'UNCONFIRMED_BUT_PLAUSIBLE';
  } else {
    validationVerdict = 'SUSPICIOUS';
  }

  // Parse missing/unconfirmed components
  const missingComponents: string[] = [];
  const unconfirmedComponents: string[] = [];

  for (const component of address?.addressComponents || []) {
    if (component.confirmationLevel === 'UNCONFIRMED_BUT_PLAUSIBLE') {
      unconfirmedComponents.push(component.componentType);
    } else if (component.confirmationLevel === 'UNCONFIRMED_AND_SUSPICIOUS') {
      missingComponents.push(component.componentType);
    }
  }

  // Build standardized address
  const standardizedAddress: AddressResult | null = address
    ? {
        formattedAddress: address.formattedAddress || '',
        streetNumber: getAddressComponent(address.addressComponents, 'street_number'),
        route: getAddressComponent(address.addressComponents, 'route'),
        city: getAddressComponent(address.addressComponents, 'locality'),
        state: getAddressComponent(address.addressComponents, 'administrative_area_level_1'),
        zipCode: getAddressComponent(address.addressComponents, 'postal_code'),
        county: getAddressComponent(address.addressComponents, 'administrative_area_level_2').replace(' County', ''),
        country: 'US',
        placeId: result?.geocode?.placeId || '',
        latitude: result?.geocode?.location?.latitude || 0,
        longitude: result?.geocode?.location?.longitude || 0,
      }
    : null;

  // Generate suggestions
  const suggestions: string[] = [];
  if (missingComponents.includes('street_number')) {
    suggestions.push('Add a street number to your address');
  }
  if (missingComponents.includes('postal_code')) {
    suggestions.push('Add a ZIP code to improve accuracy');
  }
  if (unconfirmedComponents.includes('subpremise')) {
    suggestions.push('Verify your apartment or unit number');
  }

  return {
    isValid: validationVerdict === 'CONFIRMED' || validationVerdict === 'UNCONFIRMED_BUT_PLAUSIBLE',
    verdict: validationVerdict,
    inputAddress,
    standardizedAddress,
    missingComponents,
    unconfirmedComponents,
    suggestions,
    isPoBox: metadata?.poBox || false,
    isResidential: metadata?.residential || false,
  };
}

function getAddressComponent(
  components: Array<{ componentName: { text: string }; componentType: string }> | undefined,
  type: string
): string {
  const component = components?.find(c => c.componentType === type);
  return component?.componentName.text || '';
}

function createInvalidResult(message: string): AddressValidationResult {
  return {
    isValid: false,
    verdict: 'INVALID',
    inputAddress: '',
    standardizedAddress: null,
    missingComponents: [],
    unconfirmedComponents: [],
    suggestions: [message],
    isPoBox: false,
    isResidential: false,
  };
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in miles
 */
function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function metersToMiles(meters: number): number {
  return Math.round((meters / 1609.344) * 10) / 10;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

// ============================================================================
// California Courts Data
// Note: This is a subset. Full 58 counties loaded from database in production.
// ============================================================================

const CALIFORNIA_COURTS: CaliforniaCourt[] = [
  {
    county: 'Los Angeles',
    name: 'Los Angeles Superior Court - Stanley Mosk Courthouse',
    address: '111 N Hill St',
    city: 'Los Angeles',
    zipCode: '90012',
    coordinates: { lat: 34.0544, lng: -118.2439 },
    phone: '(213) 830-0800',
    hours: 'Mon-Fri 8:30am-4:30pm',
    filingUrl: 'https://www.lacourt.org/forms/familylaw',
    dvUnitPhone: '(213) 830-0845',
  },
  {
    county: 'San Diego',
    name: 'San Diego Superior Court - Central Division',
    address: '1100 Union St',
    city: 'San Diego',
    zipCode: '92101',
    coordinates: { lat: 32.7205, lng: -117.1628 },
    phone: '(619) 844-2700',
    hours: 'Mon-Fri 8:00am-4:00pm',
    filingUrl: 'https://www.sdcourt.ca.gov/sdcourt/family2/domesticviolence',
    dvUnitPhone: '(619) 844-2704',
  },
  {
    county: 'Orange',
    name: 'Orange County Superior Court - Lamoreaux Justice Center',
    address: '341 The City Dr S',
    city: 'Orange',
    zipCode: '92868',
    coordinates: { lat: 33.7824, lng: -117.8684 },
    phone: '(657) 622-5600',
    hours: 'Mon-Fri 8:00am-4:00pm',
    filingUrl: 'https://www.occourts.org/self-help/familylaw/',
    dvUnitPhone: '(657) 622-5656',
  },
  {
    county: 'Riverside',
    name: 'Riverside Superior Court - Family Law',
    address: '4175 Main St',
    city: 'Riverside',
    zipCode: '92501',
    coordinates: { lat: 33.9533, lng: -117.3962 },
    phone: '(951) 777-3147',
    hours: 'Mon-Fri 8:00am-4:00pm',
    filingUrl: 'https://www.riverside.courts.ca.gov/self-help',
    dvUnitPhone: '(951) 955-4600',
  },
  {
    county: 'San Bernardino',
    name: 'San Bernardino Superior Court - Family Law',
    address: '351 N Arrowhead Ave',
    city: 'San Bernardino',
    zipCode: '92415',
    coordinates: { lat: 34.1083, lng: -117.2898 },
    phone: '(909) 708-8747',
    hours: 'Mon-Fri 8:00am-4:00pm',
    filingUrl: 'https://www.sb-court.org/self-help',
    dvUnitPhone: '(909) 708-8747',
  },
  {
    county: 'Santa Clara',
    name: 'Santa Clara Superior Court - Family Court',
    address: '170 Park Center Plaza',
    city: 'San Jose',
    zipCode: '95113',
    coordinates: { lat: 37.3318, lng: -121.8863 },
    phone: '(408) 882-2100',
    hours: 'Mon-Fri 8:30am-4:00pm',
    filingUrl: 'https://www.scscourt.org/self_service/family/',
    dvUnitPhone: '(408) 882-2100',
  },
  {
    county: 'Alameda',
    name: 'Alameda Superior Court - Hayward Hall of Justice',
    address: '24405 Amador St',
    city: 'Hayward',
    zipCode: '94544',
    coordinates: { lat: 37.6712, lng: -122.0831 },
    phone: '(510) 891-6012',
    hours: 'Mon-Fri 8:30am-4:00pm',
    filingUrl: 'https://www.alameda.courts.ca.gov/self-help',
    dvUnitPhone: '(510) 891-6012',
  },
  {
    county: 'Sacramento',
    name: 'Sacramento Superior Court - Family Law',
    address: '3341 Power Inn Rd',
    city: 'Sacramento',
    zipCode: '95826',
    coordinates: { lat: 38.5595, lng: -121.4203 },
    phone: '(916) 874-5522',
    hours: 'Mon-Fri 8:00am-4:00pm',
    filingUrl: 'https://www.saccourt.ca.gov/family/family-law.aspx',
    dvUnitPhone: '(916) 874-7848',
  },
  {
    county: 'San Francisco',
    name: 'San Francisco Superior Court - Family Law',
    address: '400 McAllister St',
    city: 'San Francisco',
    zipCode: '94102',
    coordinates: { lat: 37.7808, lng: -122.4177 },
    phone: '(415) 551-4000',
    hours: 'Mon-Fri 8:30am-4:00pm',
    filingUrl: 'https://www.sfsuperiorcourt.org/divisions/family',
    dvUnitPhone: '(415) 551-4000',
  },
  {
    county: 'Fresno',
    name: 'Fresno Superior Court - Family Law',
    address: '1130 O St',
    city: 'Fresno',
    zipCode: '93721',
    coordinates: { lat: 36.7378, lng: -119.7871 },
    phone: '(559) 457-2000',
    hours: 'Mon-Fri 8:00am-4:00pm',
    filingUrl: 'https://www.fresno.courts.ca.gov/self-help',
    dvUnitPhone: '(559) 457-2000',
  },
];

// ============================================================================
// Exports
// ============================================================================

export {
  CALIFORNIA_COURTS,
  generateSessionToken,
};
