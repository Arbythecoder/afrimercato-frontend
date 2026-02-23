/**
 * AFRIMERCATO - Location Constants
 * Single source of truth for city suggestions across the app
 * Coverage: UK + Dublin (Ireland)
 */

export const SUGGESTED_CITIES = [
  // UK Major Cities
  { name: 'London', country: 'UK', region: 'England' },
  { name: 'Manchester', country: 'UK', region: 'England' },
  { name: 'Birmingham', country: 'UK', region: 'England' },
  { name: 'Leeds', country: 'UK', region: 'England' },
  { name: 'Liverpool', country: 'UK', region: 'England' },
  { name: 'Bristol', country: 'UK', region: 'England' },
  { name: 'Nottingham', country: 'UK', region: 'England' },
  { name: 'Sheffield', country: 'UK', region: 'England' },
  { name: 'Newcastle', country: 'UK', region: 'England' },
  { name: 'Leicester', country: 'UK', region: 'England' },
  
  // Additional UK Cities (QA Request)
  { name: 'Worthing', country: 'UK', region: 'England' },
  { name: 'Hull', country: 'UK', region: 'England' },
  { name: 'Southampton', country: 'UK', region: 'England' },
  { name: 'Cardiff', country: 'UK', region: 'Wales' },
  { name: 'Edinburgh', country: 'UK', region: 'Scotland' },
  { name: 'Glasgow', country: 'UK', region: 'Scotland' },
  
  // Ireland (Dublin focus)
  { name: 'Dublin', country: 'Ireland', region: 'Leinster' },
]

export const NEARBY_SUGGESTIONS = {
  'Hull': ['Leeds', 'Sheffield', 'Nottingham'],
  'Worthing': ['Brighton', 'Southampton', 'London'],
  'Dublin': [], // No nearby suggestions for Dublin
  'default': ['London', 'Manchester', 'Birmingham', 'Dublin']
}

export const DEFAULT_RADIUS_KM = 25

// Postcode/Eircode validation regex
export const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i
export const IE_EIRCODE_REGEX = /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i
export const DUBLIN_EIRCODE_PREFIX = /^(D\d{2}|A\d{2})/i // Dublin postcodes start with D or A

export const ALLOWED_COUNTRIES = ['United Kingdom', 'Ireland', 'UK', 'IE', 'GB']

export const REGION_ERROR_MESSAGE = 'We currently support delivery only in Dublin (Ireland) and the UK.'
