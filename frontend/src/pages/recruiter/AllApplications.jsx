import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Pagination from '../../components/Pagination';
import { 
  Users, 
  Loader2,
  Mail,
  Clock,
  CheckCircle,
  Star,
  XCircle,
  Filter,
  ChevronDown,
  ExternalLink,
  Briefcase,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const AllApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);

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

      const response = await api.get(`/applications/recruiter/all?${params.toString()}`);
      setApplications(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);
    try {
      await api.put(`/applications/${applicationId}/status`, { status: newStatus });
      setApplications(apps => 
        apps.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadResume = async (candidateId, candidateName) => {
    try {
      const response = await api.get(`/resume/download/${candidateId}`, {
        responseType: 'blob'
      });
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${candidateName.replace(/\s+/g, '_')}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Resume downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error.response?.data?.message || 'Failed to download resume');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20' },
      reviewed: { icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      shortlisted: { icon: Star, color: 'text-primary-400', bg: 'bg-primary-500/20' },
      interviewed: { icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-500/20' },
      offered: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
      rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
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
          <h1 className="font-display text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-accent-400" />
            All Applications
          </h1>
          <p className="text-slate-400">
            {pagination.total} application{pagination.total !== 1 ? 's' : ''} across all jobs
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
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No applications yet</h3>
          <p className="text-slate-400 mb-4">
            {statusFilter ? 'No applications match this filter' : 'Applications will appear here when candidates apply to your jobs'}
          </p>
          <Link to="/recruiter/post-job" className="btn-primary inline-block">
            Post a Job
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
                className="glass-card p-5 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Candidate Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {app.candidate?.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-white truncate">{app.candidate?.name}</h3>
                      <a 
                        href={`mailto:${app.candidate?.email}`}
                        className="text-sm text-slate-400 hover:text-primary-400 flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        {app.candidate?.email}
                      </a>
                    </div>
                  </div>

                  {/* Job Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Briefcase className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <Link 
                        to={`/recruiter/jobs/${app.job?._id}/applicants`}
                        className="font-medium text-white hover:text-primary-400 truncate block"
                      >
                        {app.job?.title}
                      </Link>
                      <p className="text-sm text-slate-500">{app.job?.company}</p>
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Match:</span>
                    <span className={`font-bold ${getMatchScoreClass(app.matchScore)}`}>
                      {app.matchScore}%
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="relative">
                    <select
                      value={app.status}
                      onChange={(e) => updateApplicationStatus(app._id, e.target.value)}
                      disabled={updatingStatus === app._id}
                      className={`appearance-none px-4 py-2 pr-10 rounded-xl border font-medium cursor-pointer text-sm ${statusConfig.bg} ${statusConfig.color} border-current/30 focus:outline-none focus:ring-2 focus:ring-current/20`}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interviewed">Interviewed</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${statusConfig.color} pointer-events-none`} />
                    {updatingStatus === app._id && (
                      <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
                    )}
                  </div>

                  {/* Resume Download */}
                  {app.candidate?.resume && (
                    <button
                      onClick={() => handleDownloadResume(app.candidate._id, app.candidate.name)}
                      className="btn-ghost text-sm flex items-center gap-1"
                      title="Download Resume"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  {/* View Button */}
                  <Link
                    to={`/recruiter/jobs/${app.job?._id}/applicants`}
                    className="btn-ghost text-sm flex items-center gap-1"
                  >
                    View <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                  {app.matchedSkills && app.matchedSkills.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>Skills:</span>
                      {app.matchedSkills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="skill-tag-matched text-xs py-0.5 px-2">{skill}</span>
                      ))}
                      {app.matchedSkills.length > 3 && (
                        <span>+{app.matchedSkills.length - 3}</span>
                      )}
                    </div>
                  )}
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

export default AllApplications;
