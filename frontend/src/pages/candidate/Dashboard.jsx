import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import JobCard from '../../components/JobCard';
import { 
  Target, 
  FileText, 
  Heart, 
  Briefcase,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState(new Set());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, recsRes, appsRes, savedRes] = await Promise.all([
        api.get('/applications/stats/candidate'),
        api.get('/matching/recommendations?limit=4'),
        api.get('/applications/my-applications?limit=5'),
        api.get('/jobs/saved/list')
      ]);

      setStats(statsRes.data.data);
      setRecommendations(recsRes.data.data);
      setRecentApplications(appsRes.data.data);
      setSavedJobs(new Set(savedRes.data.data.map(j => j._id)));
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      const response = await api.post(`/jobs/${jobId}/save`);
      if (response.data.saved) {
        setSavedJobs(prev => new Set([...prev, jobId]));
        toast.success('Job saved!');
      } else {
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        toast.success('Job removed from saved');
      }
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4 text-amber-400" />,
      reviewed: <CheckCircle className="w-4 h-4 text-blue-400" />,
      shortlisted: <Star className="w-4 h-4 text-primary-400" />,
      interviewed: <CheckCircle className="w-4 h-4 text-purple-400" />,
      offered: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      rejected: <XCircle className="w-4 h-4 text-red-400" />,
      withdrawn: <XCircle className="w-4 h-4 text-slate-400" />
    };
    return icons[status] || <Clock className="w-4 h-4 text-slate-400" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'badge-warning',
      reviewed: 'badge-primary',
      shortlisted: 'badge-primary',
      interviewed: 'badge-success',
      offered: 'badge-success',
      rejected: 'badge-danger',
      withdrawn: 'badge-neutral'
    };
    return colors[status] || 'badge-neutral';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const hasSkills = user?.skills && user.skills.length > 0;

  return (
    <div className="py-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-warm-100 mb-2">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-warm-400">Here's what's happening with your job search</p>
      </div>

      {/* Profile Completion Alert */}
      {!hasSkills && (
        <div className="glass-card p-4 mb-6 border-amber-500/30 bg-amber-500/5 animate-slide-up">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-300">Complete Your Profile</h3>
              <p className="text-sm text-slate-400 mt-1">
                Add your skills to get personalized job matches and improve your visibility to recruiters.
              </p>
              <Link 
                to="/candidate/profile" 
                className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 mt-2"
              >
                Update Profile <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 animate-slide-up stagger-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
              <p className="text-sm text-slate-400">Applications</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 animate-slide-up stagger-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.byStatus?.pending || 0}</p>
              <p className="text-sm text-slate-400">Pending</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 animate-slide-up stagger-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.byStatus?.shortlisted || 0}</p>
              <p className="text-sm text-slate-400">Shortlisted</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 animate-slide-up stagger-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{savedJobs.size}</p>
              <p className="text-sm text-slate-400">Saved Jobs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recommended Jobs */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-warm-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-400" />
              Recommended for You
            </h2>
            <Link 
              to="/candidate/matched"
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {!hasSkills ? (
            <div className="glass-card p-8 text-center">
              <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No recommendations yet</h3>
              <p className="text-slate-400 mb-4">Add your skills to get personalized job matches</p>
              <Link to="/candidate/profile" className="btn-primary inline-flex items-center gap-2">
                Add Skills <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No matches found</h3>
              <p className="text-slate-400 mb-4">We'll notify you when jobs matching your skills are posted</p>
              <Link to="/jobs" className="btn-secondary inline-flex items-center gap-2">
                Browse All Jobs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((job, index) => (
                <div key={job._id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <JobCard
                    job={job}
                    showMatchScore={true}
                    onSave={handleSaveJob}
                    isSaved={savedJobs.has(job._id)}
                    showSaveButton={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-warm-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-400" />
              Recent Activity
            </h2>
            <Link 
              to="/candidate/applications"
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-card divide-y divide-slate-700/50">
            {recentApplications.length === 0 ? (
              <div className="p-6 text-center">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No applications yet</p>
                <Link 
                  to="/jobs"
                  className="text-sm text-primary-400 hover:text-primary-300 mt-2 inline-block"
                >
                  Start applying
                </Link>
              </div>
            ) : (
              recentApplications.map((app) => (
                <div key={app._id} className="p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link 
                        to={`/jobs/${app.job._id}`}
                        className="font-medium text-white hover:text-primary-400 line-clamp-1"
                      >
                        {app.job.title}
                      </Link>
                      <p className="text-sm text-slate-400">{app.job.company}</p>
                    </div>
                    <span className={`${getStatusColor(app.status)} whitespace-nowrap`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    {getStatusIcon(app.status)}
                    <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 space-y-3">
            <Link
              to="/jobs"
              className="glass-card-hover p-4 flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white group-hover:text-primary-400 transition-colors">
                  Browse Jobs
                </p>
                <p className="text-sm text-slate-400">Find your next opportunity</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-primary-400 transition-colors" />
            </Link>

            <Link
              to="/candidate/profile"
              className="glass-card-hover p-4 flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white group-hover:text-accent-400 transition-colors">
                  Update Resume
                </p>
                <p className="text-sm text-slate-400">Keep your profile fresh</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-accent-400 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
