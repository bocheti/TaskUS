import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from 'sonner'; 

import { LandingScreen } from '@/pages/LandingScreen';
import { LoginScreen } from '@/pages/auth/LoginScreen';
import { RequestScreen } from '@/pages/auth/RequestScreen';
import { CreateOrgScreen } from '@/pages/auth/CreateOrgScreen';
import { ResetPasswordRequestScreen } from '@/pages/auth/ResetPasswordRequestScreen';
import { ResetPasswordScreen } from '@/pages/auth/ResetPasswordScreen';

import { DashboardScreen } from '@/pages/dashboard/DashboardScreen';
import { ProjectListScreen } from '@/pages/projects/ProjectListScreen';
import { ProjectDetailScreen } from '@/pages/projects/ProjectDetailScreen';
import { TaskGroupDetailScreen } from '@/pages/projects/TaskGroupDetailScreen';
import { ProfileScreen } from '@/pages/profile/ProfileScreen';

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