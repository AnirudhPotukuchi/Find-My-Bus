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
  Activity,
  Sun,
  Moon
} from "lucide-react";
import { ALL_ROUTES, ROUTES_BY_NUMBER, getDistanceKm, CBIT_COORDS } from "./routesData";
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
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // App navigation and search state
  const [selectedBusNumber, setSelectedBusNumber] = useState("");
  const [activeSearchBus, setActiveSearchBus] = useState(null); // route details object
  const [liveBusCoordinates, setLiveBusCoordinates] = useState(null); // coordinates of searched bus
  const [allActiveBuses, setAllActiveBuses] = useState({}); // dashboard state of all active buses

  // UI Dialog overlays
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeView, setActiveView] = useState("main"); // "main", "privacy", "terms"

  // Active user sharing state (if this tab is broadcasting)
  const [sharingState, setSharingState] = useState({
    isActive: false,
    busNumber: "",
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

  // Start Location Sharing (real GPS)
  const handleStartSharing = async (busNum) => {
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

    // REAL GEOLOCATION MODE
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setSharingState({
      isActive: true,
      busNumber: busNum,
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
    setActiveView("main");
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
        <div className="navbar broadcasting-banner">
          <div className="share-banner-details">
            <div className="red-dot-blinking"></div>
            <div>
              <p className="font-mono text-xs text-muted" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Broadcasting Location</p>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "600", marginTop: "2px" }}>Bus {sharingState.busNumber} ({ROUTES_BY_NUMBER[sharingState.busNumber]?.name})</h4>
            </div>
          </div>
          <div className="share-banner-details" style={{ gap: "24px" }}>
            <div className="font-mono text-xs text-center">
              <span className="text-muted block">SPEED</span>
              <p className="font-bold" style={{ fontSize: "1rem" }}>{sharingState.speed} km/h</p>
            </div>
            <div className="font-mono text-xs text-center">
              <span className="text-muted block">CBIT DIST</span>
              <p className="font-bold" style={{ fontSize: "1rem" }}>{sharingState.distanceToCbit.toFixed(2)} km</p>
            </div>
            <button className="btn-danger" onClick={() => triggerAutoTermination(sharingState.busNumber, "manual")}>
              <Square size={14} /> <span className="btn-text">Stop Sharing</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Navigation Bar */}
      <header className="navbar">
        <div className="nav-brand" onClick={handleBackToSearch}>
          <img src="/logo.svg" alt="Find My Bus Logo" style={{ width: '30px', height: '30px', borderRadius: '6px' }} />
          <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "var(--text-main)" }}>Find My Bus</h3>
        </div>
        
        <div className="nav-actions">
          <button 
            className="btn-theme-toggle" 
            onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn-primary" onClick={() => setIsShareModalOpen(true)}>
            <Share2 size={16} /> <span className="btn-text">Share Live Location</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      {activeView === "privacy" ? (
        <main className="legal-container">
          <div className="legal-header">
            <h1 className="legal-title">Privacy Policy</h1>
            <p className="legal-meta">Last Updated: June 2026</p>
          </div>
          
          <div className="legal-alert">
            <p>
              IMPORTANT NOTICE: By accessing or using Find My Bus, you automatically accept and agree to be bound by this Privacy Policy. If you do not agree, please do not use the application.
            </p>
          </div>

          <section className="legal-section">
            <h3>1. Introduction</h3>
            <p>
              Find My Bus is a real-time student transport tracking utility. We are committed to transparency in how location data is handled, ensuring that student and driver privacy is protected.
            </p>
          </section>

          <section className="legal-section">
            <h3>2. Information We Collect</h3>
            <p>
              This application does not collect personal profiles, email addresses, or phone numbers. The only information processed is location telemetry data:
            </p>
            <ul>
              <li><strong>GPS Coordinates:</strong> Temporary latitude and longitude streams are acquired solely when a student/driver actively initiates "Share Live Location" for a bus route.</li>
              <li><strong>Device Telemetry:</strong> Ephemeral indicators like speed (km/h), course heading (degrees), and sensor accuracy (meters) are processed to show smooth animations on the transit dashboard.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h3>3. Real-Time Synchronization</h3>
            <p>
              To ensure all students see active buses, live coordinates are broadcasted instantly:
            </p>
            <ul>
              <li><strong>Cloud Sync:</strong> If configured, location streams are synced globally across user devices using a secure Firebase Realtime Database layer.</li>
              <li><strong>Local Sandbox Sync:</strong> If Firebase is offline, local coordination is achieved locally across your browser tabs using BroadcastChannel streams.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h3>4. Data Retention and Deletion</h3>
            <p>
              We do not persist historical trip tracking paths:
            </p>
            <ul>
              <li><strong>Immediate Erasure:</strong> All coordinate telemetry fields are completely wiped and cleared from active database nodes immediately when sharing is manually stopped, or when the bus reaches CBIT (auto-termination at 100 meters).</li>
              <li><strong>Sandbox Storage:</strong> Sandbox configurations are stored locally inside your browser's <code>localStorage</code> and can be cleared by deleting your browser cache.</li>
            </ul>
          </section>

          <div className="legal-actions">
            <button className="btn-primary" onClick={handleBackToSearch}>
              Accept & Back to Dashboard
            </button>
          </div>
        </main>
      ) : activeView === "terms" ? (
        <main className="legal-container">
          <div className="legal-header">
            <h1 className="legal-title">Terms & Conditions</h1>
            <p className="legal-meta">Last Updated: June 2026</p>
          </div>
          
          <div className="legal-alert">
            <p>
              IMPORTANT NOTICE: By accessing or using Find My Bus, you automatically accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use the application.
            </p>
          </div>

          <section className="legal-section">
            <h3>1. Acceptable Use</h3>
            <p>
              This app is designed to help students track Chaitanya Bharathi Institute of Technology transit routes. You agree to use this platform in accordance with academic integrity guidelines:
            </p>
            <ul>
              <li><strong>Accurate Sharing:</strong> You must only broadcast your GPS coordinates if you are physically present on the corresponding transit route.</li>
              <li><strong>No Falsification:</strong> Falsifying location feeds, spoofing GPS coordinates, or using tools to simulate fake coordinates outside of the built-in Sandbox Simulation Mode is strictly prohibited.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h3>2. Sharing Mechanism & Locks</h3>
            <p>
              To prevent duplicate coordinate streaming, the system employs exclusive route locks:
            </p>
            <ul>
              <li><strong>Exclusive Access:</strong> Only one user session can lock and broadcast telemetry for a specific bus number at any given time.</li>
              <li><strong>Lock Expiry:</strong> Abandoned locks automatically expire after 20 seconds of telemetry inactivity. You must not attempt to disrupt active lock ownership.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h3>3. "As-Is" Service & Disclaimers</h3>
            <p>
              Find My Bus is offered as a student assistance utility. It is not an official guarantee of bus arrivals:
            </p>
            <ul>
              <li><strong>Coordinate Latency:</strong> Coordinates and estimated milestones are subject to network delay, mobile cellular coverage dropouts, and GPS hardware sensor variances.</li>
              <li><strong>Academic Commutes:</strong> Always plan your campus commutes with a safe time buffer. Do not rely solely on this app for critical exams or scheduling.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h3>4. Limitation of Liability</h3>
            <p>
              Under no circumstances shall the developers or CBIT Transport be held liable for any missed commutes, delayed routes, or coordination failures resulting from the use or reliance on this application.
            </p>
          </section>

          <div className="legal-actions">
            <button className="btn-primary" onClick={handleBackToSearch}>
              Accept & Back to Dashboard
            </button>
          </div>
        </main>
      ) : !activeSearchBus ? (
        // LANDING STATE
        <main className="app-container">
          <div className="hero-section">
            {/* Scattered SVG mesh wires & sticky note dots in brand colors */}
            <div className="hero-decorations" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "15%", left: "12%", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--colors-brand-yellow)" }}></div>
              <div style={{ position: "absolute", top: "28%", right: "14%", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--colors-brand-pink)" }}></div>
              <div style={{ position: "absolute", bottom: "35%", left: "16%", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "var(--colors-brand-teal)" }}></div>
              <div style={{ position: "absolute", bottom: "45%", right: "20%", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--colors-brand-orange)" }}></div>
              
              <svg style={{ position: "absolute", top: "8%", left: "6%", opacity: 0.15 }} width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                <path d="M10,10 C30,40 40,20 70,50 C80,60 90,80 90,90" strokeWidth="0.75" />
                <circle cx="70" cy="50" r="2" fill="currentColor" />
              </svg>
              <svg style={{ position: "absolute", bottom: "12%", right: "6%", opacity: 0.15 }} width="130" height="130" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                <path d="M10,90 C40,70 20,40 50,20 C60,10 80,10 90,10" strokeWidth="0.75" />
                <circle cx="50" cy="20" r="2" fill="currentColor" />
              </svg>
            </div>

            <h1 className="hero-title">Track Campus Commutes in Real-Time</h1>
            <p className="hero-subtitle">
              Interactive digital transit deck for Chaitanya Bharathi Institute of Technology. Search route lines, locate bus schedules, and view GPS signals live.
            </p>
            <div className="hero-buttons">
              <button className="btn-on-dark" onClick={() => setIsShareModalOpen(true)}>
                <Share2 size={16} /> Share Live Location
              </button>
              <button className="btn-secondary-on-dark" onClick={() => {
                const el = document.getElementById("bus-select");
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}>
                <Search size={16} /> Search Routes
              </button>
            </div>

            {/* Wavy bottom divider transition between navy band and white page */}
            <div className="hero-divider" style={{ position: "absolute", bottom: -1, left: 0, width: "100%", overflow: "hidden", lineHeight: 0, zIndex: 1 }}>
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ position: "relative", display: "block", width: "100%", height: "55px" }}>
                <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="var(--bg-primary)"></path>
              </svg>
            </div>
          </div>

          <div className="search-center-container">
            {/* Bus Search Panel */}
            <div className="workspace-mockup-card">
              <div className="card-title-container">
                <Search style={{ color: "var(--colors-primary)" }} size={20} />
                <h3>Search Bus Schedule</h3>
              </div>
              <p className="text-muted text-sm mb-4">
                Select your designated route number to locate the transit bus, preview milestones, and check ETA.
              </p>

              <div className="form-group" style={{ textAlign: "left" }}>
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

              <button className="btn-primary w-full" onClick={handleSearch} style={{ height: '44px' }}>
                <Search size={18} /> Locate Bus
              </button>
            </div>
          </div>

          {/* Active Buses Dashboard Board */}
          <div className="dashboard-grid-section">
            <div className="card-title-container" style={{ justifyContent: "flex-start", borderBottom: "none", marginBottom: "8px" }}>
              <div className="green-dot-blinking" style={{ marginRight: "6px" }}></div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Live Commutes On Road</h3>
            </div>
            
            {activeBusesList.length === 0 ? (
              <div className="glass-panel text-center" style={{ padding: "48px 0" }}>
                <Bus size={36} className="text-muted" style={{ opacity: 0.3, marginBottom: "12px" }} />
                <p className="text-muted text-sm" style={{ fontWeight: "500" }}>No buses are broadcasting GPS signals right now.</p>
                <p className="text-muted text-xs mt-2">
                  Click <strong style={{ color: "var(--colors-primary)", cursor: "pointer", textDecoration: "underline" }} onClick={() => setIsShareModalOpen(true)}>Share Live Location</strong> at the top to stream a live commute!
                </p>
              </div>
            ) : (
              <div className="live-board-grid">
                {activeBusesList.map((bus, idx) => {
                  const cardTints = [
                    "card-feature-sky",
                    "card-feature-mint",
                    "card-feature-lavender",
                    "card-feature-peach",
                    "card-feature-rose",
                    "card-feature-yellow",
                    "card-feature-cream"
                  ];
                  const cardTintClass = cardTints[idx % cardTints.length];
                  return (
                    <div key={bus.number} className={`bus-status-card ${cardTintClass}`} style={{ cursor: "pointer" }} onClick={() => {
                      setSelectedBusNumber(bus.number);
                      setActiveSearchBus(ROUTES_BY_NUMBER[bus.number]);
                    }}>
                      <div className="bus-badge-glow" style={{ backgroundColor: 'var(--colors-ink-deep)', color: '#ffffff' }}>{bus.number}</div>
                      <div className="bus-status-details">
                        <p className="bus-status-route">{bus.name}</p>
                        <p className="bus-status-meta">Speed: {Math.round(bus.speed * 3.6)} km/h • Active</p>
                      </div>
                      <div className="status-indicator font-mono" style={{ color: "var(--colors-semantic-success)" }}>
                        <div className="green-dot-blinking"></div> LIVE
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      ) : (
        // DASHBOARD SPLIT-SCREEN STATE
        <main className="dashboard-container">
          {/* Left Panel: Route Milestones timeline & telemetry */}
          <section className="dashboard-sidebar">
            <div className="sidebar-header">
              <button className="btn-secondary w-full" style={{ marginBottom: "16px", height: "40px" }} onClick={handleBackToSearch}>
                <ArrowLeft size={16} /> Back to Search
              </button>
              
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", textAlign: "left" }}>
                <div>
                  <h4 className="text-muted font-mono text-xs" style={{ letterSpacing: "0.05em" }}>BUS COMMUTE ACTIVE</h4>
                  <h2 style={{ fontSize: "1.25rem", marginTop: "4px", fontWeight: "600" }}>Route {activeSearchBus.number}: {activeSearchBus.name}</h2>
                </div>
                <div className={`status-indicator ${liveBusCoordinates ? "text-success" : "text-muted"}`} style={{ marginTop: "4px", whiteSpace: "nowrap" }}>
                  <div className={liveBusCoordinates ? "green-dot-blinking" : "status-dot bg-violet"}></div>
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
                      <span className="text-xs text-muted"> km</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "12px 16px", marginTop: "16px", display: "flex", alignItems: "center", gap: "10px", backgroundColor: "var(--colors-card-tint-peach)", border: "1px solid rgba(221, 91, 0, 0.2)", borderRadius: "8px", textAlign: "left" }}>
                  <Info className="text-danger" size={18} style={{ flexShrink: 0 }} />
                  <p className="text-xs" style={{ color: "var(--colors-brand-orange-deep)", lineHeight: "1.4" }}>Waiting for a driver/student to share live location for Bus {activeSearchBus.number}.</p>
                </div>
              )}
            </div>

            {/* Timeline scroll area */}
            <div className="sidebar-scrollable">
              <h4 className="font-mono text-xs text-muted mb-4" style={{ letterSpacing: "0.05em", textAlign: "left" }}>ROUTE MILESTONES</h4>
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
                          <span className="font-mono text-xs font-bold" style={{ display: "block", marginTop: "4px", color: "var(--accent-purple)" }}>
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
            <BusMap stops={activeSearchBus.stops} busLocation={liveBusCoordinates} activeRoute={activeSearchBus} theme={theme} />
          </section>
        </main>
      )}

      {/* SHARE LOCATION DIALOG OVERLAY */}
      {isShareModalOpen && (
        <div className="modal-overlay" onClick={() => setIsShareModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: "var(--text-main)" }}>Share Live Location</h3>
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

            <div className="flex-row-gap" style={{ marginTop: "24px" }}>
              <button className="btn-secondary" onClick={() => setIsShareModalOpen(false)}>Cancel</button>
              <button className="btn-primary" disabled={!sharingState.busNumber} onClick={() => handleStartSharing(sharingState.busNumber)}>
                <Play size={16} /> Start Sharing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer-container">
        <div className="footer-top-grid">
          <div className="footer-tagline">
            Experience seamless transit control.
          </div>
          <div className="footer-grid-column">
            <span className="footer-grid-title">System</span>
            <a onClick={handleBackToSearch} className="footer-grid-link">Transit Dashboard</a>
            <a onClick={() => setIsShareModalOpen(true)} className="footer-grid-link">Share Location</a>
            <a href="#mappls-map-container" className="footer-grid-link">Telemetry Feed</a>
          </div>
          <div className="footer-grid-column">
            <span className="footer-grid-title">Resources</span>
            <a href="/src/assets/Buses-for-Junior-Students-_CBIT-_Transport_08-07-2025-2025-26-1.png" target="_blank" rel="noreferrer" className="footer-grid-link">Junior Schedule</a>
            <a href="/src/assets/Buses-for-Senior-Students-_CBIT-_Transport_08-07-2025-2025-26-1.png" target="_blank" rel="noreferrer" className="footer-grid-link">Senior Schedule</a>
            <a href="https://cbit.ac.in" target="_blank" rel="noreferrer" className="footer-grid-link">CBIT</a>
          </div>
          <div className="footer-grid-column">
            <span className="footer-grid-title">Legal</span>
            <a onClick={() => { setActiveView("privacy"); window.scrollTo(0, 0); }} className="footer-grid-link">Privacy Policy</a>
            <a onClick={() => { setActiveView("terms"); window.scrollTo(0, 0); }} className="footer-grid-link">Terms & Conditions</a>
            <span className="text-muted text-xs mt-2" style={{ lineHeight: 1.4 }}>
              Using this application implies automatic acceptance of our privacy policies and terms of service.
            </span>
          </div>
        </div>

        <div className="footer-logo-text">
          Find My Bus
        </div>

        <div className="footer-bottom">
          <p className="text-muted text-xs font-mono">
            © {new Date().getFullYear()} All rights reserved by Raghavendra Anirudh
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            <span className="font-mono text-xs text-muted" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Activity size={12} className="text-success" /> LATENCY: ~40ms
            </span>
            <a href="https://github.com/AnirudhPotukuchi/Find-My-Bus" target="_blank" rel="noreferrer" className="text-muted text-xs font-mono" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg> SOURCE CODE
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
