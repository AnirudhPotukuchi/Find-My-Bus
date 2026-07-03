import { Sun, Moon, Share2 } from "lucide-react";

export default function Header({ theme, toggleTheme, onBrandClick, onShareClick }) {
  return (
    <header className="navbar">
      <div className="nav-brand" onClick={onBrandClick}>
        <img src="/logo.svg" alt="Find My Bus Logo" style={{ width: '30px', height: '30px', borderRadius: '6px' }} />
        <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "var(--text-main)" }}>Find My Bus</h3>
      </div>
      
      <div className="nav-actions">
        <button 
          className="btn-theme-toggle" 
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="btn-primary" onClick={onShareClick}>
          <Share2 size={16} /> <span className="btn-text">Share Live Location</span>
        </button>
      </div>
    </header>
  );
}
