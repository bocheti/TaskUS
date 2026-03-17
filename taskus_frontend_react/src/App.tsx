import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from 'sonner'; 

import { LandingScreen } from '@/pages/unauthorised/LandingScreen';
import { LoginScreen } from '@/pages/unauthorised/LoginScreen';
import { RequestScreen } from '@/pages/unauthorised/RequestScreen';
import { CreateOrgScreen } from '@/pages/unauthorised/CreateOrgScreen';
import { ResetPasswordRequestScreen } from '@/pages/unauthorised/ResetPasswordRequestScreen';
import { ResetPasswordScreen } from '@/pages/unauthorised/ResetPasswordScreen';

import { DashboardScreen } from '@/pages/authorised/DashboardScreen';
import { ProjectListScreen } from '@/pages/authorised/ProjectListScreen';
import { ProjectDetailScreen } from '@/pages/authorised/ProjectDetailScreen';
import { TaskGroupDetailScreen } from '@/pages/authorised/TaskGroupDetailScreen';
import { ProfileScreen } from '@/pages/authorised/ProfileScreen';

import { OrganisationSettingsScreen } from '@/pages/admin/OrganisationSettingsScreen';
import { UserManagementScreen } from '@/pages/admin/UserManagementScreen';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFoundScreen } from './pages/NotFoundScreen';

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
        <Routes>
           <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" replace /> : <LandingScreen />} 
          />

          <Route path="/login" element={<LoginScreen />} />
          <Route path="/request" element={<RequestScreen />} />
          <Route path="/create-org" element={<CreateOrgScreen />} />
          <Route path="/reset-password-request" element={<ResetPasswordRequestScreen />} />
          <Route path="/reset-password" element={<ResetPasswordScreen />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectListScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectDetailScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/taskgroups/:taskGroupId"
            element={
              <ProtectedRoute>
                <TaskGroupDetailScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <ProfileScreen />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/organisation"
            element={
              <ProtectedRoute requireAdmin>
                <OrganisationSettingsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <UserManagementScreen />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundScreen />} />      
        </Routes>
    </BrowserRouter>
  );
}

export default App;