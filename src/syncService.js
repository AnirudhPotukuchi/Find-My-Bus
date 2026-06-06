import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, runTransaction, off } from "firebase/database";
import { CONFIG } from "./config";

// Fallback Database stored in localStorage & synced across tabs using BroadcastChannel
const MOCK_DB_KEY = "cbit_bus_radar_mock_db";
const BROADCAST_CHANNEL_NAME = "cbit_bus_radar_sync";

let firebaseApp = null;
let firebaseDb = null;
const config = CONFIG.firebaseConfig;

if (config && config.databaseURL) {
  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    }
    firebaseDb = getDatabase(firebaseApp);
    console.log("Firebase initialized successfully");
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
}

// BroadcastChannel setup for multi-tab fallback
let broadcastChannel = null;
if (typeof window !== "undefined" && window.BroadcastChannel) {
  broadcastChannel = new window.BroadcastChannel(BROADCAST_CHANNEL_NAME);
}

// Local mock database helpers
function getMockDb() {
  try {
    const dbStr = localStorage.getItem(MOCK_DB_KEY);
    return dbStr ? JSON.parse(dbStr) : { active_tracking: {} };
  } catch {
    return { active_tracking: {} };
  }
}

function saveMockDb(db) {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
}

// Global active-listeners registry for cleanups
const activeListeners = new Map();

// PUBLIC API
export const syncService = {
  isUsingFirebase: () => !!firebaseDb,

  // 1. Subscribe to all active buses (for landing dashboard)
  subscribeToAllBuses: (onUpdate) => {
    if (firebaseDb) {
      const dbRef = ref(firebaseDb, "active_tracking");
      const unsubscribe = onValue(dbRef, (snapshot) => {
        const val = snapshot.val() || {};
        onUpdate(val);
      });
      return () => off(dbRef, "value", unsubscribe);
    } else {
      // Local fallback
      const initialDb = getMockDb().active_tracking;
      onUpdate(initialDb);

      const handleBroadcast = () => {
        const db = getMockDb().active_tracking;
        onUpdate(db);
      };

      if (broadcastChannel) {
        broadcastChannel.addEventListener("message", handleBroadcast);
      }

      // Periodically refresh to catch timeout terminations
      const intervalId = setInterval(() => {
        const db = getMockDb().active_tracking;
        onUpdate(db);
      }, 5000);

      return () => {
        if (broadcastChannel) {
          broadcastChannel.removeEventListener("message", handleBroadcast);
        }
        clearInterval(intervalId);
      };
    }
  },

  // 2. Subscribe to a specific bus coordinates
  subscribeToBus: (busNumber, onUpdate) => {
    if (firebaseDb) {
      const dbRef = ref(firebaseDb, `active_tracking/${busNumber}`);
      const listener = onValue(dbRef, (snapshot) => {
        onUpdate(snapshot.val());
      });
      activeListeners.set(busNumber, { ref: dbRef, listener });
      return () => {
        off(dbRef, "value", listener);
        activeListeners.delete(busNumber);
      };
    } else {
      // Local fallback
      const getLatest = () => {
        const db = getMockDb();
        const active = db.active_tracking[busNumber];
        // Check timeout
        if (active && active.isActive && Date.now() - active.lastUpdated > 20000) {
          // Heartbeat lost - expire it
          active.isActive = false;
          saveMockDb(db);
          if (broadcastChannel) {
            broadcastChannel.postMessage({ type: "TRACKING_EXPIRED", busNumber });
          }
          return null;
        }
        return active || null;
      };

      onUpdate(getLatest());

      const handleBroadcast = (event) => {
        if (event.data.busNumber === busNumber) {
          onUpdate(getLatest());
        }
      };

      if (broadcastChannel) {
        broadcastChannel.addEventListener("message", handleBroadcast);
      }

      const intervalId = setInterval(() => {
        onUpdate(getLatest());
      }, 3000);

      return () => {
        if (broadcastChannel) {
          broadcastChannel.removeEventListener("message", handleBroadcast);
        }
        clearInterval(intervalId);
      };
    }
  },

  // 3. Attempt lock on sharing location for a bus
  tryStartTracking: async (busNumber, routeNumber, sessionToken) => {
    if (firebaseDb) {
      const dbRef = ref(firebaseDb, `active_tracking/${busNumber}`);
      try {
        const result = await runTransaction(dbRef, (currentData) => {
          const now = Date.now();
          // Heartbeat check: if marked active, updated in the last 20 seconds, and NOT by this session
          if (
            currentData &&
            currentData.isActive &&
            now - currentData.lastUpdated < 20000 &&
            currentData.sharedBy !== sessionToken
          ) {
            // Abort transaction - already locked
            return;
          }
          // Accept or steal expired lock
          return {
            isActive: true,
            sharedBy: sessionToken,
            routeNumber: routeNumber,
            lastUpdated: now,
            latitude: currentData ? currentData.latitude || null : null,
            longitude: currentData ? currentData.longitude || null : null,
            speed: currentData ? currentData.speed || 0 : 0,
            heading: currentData ? currentData.heading || 0 : 0
          };
        });

        return { success: result.committed, currentData: result.snapshot.val() };
      } catch (err) {
        console.error("Lock transaction failed:", err);
        return { success: false, error: err.message };
      }
    } else {
      // Local fallback lock
      const db = getMockDb();
      const now = Date.now();
      const current = db.active_tracking[busNumber];

      if (
        current &&
        current.isActive &&
        now - current.lastUpdated < 20000 &&
        current.sharedBy !== sessionToken
      ) {
        return { success: false, currentData: current };
      }

      // Lock successfully acquired
      const newData = {
        isActive: true,
        sharedBy: sessionToken,
        routeNumber: routeNumber,
        lastUpdated: now,
        latitude: current ? current.latitude || null : null,
        longitude: current ? current.longitude || null : null,
        speed: current ? current.speed || 0 : 0,
        heading: current ? current.heading || 0 : 0
      };

      db.active_tracking[busNumber] = newData;
      saveMockDb(db);

      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: "TRACKING_STARTED", busNumber, data: newData });
      }

      return { success: true, currentData: newData };
    }
  },

  // 4. Update coordinates (tracker publishes updates)
  updateLocation: async (busNumber, coords, sessionToken) => {
    const now = Date.now();
    const data = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      speed: coords.speed || 0,
      heading: coords.heading || 0,
      lastUpdated: now
    };

    if (firebaseDb) {
      const dbRef = ref(firebaseDb, `active_tracking/${busNumber}`);
      try {
        // Double-check ownership before writing
        await runTransaction(dbRef, (currentData) => {
          if (currentData && currentData.sharedBy !== sessionToken) {
            // Do not override another active session
            return;
          }
          return {
            ...currentData,
            ...data,
            isActive: true,
            sharedBy: sessionToken
          };
        });
      } catch (err) {
        console.error("Update coordinates transaction failed:", err);
      }
    } else {
      // Local updates
      const db = getMockDb();
      const current = db.active_tracking[busNumber];
      if (!current || current.sharedBy === sessionToken) {
        db.active_tracking[busNumber] = {
          ...current,
          ...data,
          isActive: true,
          sharedBy: sessionToken
        };
        saveMockDb(db);
        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: "LOCATION_UPDATED", busNumber, data });
        }
      }
    }
  },

  // 5. Stop tracking & release lock
  stopTracking: async (busNumber, sessionToken) => {
    if (firebaseDb) {
      const dbRef = ref(firebaseDb, `active_tracking/${busNumber}`);
      try {
        await runTransaction(dbRef, (currentData) => {
          if (currentData && currentData.sharedBy === sessionToken) {
            // Release lock
            return {
              isActive: false,
              sharedBy: null,
              lastUpdated: Date.now(),
              latitude: null,
              longitude: null,
              speed: 0,
              heading: 0
            };
          }
          return; // Do nothing if not our session
        });
      } catch (err) {
        console.error("Release lock transaction failed:", err);
      }
    } else {
      // Local releases
      const db = getMockDb();
      const current = db.active_tracking[busNumber];
      if (current && current.sharedBy === sessionToken) {
        db.active_tracking[busNumber] = {
          isActive: false,
          sharedBy: null,
          lastUpdated: Date.now(),
          latitude: null,
          longitude: null,
          speed: 0,
          heading: 0
        };
        saveMockDb(db);
        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: "TRACKING_STOPPED", busNumber });
        }
      }
    }
  }
};
