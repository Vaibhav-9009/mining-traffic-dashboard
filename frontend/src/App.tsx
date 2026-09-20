import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LayoutWrapper from './components/layout/LayoutWrapper';
import DashboardOverview from './pages/DashboardOverview';
import VehicleMonitoring from './pages/VehicleMonitoring';
import ZoneMonitoring from './pages/ZoneMonitoring';
import BarrierMonitoring from './pages/BarrierMonitoring';
import AlertCenter from './pages/AlertCenter';
import EventHistory from './pages/EventHistory';

// Placeholder Pages
const Analytics = () => <div>Analytics (WIP)</div>;

function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/vehicles" element={<VehicleMonitoring />} />
          <Route path="/zones" element={<ZoneMonitoring />} />
          <Route path="/barriers" element={<BarrierMonitoring />} />
          <Route path="/alerts" element={<AlertCenter />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/events" element={<EventHistory />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;
