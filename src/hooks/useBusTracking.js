import { useState, useEffect, useRef, useCallback } from "react";
import { syncService } from "../services/syncService";
import { ROUTES_BY_NUMBER, CBIT_COORDS, getDistanceKm } from "../constants/routesData";

const sessionToken = (() => {
  let token = sessionStorage.getItem("cbit_bus_session_token");
  if (!token) {
    token = `session_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem("cbit_bus_session_token", token);
  }
  return token;
})();

export function useBusTracking(showNotification) {
  // App navigation and search state
  const [selectedBusNumber, setSelectedBusNumber] = useState("");
  const [activeSearchBus, setActiveSearchBus] = useState(null); // route details object
  const [liveBusCoordinates, setLiveBusCoordinates] = useState(null); // coordinates of searched bus
  const [allActiveBuses, setAllActiveBuses] = useState({}); // dashboard state of all active buses
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
  }, [activeSearchBus, showNotification]);

  // Helper to trigger auto-termination when bus reaches CBIT
  const triggerAutoTermination = useCallback(async (busNum, reason = "destination") => {
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
  }, [showNotification]);

  // Start Location Sharing (real GPS)
  const handleStartSharing = useCallback(async (busNum) => {
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
  }, [showNotification, triggerAutoTermination]);

  const handleSearch = useCallback(() => {
    if (!selectedBusNumber) {
      showNotification("Please select a bus number first.", "error");
      return;
    }
    const route = ROUTES_BY_NUMBER[selectedBusNumber];
    if (route) {
      setActiveSearchBus(route);
    }
  }, [selectedBusNumber, showNotification]);

  const handleBackToSearch = useCallback(() => {
    setActiveSearchBus(null);
    setLiveBusCoordinates(null);
  }, []);

  return {
    selectedBusNumber,
    setSelectedBusNumber,
    activeSearchBus,
    setActiveSearchBus,
    liveBusCoordinates,
    allActiveBuses,
    isShareModalOpen,
    setIsShareModalOpen,
    sharingState,
    setSharingState,
    now,
    triggerAutoTermination,
    handleStartSharing,
    handleSearch,
    handleBackToSearch
  };
}
