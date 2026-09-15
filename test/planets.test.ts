import { describe, it, expect } from 'vitest';
import { Body } from 'astronomy-engine';
import { getCurrentPosition, getOrbitPath, planetConfig } from '../src/utils/planets';

describe('Planet Utilities', () => {
  it('should correctly configure 9 planets/bodies', () => {
    expect(planetConfig.length).toBe(9);
    expect(planetConfig.find(p => p.id === 'earth')?.periodDays).toBe(365.25);
  });

  it('should calculate valid current position', () => {
    const pos = getCurrentPosition(Body.Earth, new Date('2024-01-01T00:00:00Z'));
    expect(pos).toBeDefined();
    expect(pos.length).toBe(2);
    expect(typeof pos[0]).toBe('number');
    expect(typeof pos[1]).toBe('number');
    // Earth is approx 1 AU away, so distance from [0,0] should be around AU_TO_PIXELS (150)
    const distance = Math.sqrt(pos[0]*pos[0] + pos[1]*pos[1]);
    expect(distance).toBeGreaterThan(130);
    expect(distance).toBeLessThan(160);
  });

  it('should generate an orbit path', () => {
    const path = getOrbitPath(Body.Mars, 687, new Date(), 10);
    expect(path.length).toBe(11); // segments + 1
    
    // First and last points should be similar (full orbit)
    const firstPoint = path[0];
    const lastPoint = path[path.length - 1];
    
    // Allow slight tolerance due to eccentric orbits and not-perfectly-closed loop in simplified periods
    const dx = Math.abs(firstPoint[1] - lastPoint[1]);
    const dy = Math.abs(firstPoint[0] - lastPoint[0]);
    expect(dx).toBeLessThan(5);
    expect(dy).toBeLessThan(5);
  });
});
