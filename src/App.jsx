import { useState, useEffect, useRef } from "react";
import {
  Bus,
  Share2,
  Play,
  Square,
  Search,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Info,
  Navigation,
  Gauge,
  Activity
} from "lucide-react";
import { ALL_ROUTES, ROUTES_BY_NUMBER, getDistanceKm, getInterpolatedPath, CBIT_COORDS } from "./routesData";
import { syncService } from "./syncService";
import BusMap from "./BusMap";
import "./App.css";

// Generate unique session token for exclusive access tracking check
const sessionToken = (() => {
  let token = sessionStorage.getItem("cbit_bus_session_token");
  if (!token) {
    token = `session_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem("cbit_bus_session_token", token);
  }
  return token;
})();

export default function App() {
  // App navigation and search state
  const [selectedBusNumber, setSelectedBusNumber] = useState("");
  const [activeSearchBus, setActiveSearchBus] = useState(null); // route details object
  const [liveBusCoordinates, setLiveBusCoordinates] = useState(null); // coordinates of searched bus
  const [allActiveBuses, setAllActiveBuses] = useState({}); // dashboard state of all active buses

  // UI Dialog overlays
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Active user sharing state (if this tab is broadcasting)
  const [sharingState, setSharingState] = useState({
    isActive: false,
    busNumber: "",
    isSimulating: false,
    speed: 0,
    heading: 0,
    distanceToCbit: 0,
    accuracy: 0
  });

  // Refs for tracking timers and intervals
  const simulationIntervalRef = useRef(null);
  const watchPositionIdRef = useRef(null);

  // Handle active notifications
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
  };

  // Keep a pure timestamp in state for render path freshness checks
  const [now, setNow] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => setNow(Date.now()), 0);
    const interval = setInterval(() => setNow(Date.now()), 5000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  // Auto-dismiss notification hook
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Subscribe to all live buses for the landing dashboard grid
  useEffect(() => {
    const unsubscribe = syncService.subscribeToAllBuses((buses) => {
      setAllActiveBuses(buses);
    });
    return () => unsubscribe();
  }, []);

  // Listen to coordinates updates of the bus currently being viewed/searched
  useEffect(() => {
    if (!activeSearchBus) return;

    let isFirstLoad = true;
    let lastActiveState = null;

    const unsubscribe = syncService.subscribeToBus(activeSearchBus.number, (busData) => {
      const isBusActive = !!(busData && busData.isActive);

      if (isBusActive) {
        setLiveBusCoordinates(busData);
      } else {
        setLiveBusCoordinates(null);

        // Only alert if first loading or if transitioned from active to offline
        if (isFirstLoad || lastActiveState === true) {
          showNotification(`Bus ${activeSearchBus.number} is currently offline.`, "info");
        }
      }

      isFirstLoad = false;
      lastActiveState = isBusActive;
    });

    return () => unsubscribe();
  }, [activeSearchBus]);

  // Helper to trigger auto-termination when bus reaches CBIT
  const triggerAutoTermination = async (busNum, reason = "destination") => {
    // 1. Clear intervals and watch queries
    if (watchPositionIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchPositionIdRef.current);
      watchPositionIdRef.current = null;
    }
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    // 2. Update database node (sets active to false, clears location fields)
    await syncService.stopTracking(busNum, sessionToken);

    // 3. Reset local states
    setSharingState({
      isActive: false,
      busNumber: "",
      isSimulating: false,
      speed: 0,
      heading: 0,
      distanceToCbit: 0,
      accuracy: 0
    });

    // 4. Show success alerts
    if (reason === "destination") {
      alert(`🚩 Trip completed! Bus ${busNum} has arrived at CBIT. Location tracking has been auto-terminated.`);
      showNotification(`Trip completed! Bus ${busNum} reached CBIT.`, "success");
    } else {
      showNotification(`Live sharing stopped for Bus ${busNum}.`, "info");
    }
  };

  // Start Location Sharing (either simulation or real GPS)
  const handleStartSharing = async (busNum, isSim) => {
    const route = ROUTES_BY_NUMBER[busNum];
    if (!route) return;

    // Exclusive access check: ask DB if bus is already active
    const lockCheck = await syncService.tryStartTracking(busNum, route.name, sessionToken);

    if (!lockCheck.success) {
      const lockOwner = lockCheck.currentData;
      if (lockOwner && lockOwner.sharedBy !== sessionToken) {
        alert(`❌ Access Denied: Location for Bus ${busNum} (${route.name}) is already being shared by another user.`);
        showNotification(`Location for Bus ${busNum} is already being shared`, "error");
        return;
      }
    }

    // Lock successfully acquired or confirmed
    setIsShareModalOpen(false);
    showNotification(`Sharing live location for Bus ${busNum}...`, "success");

    if (isSim) {
      // SIMULATION MODE
      const pathPoints = getInterpolatedPath(route.stops, 25);
      let currentIndex = 0;

      setSharingState({
        isActive: true,
        busNumber: busNum,
        isSimulating: true,
        speed: 45, // steady 45 km/h
        heading: 0,
        distanceToCbit: getDistanceKm(pathPoints[0].lat, pathPoints[0].lng, CBIT_COORDS.lat, CBIT_COORDS.lng),
        accuracy: 5
      });

      // Post initial coordinate update
      const initialCoords = {
        latitude: pathPoints[0].lat,
        longitude: pathPoints[0].lng,
        speed: 12.5, // 45 km/h in m/s
        heading: 90
      };
      await syncService.updateLocation(busNum, initialCoords, sessionToken);

      // Start tick ticker
      simulationIntervalRef.current = setInterval(async () => {
        currentIndex++;
        if (currentIndex >= pathPoints.length) {
          // Reached destination
          await triggerAutoTermination(busNum, "destination");
          return;
        }

        const point = pathPoints[currentIndex];
        const nextPoint = pathPoints[currentIndex + 1] || point;
        
        // Calculate compass heading angle between nodes
        const dy = nextPoint.lat - point.lat;
        const dx = nextPoint.lng - point.lng;
        const headingAngle = Math.round((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;

        const dist = getDistanceKm(point.lat, point.lng, CBIT_COORDS.lat, CBIT_COORDS.lng);
        const speedVar = 40 + Math.floor(Math.random() * 15); // fluctuate between 40-55 km/h

        setSharingState(prev => ({
          ...prev,
          speed: speedVar,
          heading: headingAngle,
          distanceToCbit: dist
        }));

        const coords = {
          latitude: point.lat,
          longitude: point.lng,
          speed: speedVar / 3.6, // convert back to m/s
          heading: headingAngle
        };

        await syncService.updateLocation(busNum, coords, sessionToken);

        // Distance guard check: if within 100 meters (0.1 km), terminate
        if (dist <= 0.1) {
          await triggerAutoTermination(busNum, "destination");
        }
      }, 1000);

    } else {
      // REAL GEOLOCATION MODE
      if (!("geolocation" in navigator)) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      setSharingState({
        isActive: true,
        busNumber: busNum,
        isSimulating: false,
        speed: 0,
        heading: 0,
        distanceToCbit: Infinity,
        accuracy: 0
      });

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      const success = async (position) => {
        const { latitude, longitude, speed, heading, accuracy } = position.coords;
        const dist = getDistanceKm(latitude, longitude, CBIT_COORDS.lat, CBIT_COORDS.lng);
        const kmhSpeed = speed ? Math.round(speed * 3.6) : 0;
        const courseHeading = heading || 0;

        setSharingState(prev => ({
          ...prev,
          speed: kmhSpeed,
          heading: courseHeading,
          distanceToCbit: dist,
          accuracy: Math.round(accuracy)
        }));

        const coords = {
          latitude,
          longitude,
          speed: speed || 0,
          heading: courseHeading
        };

        await syncService.updateLocation(busNum, coords, sessionToken);

        // Distance guard checks (terminate if inside 100m radius of CBIT)
        if (dist <= 0.1) {
          await triggerAutoTermination(busNum, "destination");
        }
      };

      const error = (err) => {
        console.error("GPS Watch Position Error:", err);
        showNotification(`GPS Sensor Error: ${err.message}`, "error");
      };

      watchPositionIdRef.current = navigator.geolocation.watchPosition(success, error, options);
    }
  };

  const handleSearch = () => {
    if (!selectedBusNumber) {
      showNotification("Please select a bus number first.", "error");
      return;
    }
    const route = ROUTES_BY_NUMBER[selectedBusNumber];
    if (route) {
      setActiveSearchBus(route);
    }
  };

  const handleBackToSearch = () => {
    setActiveSearchBus(null);
    setLiveBusCoordinates(null);
  };

  // Generate lists of active buses from snapshot
  const activeBusesList = Object.entries(allActiveBuses)
    .filter(([, data]) => data.isActive && data.lastUpdated && (now - data.lastUpdated < 30000))
    .map(([num, data]) => ({
      number: num,
      name: ROUTES_BY_NUMBER[num]?.name || "UNKNOWN ROUTE",
      ...data
    }));

  // Calculate timeline milestone index based on coordinates proximity
  const getTimelineMilestoneStates = (stops, busLoc) => {
    if (!busLoc || !busLoc.latitude) {
      return { activeIndex: 0, passedIndices: [] };
    }
    
    // Find milestone with minimum distance to bus location
    let closestIndex = 0;
    let minDistance = Infinity;

    stops.forEach((stop, idx) => {
      const dist = getDistanceKm(busLoc.latitude, busLoc.longitude, stop.lat, stop.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    const passedIndices = [];
    for (let i = 0; i < closestIndex; i++) {
      passedIndices.push(i);
    }

    return { activeIndex: closestIndex, passedIndices };
  };

  const milestoneStates = activeSearchBus ? getTimelineMilestoneStates(activeSearchBus.stops, liveBusCoordinates) : { activeIndex: 0, passedIndices: [] };
  const fillPercent = activeSearchBus && activeSearchBus.stops.length > 1 
    ? (milestoneStates.activeIndex / (activeSearchBus.stops.length - 1)) * 100 
    : 0;

  return (
    <>
      {/* Dynamic Alert Banner */}
      {notification && (
        <div className={`modal-overlay`} style={{ background: "transparent", pointerEvents: "none", justifyContent: "flex-end", alignItems: "flex-start" }}>
          <div className={`glass-panel glow-${notification.type === "error" ? "red" : notification.type === "success" ? "cyan" : "violet"}`} style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: "10px", margin: "16px", padding: "12px 20px" }}>
            {notification.type === "error" ? (
              <AlertCircle className="text-danger" size={20} />
            ) : (
              <CheckCircle2 className="text-success" size={20} />
            )}
            <span className="font-mono text-sm">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Floating Share Live Location sticky banner */}
      {sharingState.isActive && (
        <div className="navbar broadcasting-banner" style={{ background: "rgba(239, 68, 68, 0.25)", borderColor: "var(--accent-red)", padding: "10px 32px" }}>
          <div className="share-banner-details">
            <div className="red-dot-blinking"></div>
            <div>
              <p className="font-mono text-xs text-muted" style={{ textTransform: "uppercase" }}>Broadcasting Location</p>
              <h4 className="text-gradient-cyan" style={{ fontSize: "1rem" }}>Bus {sharingState.busNumber} ({ROUTES_BY_NUMBER[sharingState.busNumber]?.name})</h4>
            </div>
          </div>
          <div className="share-banner-details" style={{ gap: "24px" }}>
            <div className="font-mono text-xs text-center">
              <span className="text-muted block">SPEED</span>
              <p className="text-gradient-cyan font-bold">{sharingState.speed} km/h</p>
            </div>
            <div className="font-mono text-xs text-center">
              <span className="text-muted block">CBIT DIST</span>
              <p className="text-gradient-cyan font-bold">{sharingState.distanceToCbit.toFixed(2)} km</p>
            </div>
            <button className="btn-danger" style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "0.85rem" }} onClick={() => triggerAutoTermination(sharingState.busNumber, "manual")}>
              <Square size={14} /> Stop Sharing
            </button>
          </div>
        </div>
      )}

      {/* Primary Navigation Bar */}
      <header className="navbar">
        <div className="nav-brand" onClick={handleBackToSearch}>
          <div className="logo-radar">
            <div className="logo-radar-ping"></div>
            <Bus size={20} className="text-gradient-cyan" style={{ color: "var(--accent-cyan)" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.25rem", color: "white" }}>CBIT <span className="text-gradient-cyan">BusRadar</span></h3>
            <span className="font-mono text-xs text-muted" style={{ letterSpacing: "0.08em" }}>TRANSIT CONTROL CENTER</span>
          </div>
        </div>
        
        <div className="nav-actions">
          <button className="btn-primary" style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "0.85rem" }} onClick={() => setIsShareModalOpen(true)}>
            <Share2 size={16} /> Share Live Location
          </button>
        </div>
      </header>

      {/* Main Container */}
      {!activeSearchBus ? (
        // LANDING STATE
        <main className="app-container">
          <div className="hero-section">
            <h1 className="hero-title">Track Campus Commutes in Real-Time</h1>
            <p className="hero-subtitle">
              Interactive digital transit deck for Chaitanya Bharathi Institute of Technology. Search route lines, locate bus schedules, and view GPS signals live.
            </p>
          </div>

          <div className="search-grid">
            {/* Bus Search Panel */}
            <section className="glass-panel glow-violet">
              <div className="card-title-container">
                <Search className="text-gradient-violet" style={{ color: "var(--accent-violet)" }} size={24} />
                <h3>Search Bus Schedule</h3>
              </div>
              <p className="text-muted text-sm mb-4">
                Select your designated route number to locate the transit bus, preview milestones, and check ETA.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="bus-select">Bus Route</label>
                <select id="bus-select" className="select-custom" value={selectedBusNumber} onChange={(e) => setSelectedBusNumber(e.target.value)}>
                  <option value="">-- Choose Bus Number --</option>
                  <optgroup label="Junior Routes">
                    {ALL_ROUTES.filter(r => r.category === "Junior").map(route => (
                      <option key={route.number} value={route.number}>
                        Junior {route.number} : {route.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Senior Routes">
                    {ALL_ROUTES.filter(r => r.category === "Senior").map(route => (
                      <option key={route.number} value={route.number}>
                        Senior {route.number} : {route.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <button className="btn-primary w-full" onClick={handleSearch}>
                <Search size={18} /> Locate Bus
              </button>
            </section>

            {/* Sandbox Status Panel */}
            <section className="glass-panel">
              <div className="card-title-container">
                <Activity size={24} style={{ color: "var(--accent-cyan)" }} />
                <h3>Sensor Feed Settings</h3>
              </div>
              <p className="text-muted text-sm mb-4">
                This transit system uses a real-time sync layer. Review connection channels below.
              </p>
              
              <div className="telemetry-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div className="telemetry-card">
                  <span className="telemetry-label">DATABASE SYNC STATUS</span>
                  <p className="telemetry-value" style={{ color: syncService.isUsingFirebase() ? "var(--accent-green)" : "var(--accent-cyan)" }}>
                    {syncService.isUsingFirebase() ? "FIREBASE CLOUD DATABASE CONNECTED" : "SANDBOX MODE ACTIVE (MULTI-TAB LOCAL SYNC)"}
                  </p>
                  <p className="text-muted text-xs mt-4">
                    {syncService.isUsingFirebase() 
                      ? "The application is connected to your Firebase cloud database. Live locations will sync globally across devices."
                      : "No Firebase configuration found. The dashboard is using internal broadcast channels to sync tracking coordinates across local browser windows in real-time."
                    }
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Active Buses Dashboard Board */}
          <section className="glass-panel">
            <div className="card-title-container">
              <div className="green-dot-blinking" style={{ marginRight: "4px" }}></div>
              <h3>Live Commutes On Road</h3>
            </div>
            
            {activeBusesList.length === 0 ? (
              <div className="text-center" style={{ padding: "40px 0" }}>
                <Bus size={32} className="text-muted" style={{ opacity: 0.3, marginBottom: "12px" }} />
                <p className="text-muted text-sm">No buses are broadcasting GPS signals right now.</p>
                <p className="text-muted text-xs mt-4">
                  Click <strong className="text-gradient-cyan" style={{ cursor: "pointer" }} onClick={() => setIsShareModalOpen(true)}>Share Live Location</strong> at the top to simulate or stream a live bus commute!
                </p>
              </div>
            ) : (
              <div className="live-board-grid">
                {activeBusesList.map(bus => (
                  <div key={bus.number} className="bus-status-card" style={{ cursor: "pointer" }} onClick={() => {
                    setSelectedBusNumber(bus.number);
                    setActiveSearchBus(ROUTES_BY_NUMBER[bus.number]);
                  }}>
                    <div className="bus-badge-glow">{bus.number}</div>
                    <div className="bus-status-details">
                      <p className="bus-status-route">{bus.name}</p>
                      <p className="bus-status-meta">Speed: {Math.round(bus.speed * 3.6)} km/h • Tracking active</p>
                    </div>
                    <div className="status-indicator text-success">
                      <div className="green-dot-blinking"></div> LIVE
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      ) : (
        // DASHBOARD SPLIT-SCREEN STATE
        <main className="dashboard-container">
          {/* Left Panel: Route Milestones timeline & telemetry */}
          <section className="dashboard-sidebar">
            <div className="sidebar-header">
              <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem", marginBottom: "16px" }} onClick={handleBackToSearch}>
                <ArrowLeft size={16} /> Back to Search
              </button>
              
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <h4 className="text-muted font-mono text-xs" style={{ letterSpacing: "0.05em" }}>BUS COMMUTE ACTIVE</h4>
                  <h2 style={{ fontSize: "1.5rem", marginTop: "4px" }}>Route {activeSearchBus.number}: {activeSearchBus.name}</h2>
                </div>
                <div className={`status-indicator ${liveBusCoordinates ? "text-success" : "text-muted"}`} style={{ marginTop: "4px" }}>
                  <div className={liveBusCoordinates ? "green-dot-blinking" : "status-dot bg-violet"} style={{ width: "8px", height: "8px" }}></div>
                  {liveBusCoordinates ? "LIVE FEED" : "STANDBY"}
                </div>
              </div>
              
              {/* Telemetry Display */}
              {liveBusCoordinates ? (
                <div className="telemetry-grid">
                  <div className="telemetry-card">
                    <div className="telemetry-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}><Gauge size={12} /> Speed</div>
                    <p className="telemetry-value">{Math.round((liveBusCoordinates.speed || 0) * 3.6)} <span className="text-xs text-muted">km/h</span></p>
                  </div>
                  <div className="telemetry-card">
                    <div className="telemetry-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}><Navigation size={12} /> Distance</div>
                    <p className="telemetry-value">
                      {getDistanceKm(liveBusCoordinates.latitude, liveBusCoordinates.longitude, CBIT_COORDS.lat, CBIT_COORDS.lng).toFixed(2)} 
                      <span className="text-xs text-muted"> km to CBIT</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: "16px", marginTop: "16px", display: "flex", alignItems: "center", gap: "12px", background: "rgba(255, 255, 255, 0.01)" }}>
                  <Info className="text-muted" size={20} />
                  <p className="text-muted text-xs">Waiting for a driver/student to share live location for Bus {activeSearchBus.number}.</p>
                </div>
              )}
            </div>

            {/* Timeline scroll area */}
            <div className="sidebar-scrollable">
              <h4 className="font-mono text-xs text-muted mb-4" style={{ letterSpacing: "0.05em" }}>ROUTE MILESTONES</h4>
              <div className="timeline-container">
                <div className="timeline-line"></div>
                <div className="timeline-line-filled" style={{ height: `${fillPercent}%` }}></div>
                
                {activeSearchBus.stops.map((stop, index) => {
                  let status = "upcoming"; // passed, active, upcoming
                  if (milestoneStates.passedIndices.includes(index)) {
                    status = "passed";
                  } else if (milestoneStates.activeIndex === index && liveBusCoordinates) {
                    status = "active";
                  }
                  
                  return (
                    <div key={index} className={`timeline-item ${status}`}>
                      <div className="timeline-node">
                        <div className="timeline-node-inner"></div>
                      </div>
                      <div className="timeline-content">
                        <p className="timeline-stop-name">{stop.name}</p>
                        {status === "active" && (
                          <span className="font-mono text-xs text-gradient-cyan" style={{ display: "block", marginTop: "4px" }}>
                            CURRENT STATION
                          </span>
                        )}
                        {status === "passed" && (
                          <span className="font-mono text-xs text-muted" style={{ display: "block", marginTop: "2px", opacity: 0.5 }}>
                            Passed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right Panel: Interactive Maps widget */}
          <section className="dashboard-map-panel">
            <BusMap stops={activeSearchBus.stops} busLocation={liveBusCoordinates} activeRoute={activeSearchBus} />
          </section>
        </main>
      )}

      {/* SHARE LOCATION DIALOG OVERLAY */}
      {isShareModalOpen && (
        <div className="modal-overlay" onClick={() => setIsShareModalOpen(false)}>
          <div className="modal-content glass-panel glow-cyan" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-gradient-cyan">Share Live Location</h3>
              <button className="modal-close" onClick={() => setIsShareModalOpen(false)}>×</button>
            </div>
            
            <p className="text-muted text-sm mb-4">
              Select your route and click start. The system will acquire location coordinates and stream them to the database.
            </p>
            
            <div className="form-group">
              <label className="form-label">Bus Number</label>
              <select id="share-bus-select" className="select-custom" value={sharingState.busNumber} onChange={(e) => setSharingState(prev => ({ ...prev, busNumber: e.target.value }))}>
                <option value="">-- Select Bus Route --</option>
                <optgroup label="Junior Routes">
                  {ALL_ROUTES.filter(r => r.category === "Junior").map(route => (
                    <option key={route.number} value={route.number}>
                      Junior {route.number} : {route.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Senior Routes">
                  {ALL_ROUTES.filter(r => r.category === "Senior").map(route => (
                    <option key={route.number} value={route.number}>
                      Senior {route.number} : {route.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="checkbox-toggle-container">
              <label className="switch">
                <input type="checkbox" checked={sharingState.isSimulating} onChange={(e) => setSharingState(prev => ({ ...prev, isSimulating: e.target.checked }))} />
                <span className="slider"></span>
              </label>
              <div>
                <p className="font-mono text-sm" style={{ fontWeight: 600 }}>Enable Route Simulation Mode</p>
                <p className="text-muted text-xs">Simulates the route path automatically. Perfect for testing database syncing, timeline stops, and auto-termination.</p>
              </div>
            </div>

            <div className="flex-row-gap" style={{ marginTop: "24px" }}>
              <button className="btn-secondary" onClick={() => setIsShareModalOpen(false)}>Cancel</button>
              <button className="btn-primary" disabled={!sharingState.busNumber} onClick={() => handleStartSharing(sharingState.busNumber, sharingState.isSimulating)}>
                <Play size={16} /> Start Sharing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="glass-panel" style={{ margin: "40px auto 24px", borderRadius: "12px", width: "calc(100% - 64px)", maxWidth: "1400px", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <p className="text-muted text-xs font-mono">
          © {new Date().getFullYear()} All rights reserved by Raghavendra Anirudh
        </p>
        <div style={{ display: "flex", gap: "16px" }}>
          <span className="font-mono text-xs text-muted" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Activity size={12} className="text-success" /> LATENCY: ~40ms
          </span>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted text-xs font-mono" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg> SOURCE CODE
          </a>
        </div>
      </footer>
    </>
  );
}
