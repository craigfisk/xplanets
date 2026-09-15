<template>
  <div id="map" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { planetConfig, getCurrentPosition, getOrbitPath, getDistanceAU } from '../utils/planets';

const selectedPlanet = ref<string | null>(null);
const markerMap = new Map<string, L.CircleMarker>();

onMounted(() => {
  const map = L.map('map', {
    crs: L.CRS.Simple,
    center: [0, 0],
    zoom: 0,
    minZoom: -4,
    maxZoom: 3,
    attributionControl: false,
    zoomControl: true
  });

  const now = new Date();

  // Find max bounds to start map zoomed appropriately 
  // Let's fit to slightly past Mars (~2.5 AU = 375 pixels) by default, 
  // so the inner solar system is visible
  map.fitBounds([[-400, -400], [400, 400]]);

  // Draw the Sun
  L.circleMarker([0, 0], {
    radius: 12,
    color: '#FFD700',
    fillColor: '#FFD700',
    fillOpacity: 1,
    weight: 2,
    className: 'celestial-body sun'
  }).bindTooltip('Sun', { permanent: true, direction: 'bottom', offset: [0, 12], className: 'planet-tooltip' }).addTo(map);

  // Draw Orbits and Planets
  planetConfig.forEach(p => {
    // True Orbit Path Polyline
    const orbitPath = getOrbitPath(p.body, p.periodDays, now, 120);
    L.polyline(orbitPath, {
      color: '#666',
      weight: 1,
      dashArray: '5, 5',
      className: `orbit-path orbit-${p.id}`,
      interactive: false
    }).addTo(map);

    // Planet Marker
    const position = getCurrentPosition(p.body, now);
    
    const marker = L.circleMarker(position, {
      radius: p.radius,
      color: p.color,
      fillColor: p.color,
      fillOpacity: 1,
      weight: 2,
      className: `planet-marker planet-${p.id}`
    }).addTo(map);

    // HTML tooltip showing name and period
    const distanceAU = getDistanceAU(p.body, now);
    const tooltipContent = `<div style="text-align: center;">${p.name}<br/>${p.periodDays} Earth days<br/>${distanceAU.toFixed(2)} AU</div>`;

    marker.bindTooltip(tooltipContent, {
      permanent: true,
      direction: 'bottom',
      offset: [0, p.radius + 2],
      className: 'planet-tooltip'
    });

    markerMap.set(p.id, marker);

    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e); // Prevent map click from firing
      selectPlanet(p.id);
    });
  });

  // Background click to clear selection
  map.on('click', () => {
    clearSelection();
  });
});

function updateMarkerStyles() {
  planetConfig.forEach(p => {
    const marker = markerMap.get(p.id);
    if (!marker) return;

    if (selectedPlanet.value === p.id) {
      marker.setStyle({
        color: '#00FF00', // Bright green
        fillColor: '#00FF00'
      });
    } else {
      marker.setStyle({
        color: p.color, // Reset to original color
        fillColor: p.color
      });
    }
  });
}

function selectPlanet(id: string) {
  selectedPlanet.value = id;
  updateMarkerStyles();
}

function clearSelection() {
  selectedPlanet.value = null;
  updateMarkerStyles();
}
</script>

<style>
.map-container {
  width: 100%;
  height: 100%;
  background-color: #0B0E14; /* Deep space background */
}

/* Customize Leaflet tooltips to look better against dark background */
.leaflet-tooltip.planet-tooltip {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: white !important;
  font-weight: bold;
  text-shadow: 1px 1px 2px black;
  font-size: 14px;
  line-height: 1.2;
}
.leaflet-tooltip-left::before,
.leaflet-tooltip-right::before,
.leaflet-tooltip-top::before,
.leaflet-tooltip-bottom::before {
  display: none !important; /* Hide tooltip arrows */
}

/* Ensure markers can be targetted in tests */
.planet-marker {
  cursor: pointer;
}
</style>
