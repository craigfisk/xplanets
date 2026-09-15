import { HelioVector, Body, MakeTime } from 'astronomy-engine';

export interface Planet {
  id: string;
  name: string;
  color: string;
  radius: number;
  periodDays: number;
  body: Body;
}

export const planetConfig: Planet[] = [
  { id: 'mercury', name: 'Mercury', color: '#A8B0A6', radius: 4, periodDays: 88, body: Body.Mercury },
  { id: 'venus', name: 'Venus', color: '#E3BB76', radius: 6, periodDays: 225, body: Body.Venus },
  { id: 'earth', name: 'Earth', color: '#6B93D6', radius: 6, periodDays: 365.25, body: Body.Earth },
  { id: 'mars', name: 'Mars', color: '#C1440E', radius: 5, periodDays: 687, body: Body.Mars },
  { id: 'jupiter', name: 'Jupiter', color: '#D39C7E', radius: 14, periodDays: 4333, body: Body.Jupiter },
  { id: 'saturn', name: 'Saturn', color: '#C5AB6E', radius: 12, periodDays: 10759, body: Body.Saturn },
  { id: 'uranus', name: 'Uranus', color: '#4CB5C6', radius: 9, periodDays: 30687, body: Body.Uranus },
  { id: 'neptune', name: 'Neptune', color: '#3250AE', radius: 9, periodDays: 60190, body: Body.Neptune },
  { id: 'pluto', name: 'Pluto', color: '#E8E8E8', radius: 3, periodDays: 90560, body: Body.Pluto },
];

export const LOG_SCALE_FACTOR = 150;
export const LOG_OFFSET = 1; // Added to log10(d) to ensure inner planets have positive rendering distance

/**
 * Calculates current distance in AU for a given celestial body
 */
export function getDistanceAU(body: Body, date: Date = new Date()): number {
  const time = MakeTime(date);
  const vec = HelioVector(body, time);
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

/**
 * Calculates current 2D position for a given celestial body using astronomy-engine
 * Uses log base 10 scale for distances to make the entire solar system visible at once.
 * @param body Celestial body
 * @param date Reference date
 * @returns [y, x] tuple corresponding to Leaflet coordinates (CRS.Simple maps y, x to standard plane)
 */
export function getCurrentPosition(body: Body, date: Date = new Date()): [number, number] {
  const time = MakeTime(date);
  const vec = HelioVector(body, time);
  
  // Get linear distance in AU
  const distanceAU = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  // Get orbital angle
  const angle = Math.atan2(vec.y, vec.x);
  
  // Transform distance to log base 10
  // e.g., Mercury (~0.38 AU) -> log10(0.38) + 1 = 0.58 * 150 = ~87px
  // e.g., Earth (1 AU) -> log10(1) + 1 = 1 * 150 = 150px
  // e.g., Pluto (~39.5 AU) -> log10(39.5) + 1 = 2.59 * 150 = ~389px
  const scaledRadius = (Math.log10(distanceAU) + LOG_OFFSET) * LOG_SCALE_FACTOR;
  
  // Leaflet expects coordinates in [lat, lng] format. In L.CRS.Simple,
  // this typically maps to [y, x] in a standard cartesian plane.
  return [scaledRadius * Math.sin(angle), scaledRadius * Math.cos(angle)];
}

/**
 * Generates an array of coordinates representing the orbital path over one revolution
 */
export function getOrbitPath(body: Body, periodDays: number, date: Date = new Date(), segments: number = 90): [number, number][] {
  const path: [number, number][] = [];
  const endTime = date.getTime();
  const step = (periodDays * 24 * 60 * 60 * 1000) / segments;
  
  for (let i = 0; i <= segments; i++) {
    const t = new Date(endTime - (segments - i) * step);
    path.push(getCurrentPosition(body, t));
  }
  return path;
}
