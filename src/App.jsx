import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Appointments from './pages/Appointments';
import CarePlans from './pages/CarePlans';
import HealthResources from './pages/HealthResources';
import PatientRecords from './pages/PatientRecords';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/onboarding" element={
            <PrivateRoute>
              <Onboarding />
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/appointments" element={
            <PrivateRoute>
              <Appointments />
            </PrivateRoute>
          } />
          
          <Route path="/care-plans" element={
            <PrivateRoute>
              <CarePlans />
            </PrivateRoute>
          } />
          
          <Route path="/resources" element={
            <PrivateRoute>
              <HealthResources />
            </PrivateRoute>
          } />

          <Route path="/patient-records" element={
            <PrivateRoute allowedRoles={['admin', 'doctor', 'healthcare_provider']}>
              <PatientRecords />
            </PrivateRoute>
          } />
          
          <Route path="/admin" element={
            <PrivateRoute requireAdmin>
              <Admin />
            </PrivateRoute>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </AuthProvider>
  );
}

export default App;
