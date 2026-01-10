import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Pagination from '../../components/Pagination';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star,
  Building2,
  MapPin,
  Calendar,
  Loader2,
  Filter,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, pagination.current]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pagination.current.toString());
      params.set('limit', '10');
      if (statusFilter) params.set('status', statusFilter);

      const response = await api.get(`/applications/my-applications?${params.toString()}`);
      setApplications(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
      await api.put(`/applications/${applicationId}/withdraw`);
      toast.success('Application withdrawn');
      fetchApplications();
    } catch (error) {
      toast.error('Failed to withdraw application');
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        icon: Clock, 
        color: 'text-amber-400', 
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/30',
        label: 'Pending Review'
      },
      reviewed: { 
        icon: CheckCircle, 
        color: 'text-blue-400', 
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/30',
        label: 'Reviewed'
      },
      shortlisted: { 
        icon: Star, 
        color: 'text-primary-400', 
        bg: 'bg-primary-500/20',
        border: 'border-primary-500/30',
        label: 'Shortlisted'
      },
      interviewed: { 
        icon: CheckCircle, 
        color: 'text-purple-400', 
        bg: 'bg-purple-500/20',
        border: 'border-purple-500/30',
        label: 'Interviewed'
      },
      offered: { 
        icon: CheckCircle, 
        color: 'text-emerald-400', 
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/30',
        label: 'Offer Received'
      },
      rejected: { 
        icon: XCircle, 
        color: 'text-red-400', 
        bg: 'bg-red-500/20',
        border: 'border-red-500/30',
        label: 'Not Selected'
      },
      withdrawn: { 
        icon: XCircle, 
        color: 'text-slate-400', 
        bg: 'bg-slate-500/20',
        border: 'border-slate-500/30',
        label: 'Withdrawn'
      }
    };
    return configs[status] || configs.pending;
  };

  const getMatchScoreClass = (score) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-slate-400';
  };

  return (
    <div className="py-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            My Applications
          </h1>
          <p className="text-slate-400">
            {pagination.total} application{pagination.total !== 1 ? 's' : ''} submitted
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            className="input-field w-auto"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interviewed">Interviewed</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No applications yet</h3>
          <p className="text-slate-400 mb-4">
            {statusFilter ? 'No applications match this filter' : 'Start applying to jobs to see them here'}
          </p>
          <Link to="/jobs" className="btn-primary inline-block">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app, index) => {
            const statusConfig = getStatusConfig(app.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div 
                key={app._id} 
                className="glass-card p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Job Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/50 flex-shrink-0">
                      <Building2 className="w-7 h-7 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link 
                        to={`/jobs/${app.job._id}`}
                        className="font-display font-semibold text-lg text-white hover:text-primary-400 transition-colors line-clamp-1"
                      >
                        {app.job.title}
                      </Link>
                      <p className="text-slate-400">{app.job.company}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {app.job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Match Score */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Match Score */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Match:</span>
                      <span className={`font-bold ${getMatchScoreClass(app.matchScore)}`}>
                        {app.matchScore}%
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bg} border ${statusConfig.border}`}>
                      <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                      <span className={`font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2">
                    {app.matchedSkills && app.matchedSkills.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">Matched:</span>
                        {app.matchedSkills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="skill-tag-matched text-xs">{skill}</span>
                        ))}
                        {app.matchedSkills.length > 3 && (
                          <span className="text-xs text-slate-500">+{app.matchedSkills.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {app.status === 'pending' && (
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        className="text-sm text-slate-400 hover:text-red-400 flex items-center gap-1"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Withdraw
                      </button>
                    )}
                    <Link
                      to={`/jobs/${app.job._id}`}
                      className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                    >
                      View Job <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && applications.length > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.current}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default MyApplications;
