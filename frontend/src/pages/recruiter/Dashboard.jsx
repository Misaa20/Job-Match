import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  Briefcase, 
  Users, 
  FileText,
  Clock,
  CheckCircle,
  Star,
  XCircle,
  ArrowRight,
  Loader2,
  PlusCircle,
  TrendingUp,
  Building2
} from 'lucide-react';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, jobsRes, appsRes] = await Promise.all([
        api.get('/applications/stats/recruiter'),
        api.get('/jobs/recruiter/my-jobs?limit=5'),
        api.get('/applications/recruiter/all?limit=5')
      ]);

      setStats(statsRes.data.data);
      setRecentJobs(jobsRes.data.data);
      setRecentApplications(appsRes.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="py-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Welcome, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-slate-400 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {user?.company || 'Recruiter Dashboard'}
          </p>
        </div>
        <Link to="/recruiter/post-job" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Post New Job
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 animate-slide-up stagger-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.jobsPosted || 0}</p>
              <p className="text-sm text-slate-400">Jobs Posted</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 animate-slide-up stagger-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-accent-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
              <p className="text-sm text-slate-400">Total Applications</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 animate-slide-up stagger-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.byStatus?.pending || 0}</p>
              <p className="text-sm text-slate-400">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 animate-slide-up stagger-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.byStatus?.shortlisted || 0}</p>
              <p className="text-sm text-slate-400">Shortlisted</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary-400" />
              Your Job Postings
            </h2>
            <Link 
              to="/recruiter/jobs"
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No jobs posted yet</h3>
              <p className="text-slate-400 mb-4">Start by posting your first job opening</p>
              <Link to="/recruiter/post-job" className="btn-primary inline-flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Post a Job
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job, index) => (
                <div 
                  key={job._id}
                  className="glass-card-hover p-4 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <Link 
                        to={`/recruiter/jobs/${job._id}/applicants`}
                        className="font-medium text-white hover:text-primary-400 transition-colors"
                      >
                        {job.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.applicationsCount || 0} applicants</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge-${job.status === 'open' ? 'success' : 'neutral'}`}>
                        {job.status}
                      </span>
                      <Link
                        to={`/recruiter/jobs/${job._id}/applicants`}
                        className="text-sm text-primary-400 hover:text-primary-300"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Recent Applications
            </h2>
            <Link 
              to="/recruiter/applications"
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
              </div>
            ) : (
              recentApplications.map((app) => (
                <div key={app._id} className="p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-white line-clamp-1">
                        {app.candidate?.name}
                      </p>
                      <p className="text-sm text-slate-400">{app.job?.title}</p>
                    </div>
                    <span className={getStatusColor(app.status)}>
                      {app.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {getStatusIcon(app.status)}
                      <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`text-xs font-medium ${
                      app.matchScore >= 70 ? 'text-emerald-400' : 
                      app.matchScore >= 40 ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {app.matchScore}% match
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 space-y-3">
            <Link
              to="/recruiter/post-job"
              className="glass-card-hover p-4 flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <PlusCircle className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white group-hover:text-primary-400 transition-colors">
                  Post New Job
                </p>
                <p className="text-sm text-slate-400">Create a new listing</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-primary-400 transition-colors" />
            </Link>

            <Link
              to="/recruiter/applications"
              className="glass-card-hover p-4 flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white group-hover:text-accent-400 transition-colors">
                  Review Applications
                </p>
                <p className="text-sm text-slate-400">
                  {stats?.byStatus?.pending || 0} pending
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-accent-400 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
