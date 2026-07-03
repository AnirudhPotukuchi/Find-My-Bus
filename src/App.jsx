import { useState } from "react";
import { Square } from "lucide-react";
import { useTheme } from "./hooks/useTheme";
import { useNotification } from "./hooks/useNotification";
import { useBusTracking } from "./hooks/useBusTracking";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import NotificationAlert from "./components/ui/NotificationAlert";
import ShareModal from "./components/ui/ShareModal";
import LandingPage from "./pages/LandingPage";
import TrackingDashboard from "./pages/TrackingDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import { ROUTES_BY_NUMBER } from "./constants/routesData";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { notification, showNotification } = useNotification();
  const {
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
  } = useBusTracking(showNotification);

  const [activeView, setActiveView] = useState("main"); // "main", "privacy", "terms"

  const navigateToView = (view) => {
    setActiveView(view);
    window.scrollTo(0, 0);
  };

  const handleBackToSearchAndView = () => {
    handleBackToSearch();
    setActiveView("main");
  };

  // Render correct main content based on view state
  const renderContent = () => {
    if (activeView === "privacy") {
      return <PrivacyPolicy onBack={handleBackToSearchAndView} />;
    }
    if (activeView === "terms") {
      return <TermsConditions onBack={handleBackToSearchAndView} />;
    }
    if (!activeSearchBus) {
      return (
        <LandingPage
          selectedBusNumber={selectedBusNumber}
          setSelectedBusNumber={setSelectedBusNumber}
          allActiveBuses={allActiveBuses}
          now={now}
          setIsShareModalOpen={setIsShareModalOpen}
          handleSearch={handleSearch}
          setActiveSearchBus={setActiveSearchBus}
        />
      );
    }
    return (
      <TrackingDashboard
        activeSearchBus={activeSearchBus}
        liveBusCoordinates={liveBusCoordinates}
        theme={theme}
        onBack={handleBackToSearchAndView}
      />
    );
  };

  return (
    <>
      {/* Dynamic Alert Banner */}
      <NotificationAlert notification={notification} />

      {/* Floating Share Live Location sticky banner */}
      {sharingState.isActive && (
        <div className="navbar broadcasting-banner">
          <div className="share-banner-details">
            <div className="red-dot-blinking"></div>
            <div>
              <p className="font-mono text-xs text-muted" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Broadcasting Location</p>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "600", marginTop: "2px" }}>
                Bus {sharingState.busNumber} ({ROUTES_BY_NUMBER[sharingState.busNumber]?.name})
              </h4>
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
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onBrandClick={handleBackToSearchAndView}
        onShareClick={() => setIsShareModalOpen(true)}
      />

      {/* Main Container */}
      {renderContent()}

      {/* Footer */}
      {!activeSearchBus && (
        <Footer
          onDashboardClick={handleBackToSearchAndView}
          onShareClick={() => setIsShareModalOpen(true)}
          onPrivacyClick={() => navigateToView("privacy")}
          onTermsClick={() => navigateToView("terms")}
        />
      )}

      {/* SHARE LOCATION DIALOG OVERLAY */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        sharingState={sharingState}
        setSharingState={setSharingState}
        onStartSharing={handleStartSharing}
      />
    </>
  );
}
