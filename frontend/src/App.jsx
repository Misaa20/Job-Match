import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Candidate Pages
import CandidateDashboard from './pages/candidate/Dashboard';
import CandidateProfile from './pages/candidate/Profile';
import MyApplications from './pages/candidate/MyApplications';
import SavedJobs from './pages/candidate/SavedJobs';
import MatchedJobs from './pages/candidate/MatchedJobs';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import PostJob from './pages/recruiter/PostJob';
import EditJob from './pages/recruiter/EditJob';
import MyJobs from './pages/recruiter/MyJobs';
import JobApplicants from './pages/recruiter/JobApplicants';
import AllApplications from './pages/recruiter/AllApplications';

// Shared Pages
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';

// Loading spinner
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard'} replace />;
  }

  return children;
};

// Public Route wrapper (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={user.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard'} replace />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Layout wrapped routes */}
      <Route element={<Layout />}>
        {/* Redirect root to jobs */}
        <Route path="/" element={<Navigate to="/jobs" replace />} />

        {/* Public job listing */}
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Candidate Routes */}
        <Route path="/candidate/dashboard" element={
          <ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard /></ProtectedRoute>
        } />
        <Route path="/candidate/profile" element={
          <ProtectedRoute allowedRoles={['candidate']}><CandidateProfile /></ProtectedRoute>
        } />
        <Route path="/candidate/applications" element={
          <ProtectedRoute allowedRoles={['candidate']}><MyApplications /></ProtectedRoute>
        } />
        <Route path="/candidate/saved" element={
          <ProtectedRoute allowedRoles={['candidate']}><SavedJobs /></ProtectedRoute>
        } />
        <Route path="/candidate/matched" element={
          <ProtectedRoute allowedRoles={['candidate']}><MatchedJobs /></ProtectedRoute>
        } />

        {/* Recruiter Routes */}
        <Route path="/recruiter/dashboard" element={
          <ProtectedRoute allowedRoles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>
        } />
        <Route path="/recruiter/post-job" element={
          <ProtectedRoute allowedRoles={['recruiter']}><PostJob /></ProtectedRoute>
        } />
        <Route path="/recruiter/jobs/:id/edit" element={
          <ProtectedRoute allowedRoles={['recruiter']}><EditJob /></ProtectedRoute>
        } />
        <Route path="/recruiter/jobs" element={
          <ProtectedRoute allowedRoles={['recruiter']}><MyJobs /></ProtectedRoute>
        } />
        <Route path="/recruiter/jobs/:id/applicants" element={
          <ProtectedRoute allowedRoles={['recruiter']}><JobApplicants /></ProtectedRoute>
        } />
        <Route path="/recruiter/applications" element={
          <ProtectedRoute allowedRoles={['recruiter']}><AllApplications /></ProtectedRoute>
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/jobs" replace />} />
    </Routes>
  );
}

export default App;
