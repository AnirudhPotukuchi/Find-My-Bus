// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGx8-zRisv6R2p9xmYBAHzwiXEtc8C4x4",
  authDomain: "cbit-bus-radar.firebaseapp.com",
  projectId: "cbit-bus-radar",
  storageBucket: "cbit-bus-radar.firebasestorage.app",
  messagingSenderId: "652846302340",
  appId: "1:652846302340:web:c19eaeba6dfb9ee3a9eed1",
  measurementId: "G-ZN25VK9VM2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);