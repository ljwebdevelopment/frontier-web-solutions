import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import Pricing from './pages/Pricing.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminClients from './pages/admin/AdminClients.jsx';
import AdminClientDetail from './pages/admin/AdminClientDetail.jsx';
import AdminLeads from './pages/admin/AdminLeads.jsx';
import AdminForms from './pages/admin/AdminForms.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import PortalDashboard from './pages/portal/PortalDashboard.jsx';
import PortalForms from './pages/portal/PortalForms.jsx';
import PortalSupport from './pages/portal/PortalSupport.jsx';
import PortalBilling from './pages/portal/PortalBilling.jsx';
import PortalAnalytics from './pages/portal/PortalAnalytics.jsx';
import PortalProfile from './pages/portal/PortalProfile.jsx';
import PortalDocuments from './pages/portal/PortalDocuments.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Owner admin workspace */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <DashboardLayout area="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="clients/:clientId" element={<AdminClientDetail />} />
        <Route path="leads" element={<AdminLeads />} />
        <Route path="forms" element={<AdminForms />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Client portal */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute role="client">
            <DashboardLayout area="portal" />
          </ProtectedRoute>
        }
      >
        <Route index element={<PortalDashboard />} />
        <Route path="forms" element={<PortalForms />} />
        <Route path="analytics" element={<PortalAnalytics />} />
        <Route path="support" element={<PortalSupport />} />
        <Route path="billing" element={<PortalBilling />} />
        <Route path="profile" element={<PortalProfile />} />
        <Route path="documents" element={<PortalDocuments />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
