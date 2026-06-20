import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Dynamic daily color shift script (Deep Space Cobalt & Cyber Teal theme)
(() => {
  // HSL to RGB conversion helper
  function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4))
    ];
  }

  // RGB to Hex helper
  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  }

  // Calculate deterministic offset based on current day (number of days since epoch)
  const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  // Limit max shift to keep it a subtle daily variation of navy-indigo-sapphire
  const maxShiftDegrees = 8;
  const hueOffset = Math.sin(daySeed) * maxShiftDegrees;

  // Base Hues: Cobalt/Indigo (224), Cyber Teal (176), Royal Indigo (242), Crimson Rose (342)
  const tealRgb = hslToRgb(176 + hueOffset, 95, 46);
  const indigoRgb = hslToRgb(242 + hueOffset, 90, 62);
  const roseRgb = hslToRgb(342 + hueOffset, 88, 55);

  // Deep slate background with small offset variations
  const bgPrimaryRgb = hslToRgb(224 + hueOffset, 55, 4);
  const bgSecondaryRgb = hslToRgb(224 + hueOffset, 45, 8);
  const glassHoverRgb = hslToRgb(224 + hueOffset, 42, 13);

  // Apply properties to the root document style
  const root = document.documentElement;
  
  root.style.setProperty('--bg-primary', rgbToHex(...bgPrimaryRgb));
  root.style.setProperty('--bg-primary-rgb', bgPrimaryRgb.join(', '));
  root.style.setProperty('--bg-secondary', rgbToHex(...bgSecondaryRgb));
  
  root.style.setProperty('--glass-bg', `rgba(${bgSecondaryRgb.join(', ')}, 0.7)`);
  root.style.setProperty('--glass-bg-hover', `rgba(${glassHoverRgb.join(', ')}, 0.8)`);

  root.style.setProperty('--accent-cyan', rgbToHex(...tealRgb));
  root.style.setProperty('--accent-cyan-rgb', tealRgb.join(', '));
  
  root.style.setProperty('--accent-violet', rgbToHex(...indigoRgb));
  root.style.setProperty('--accent-violet-rgb', indigoRgb.join(', '));
  
  root.style.setProperty('--accent-pink', rgbToHex(...roseRgb));

  root.style.setProperty('--shadow-neon-cyan', `0 4px 20px rgba(${tealRgb.join(', ')}, 0.15)`);
  root.style.setProperty('--shadow-neon-violet', `0 4px 20px rgba(${indigoRgb.join(', ')}, 0.15)`);
  
  const toneWord = hueOffset > 3 ? "Midnight Sapphire" : hueOffset < -3 ? "Quantum Violet" : "Deep Cobalt";
  console.log(`[Theme] Loaded ${toneWord} variant (Day seed: ${daySeed}, Hue offset: ${hueOffset.toFixed(1)}°)`);
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

