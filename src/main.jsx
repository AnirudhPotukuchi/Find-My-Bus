import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Dynamic daily color shift script (Volcanic Amber variant)
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
  // Limit max shift to +-6 degrees of hue to keep it a subtle daily variation
  const maxShiftDegrees = 6;
  const hueOffset = Math.sin(daySeed) * maxShiftDegrees;

  // Base Hues in Volcanic Amber: Gold (43), Orange (20), Crimson (8), BG (17)
  const goldRgb = hslToRgb(43 + hueOffset, 100, 50);
  const orangeRgb = hslToRgb(20 + hueOffset, 100, 50);
  const crimsonRgb = hslToRgb(8 + hueOffset, 100, 50);

  // Keep background shifts smaller (half offset) to preserve text contrast
  const bgPrimaryRgb = hslToRgb(17 + hueOffset / 2, 54, 4);
  const bgSecondaryRgb = hslToRgb(17 + hueOffset / 2, 45, 8);
  const glassHoverRgb = hslToRgb(17 + hueOffset / 2, 45, 13);

  // Apply properties to the root document style
  const root = document.documentElement;
  
  root.style.setProperty('--bg-primary', rgbToHex(...bgPrimaryRgb));
  root.style.setProperty('--bg-primary-rgb', bgPrimaryRgb.join(', '));
  root.style.setProperty('--bg-secondary', rgbToHex(...bgSecondaryRgb));
  
  root.style.setProperty('--glass-bg', `rgba(${bgSecondaryRgb.join(', ')}, 0.65)`);
  root.style.setProperty('--glass-bg-hover', `rgba(${glassHoverRgb.join(', ')}, 0.75)`);

  root.style.setProperty('--accent-cyan', rgbToHex(...goldRgb));
  root.style.setProperty('--accent-cyan-rgb', goldRgb.join(', '));
  
  root.style.setProperty('--accent-violet', rgbToHex(...orangeRgb));
  root.style.setProperty('--accent-violet-rgb', orangeRgb.join(', '));
  
  root.style.setProperty('--accent-pink', rgbToHex(...crimsonRgb));

  root.style.setProperty('--shadow-neon-cyan', `0 0 15px rgba(${goldRgb.join(', ')}, 0.3)`);
  root.style.setProperty('--shadow-neon-violet', `0 0 15px rgba(${orangeRgb.join(', ')}, 0.3)`);
  
  const toneWord = hueOffset > 2 ? "Solar Gold" : hueOffset < -2 ? "Magma Orange" : "Volcanic Amber";
  console.log(`[Theme] Loaded ${toneWord} variant (Day seed: ${daySeed}, Hue offset: ${hueOffset.toFixed(1)}°)`);
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

