import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TravelPlanProvider, useTravelPlan } from './context/TravelPlanContext';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PlanDetail from './pages/PlanDetail';
import { Plane } from 'lucide-react';

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { fetchPlanByShareToken, loading: planLoading } = useTravelPlan();
  
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [shareToken, setShareToken] = useState(null);
  const [shareError, setShareError] = useState(null);
  const [initShared, setInitShared] = useState(false);

  useEffect(() => {
    // Basic routing for sharing links
    const path = window.location.pathname;
    const match = path.match(/^\/share\/([a-zA-Z0-9]+)$/);
    if (match) {
      const token = match[1];
      setShareToken(token);
      loadSharedPlan(token);
    } else {
      setInitShared(true);
    }
  }, []);

  const loadSharedPlan = async (token) => {
    try {
      const { plan } = await fetchPlanByShareToken(token);
      setSelectedPlanId(plan.id);
    } catch (err) {
      setShareError(err.message);
    } finally {
      setInitShared(true);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedPlanId(null);
    setShareToken(null);
    // Clear URL query/path back to root
    window.history.pushState({}, '', '/');
  };

  if (authLoading || !initShared || (shareToken && planLoading && !selectedPlanId)) {
    return (
      <div style={styles.loadingContainer}>
        <Plane size={48} color="var(--primary)" className="animate-pulse" style={{ transform: 'rotate(-45deg)' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Učitavanje...</p>
      </div>
    );
  }

  if (shareError) {
    return (
      <div style={styles.errorContainer}>
        <h3 style={{ color: 'var(--danger)', marginBottom: '12px' }}>Greška pri pristupu deljenom planu</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{shareError}</p>
        <button className="btn btn-primary" onClick={() => window.location.replace('/')}>
          Idi na početnu
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container">
        {selectedPlanId ? (
          <PlanDetail 
            planId={selectedPlanId} 
            onBack={handleBackToDashboard} 
            shareToken={shareToken} 
          />
        ) : !user ? (
          <Auth />
        ) : (
          <Dashboard 
            onSelectPlan={(id) => {
              setSelectedPlanId(id);
              window.history.pushState({}, '', `/plan/${id}`);
            }} 
          />
        )}
      </main>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <TravelPlanProvider>
        <AppContent />
      </TravelPlanProvider>
    </AuthProvider>
  );
};

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'var(--bg-color)'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
    textAlign: 'center'
  }
};

export default App;
