// CBIT BusRadar developer configuration file.
// Automatically pulls credentials from the root .env file.

export const CONFIG = {
  // Firebase Realtime Database Configuration:
  firebaseConfig: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || ""
  },

  // MapMyIndia (Mappls) Map API Key:
  mapplsKey: import.meta.env.VITE_MAPPLS_KEY || ""
};
