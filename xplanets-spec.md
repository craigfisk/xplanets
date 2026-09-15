# XPlanets Interactive Map: Technical Specification

## 1. Overview
XPlanets is an interactive web application that visualizes the solar system using a 2D slippy map interface. It displays the Sun, the 8 major planets, and Pluto (designated as an "xplanet") along their orbital paths. Users can interact with the planets by clicking them to highlight them in bright green, with the highlight dismissing upon clicking anywhere else.

## 2. Technology Stack
*   **Framework:** [AstroJS](https://astro.build/) - For fast static site generation and component islands.
*   **UI Components:** [Vue 3](https://vuejs.org/) - For handling interactive state (selected planets) and reactivity within Astro.
*   **Mapping Engine:** [Leaflet](https://leafletjs.com/) - For rendering the interactive 2D canvas, panning, and zooming.
*   **Hosting:** [Netlify](https://www.netlify.com/) - For automated deployments and hosting.
*   **Version Control:** [GitHub](https://github.com/) - For source code management and triggering CI/CD pipelines.

## 3. Architecture & Project Structure
The application will use Astro as the primary layout engine, injecting a Vue component that initializes and manages the Leaflet map.

```text
├── src/
│   ├── components/
│   │   └── SolarSystemMap.vue    # Vue component containing Leaflet logic
│   ├── layouts/
│   │   └── Layout.astro          # Global HTML shell
│   └── pages/
│       └── index.astro           # Main page rendering <SolarSystemMap client:only="vue" />
├── public/                       # Static assets (if any)
├── astro.config.mjs              # Astro configuration (Vue integration enabled)
└── package.json                  # Dependencies (astro, @astrojs/vue, vue, leaflet)
```

## 4. Feature Specifications

### 4.1 Leaflet Canvas (Non-Geographical Map)
*   **Coordinate Reference System:** Leaflet will be configured using `L.CRS.Simple` to act as a pure 2D grid instead of a geographical map.
*   **The Sun:** Placed at the center `[0, 0]` as a large yellow circle/marker.

### 4.2 Planets & Orbits
*   **Entities:** Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto (xplanet).
*   **Orbits:** Represented by `L.circle` instances centered at `[0, 0]` with a transparent fill and a thin, dashed white/grey border.
*   **Planet Markers:** Rendered using `L.circleMarker` or custom `L.divIcon` on their respective orbital rings.
*   **Labels:** Each planet will have a permanent adjacent label containing its name. This can be achieved using Leaflet `Tooltip` bound to the markers with `{ permanent: true, direction: 'right' }`.

### 4.3 Interaction Design
*   **Selection (Shading):** 
    *   When a user clicks on a planet's marker, its styling dynamically updates (via Vue state mapped to Leaflet style methods, or raw DOM manipulation on the `L.divIcon`) to a bright green fill/background.
*   **Deselection:** 
    *   Clicking anywhere on the empty map canvas triggers the map's `click` event.
    *   The event handler will clear the active selection, removing the bright green shade and restoring the planet's default color.

## 5. Implementation Details (Vue + Leaflet)

*   **State Management:** The Vue component will hold a `selectedPlanet` reactive ref. 
*   **Rendering Loop:** 
    ```javascript
    // Conceptual flow inside SolarSystemMap.vue
    const map = L.map('map', { crs: L.CRS.Simple, center: [0,0], zoom: 1 });
    
    // Draw Orbits
    planets.forEach(p => L.circle([0,0], { radius: p.distance }).addTo(map));
    
    // Draw Planets
    planets.forEach(p => {
        const marker = L.circleMarker([0, p.distance], { color: 'defaultColor' }).addTo(map);
        marker.bindTooltip(p.name, { permanent: true });
        
        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e); // Prevent map click
            selectPlanet(p.name);
            // Apply bright green styling
        });
    });

    // Handle background click
    map.on('click', () => {
        clearSelection();
    });
    ```

## 6. Deployment Workflow (GitHub -> Netlify)
1.  **Version Control:** Code is pushed to the `main` branch of the designated GitHub repository.
2.  **Netlify Configuration:** The Netlify project is connected to the GitHub repository.
3.  **Build Settings:** 
    *   Build command: `npm run build`
    *   Publish directory: `dist/`
4.  **Continuous Deployment:** Every push to `main` will automatically trigger a Netlify build, rendering the Astro static files and deploying the interactive Vue/Leaflet bundle globally.