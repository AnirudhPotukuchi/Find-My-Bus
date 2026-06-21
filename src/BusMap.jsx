import { useEffect, useRef, useState } from "react";
import { CONFIG } from "./config";

// Helper to check and load Leaflet from CDN
function loadLeaflet(callback) {
  if (window.L) {
    callback();
    return;
  }

  // Check if link/script already injected
  let link = document.querySelector('link[href*="leaflet.css"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);
  }

  let script = document.querySelector('script[src*="leaflet.js"]');
  if (!script) {
    script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => callback();
    document.body.appendChild(script);
  } else {
    // Script is loading, check periodically
    const interval = setInterval(() => {
      if (window.L) {
        clearInterval(interval);
        callback();
      }
    }, 100);
  }
}

// Helper to check and load Mappls MapMyIndia script
function loadMappls(apiKey, callback) {
  if (window.mappls) {
    callback();
    return;
  }

  const scriptId = "mappls-sdk-script";
  let script = document.getElementById(scriptId);
  if (!script) {
    script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${apiKey}&layer=vector`;
    script.onload = () => {
      // MapMyIndia loaded - sometimes needs a slight tick to populate the window namespace
      const checkInterval = setInterval(() => {
        if (window.mappls) {
          clearInterval(checkInterval);
          callback();
        }
      }, 100);
    };
    script.onerror = () => {
      console.error("MapMyIndia script load error - falling back to Leaflet");
      callback(true); // pass true for error
    };
    document.body.appendChild(script);
  } else {
    const checkInterval = setInterval(() => {
      if (window.mappls) {
        clearInterval(checkInterval);
        callback();
      }
    }, 100);
  }
}

export default function BusMap({ stops, busLocation, activeRoute, theme }) {
  const containerRef = useRef(null);
  const [mapEngine, setMapEngine] = useState("loading"); // 'loading', 'mappls', 'leaflet', 'error'
  const mapInstanceRef = useRef(null);
  const busMarkerRef = useRef(null);
  const cbitMarkerRef = useRef(null);
  const stopMarkersRef = useRef([]);
  const polylineRef = useRef(null);
  const travelPolylineRef = useRef(null);

  // Retrieve MapMyIndia SDK key from developer config
  const mapplsKey = CONFIG.mapplsKey;

  useEffect(() => {
    if (mapplsKey) {
      loadMappls(mapplsKey, (err) => {
        if (err) {
          loadLeaflet(() => setMapEngine("leaflet"));
        } else {
          setMapEngine("mappls");
        }
      });
    } else {
      loadLeaflet(() => setMapEngine("leaflet"));
    }
  }, [mapplsKey]);

  // Clean up previous map instances if the engine shifts or theme changes
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        if (mapEngine === "leaflet" && typeof mapInstanceRef.current.remove === "function") {
          mapInstanceRef.current.remove();
        } else if (mapEngine === "mappls") {
          // Mappls cleanups if necessary (usually garbage collected)
        }
        mapInstanceRef.current = null;
      }
    };
  }, [mapEngine, theme]);

  // Handle map creation & updates
  useEffect(() => {
    if (mapEngine === "loading" || !containerRef.current) return;

    const defaultLat = 17.39197;
    const defaultLng = 78.31945;

    // Initialize Map Instance
    if (!mapInstanceRef.current) {
      if (mapEngine === "leaflet" && window.L) {
        const L = window.L;
        const map = L.map(containerRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([defaultLat, defaultLng], 12);

        // Dynamic tile layer matching the light or dark theme
        const tileUrl = theme === "light"
          ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

        L.tileLayer(tileUrl, {
          maxZoom: 20
        }).addTo(map);

        // Custom zoom controller position
        L.control.zoom({ position: "bottomright" }).addTo(map);

        mapInstanceRef.current = map;
      } else if (mapEngine === "mappls" && window.mappls) {
        const mappls = window.mappls;
        const map = new mappls.Map("mappls-map-container", {
          center: { lat: defaultLat, lng: defaultLng },
          zoom: 12,
          zoomControl: true,
          hybrid: false
        });
        mapInstanceRef.current = map;
      }
    }

    // Now, redraw route elements (CBIT, Bus marker, Stops polyline)
    const map = mapInstanceRef.current;
    if (!map) return;

    if (mapEngine === "leaflet" && window.L) {
      const L = window.L;

      // 1. Clear old elements
      if (polylineRef.current) polylineRef.current.remove();
      if (travelPolylineRef.current) travelPolylineRef.current.remove();
      if (busMarkerRef.current) busMarkerRef.current.remove();
      if (cbitMarkerRef.current) cbitMarkerRef.current.remove();
      stopMarkersRef.current.forEach(m => m.remove());
      stopMarkersRef.current = [];

      // 2. Draw static CBIT marker
      const cbitIcon = L.divIcon({
        html: `
          <div class="neon-marker cbit-marker">
            <div class="ping"></div>
            <div class="core">🏢</div>
            <span class="label">CBIT</span>
          </div>
        `,
        className: "custom-div-icon",
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      cbitMarkerRef.current = L.marker([defaultLat, defaultLng], { icon: cbitIcon }).addTo(map);

      // 3. Draw stops
      if (stops && stops.length > 0) {
        const latLngs = stops.map(s => [s.lat, s.lng]);

        // Draw milestone dots
        stops.forEach((stop, idx) => {
          // Skip end (since end has CBIT office building marker)
          if (idx !== stops.length - 1) {
            const stopIcon = L.divIcon({
              html: `
                <div class="neon-marker stop-marker">
                  <div class="core-dot"></div>
                  <span class="label-stop">${stop.name}</span>
                </div>
              `,
              className: "custom-div-icon",
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            const stMarker = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(map);
            stopMarkersRef.current.push(stMarker);
          }
        });

        // 4. Fit bounds to route
        map.fitBounds(L.latLngBounds(latLngs), {
          padding: [50, 50]
        });
      }

      // 5. Draw active bus marker & travel path
      if (busLocation && busLocation.latitude && busLocation.longitude) {
        const busPos = [busLocation.latitude, busLocation.longitude];

        const busIcon = L.divIcon({
          html: `
            <div class="neon-marker bus-marker active">
              <div class="ping-cyan"></div>
              <div class="core-bus">🚌</div>
              <span class="label-bus">Bus ${activeRoute?.number || ""}</span>
            </div>
          `,
          className: "custom-div-icon",
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        busMarkerRef.current = L.marker(busPos, { icon: busIcon }).addTo(map);

        // Travel path line removed as requested.

        // Keep bus centered with smooth panning if tracking active
        map.panTo(busPos);
      }
    } else if (mapEngine === "mappls" && window.mappls) {
      // MapMyIndia integration
      const mappls = window.mappls;

      // 1. Clear previous layers (Mappls requires calling remove() on markers)
      if (polylineRef.current) {
        if (typeof polylineRef.current.remove === "function") polylineRef.current.remove();
        polylineRef.current = null;
      }
      if (busMarkerRef.current) {
        if (typeof busMarkerRef.current.remove === "function") busMarkerRef.current.remove();
        busMarkerRef.current = null;
      }
      if (cbitMarkerRef.current) {
        if (typeof cbitMarkerRef.current.remove === "function") cbitMarkerRef.current.remove();
        cbitMarkerRef.current = null;
      }
      stopMarkersRef.current.forEach(m => {
        if (typeof m.remove === "function") m.remove();
      });
      stopMarkersRef.current = [];

      // 2. Draw static CBIT marker
      cbitMarkerRef.current = new mappls.Marker({
        map: map,
        position: { lat: defaultLat, lng: defaultLng },
        title: "CBIT Campus",
        html: `
          <div class="neon-marker cbit-marker">
            <div class="ping"></div>
            <div class="core">🏢</div>
            <span class="label">CBIT</span>
          </div>
        `
      });

      // 3. Draw stops
      if (stops && stops.length > 0) {
        stops.forEach((stop, idx) => {
          if (idx !== stops.length - 1) {
            const stMarker = new mappls.Marker({
              map: map,
              position: { lat: stop.lat, lng: stop.lng },
              title: stop.name,
              html: `<div class="neon-marker stop-marker"><div class="core-dot"></div><span class="label-stop">${stop.name}</span></div>`
            });
            stopMarkersRef.current.push(stMarker);
          }
        });

        // Fit bounds (Mappls Mapbox GL expects bounds array: [[minLng, minLat], [maxLng, maxLat]])
        const minLat = Math.min(...stops.map(s => s.lat));
        const maxLat = Math.max(...stops.map(s => s.lat));
        const minLng = Math.min(...stops.map(s => s.lng));
        const maxLng = Math.max(...stops.map(s => s.lng));
        map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 50 });
      }

      // 4. Draw bus marker
      if (busLocation && busLocation.latitude && busLocation.longitude) {
        const busPos = { lat: busLocation.latitude, lng: busLocation.longitude };

        busMarkerRef.current = new mappls.Marker({
          map: map,
          position: busPos,
          title: `Bus ${activeRoute?.number || ""}`,
          html: `
            <div class="neon-marker bus-marker active">
              <div class="ping-cyan"></div>
              <div class="core-bus">🚌</div>
              <span class="label-bus">Bus ${activeRoute?.number || ""}</span>
            </div>
          `
        });

        // Keep bus centered with smooth panning
        map.panTo(busPos);
      }
    }

    if (map) {
      setTimeout(() => {
        if (mapEngine === "leaflet" && typeof map.invalidateSize === "function") {
          map.invalidateSize();
        } else if (mapEngine === "mappls" && typeof map.resize === "function") {
          map.resize();
        }
        window.dispatchEvent(new Event('resize'));
      }, 150);
    }
  }, [mapEngine, stops, busLocation, activeRoute, theme]);

  // Handle window resizing dynamically to invalidate map bounds & container sizes
  useEffect(() => {
    if (mapEngine === "loading" || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    let resizeTimeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (mapEngine === "leaflet" && typeof map.invalidateSize === "function") {
          map.invalidateSize();
        } else if (mapEngine === "mappls" && typeof map.resize === "function") {
          map.resize();
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [mapEngine]);

  if (mapEngine === "loading") {
    return (
      <div className="map-loader-container">
        <div className="radar-spinner">
          <div className="circle-pulse text-violet"></div>
          <div className="circle-pulse text-cyan" style={{ animationDelay: "0.5s" }}></div>
          <span className="loader-text font-mono">INITIALIZING MAP SENSORS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="map-wrapper-container">
      <div id="mappls-map-container" ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div className="map-badge font-mono">
        <span className={`status-dot ${mapEngine === "mappls" ? "bg-cyan" : "bg-violet"}`}></span>
        {mapEngine === "mappls" 
          ? "MAPMYINDIA ACTIVE" 
          : `LEAFLET ${theme === "light" ? "LIGHT" : "DARK"} ACTIVE`}
      </div>
    </div>
  );
}
