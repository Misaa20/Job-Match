import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import Pagination from '../../components/Pagination';
import { 
  Users, 
  ArrowLeft,
  Loader2,
  Mail,
  MapPin,
  FileText,
  Download,
  Clock,
  CheckCircle,
  Star,
  XCircle,
  Filter,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const JobApplicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('matchScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchJobAndApplicants();
  }, [id, statusFilter, sortBy, sortOrder, pagination.current]);

  const fetchJobAndApplicants = async () => {
    setLoading(true);
    try {
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/applications/job/${id}?page=${pagination.current}&limit=10&status=${statusFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}`)
      ]);

      setJob(jobRes.data.data);
      setApplications(appsRes.data.data);
      setPagination(appsRes.data.pagination);
    } catch (error) {
      toast.error('Failed to load applicants');
      navigate('/recruiter/jobs');
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
    if (score >= 70) return 'match-score-high';
    if (score >= 40) return 'match-score-medium';
    return 'match-score-low';
  };

  if (loading && !job) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <button
          onClick={() => navigate('/recruiter/jobs')}
          className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            {job?.title}
          </h1>
          <p className="text-slate-400 flex items-center gap-4">
            <span>{job?.company}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job?.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {pagination.total} applicant{pagination.total !== 1 ? 's' : ''}
            </span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
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

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-auto"
            >
              <option value="matchScore">Match Score</option>
              <option value="appliedAt">Applied Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="btn-ghost text-sm"
            >
              {sortOrder === 'desc' ? '↓ High to Low' : '↑ Low to High'}
            </button>
          </div>
        </div>
      </div>

      {/* Applicants List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No applicants yet</h3>
          <p className="text-slate-400">
            {statusFilter ? 'No applicants match this filter' : 'Applications will appear here when candidates apply'}
          </p>
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
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Candidate Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {app.candidate?.name?.charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg text-white">
                          {app.candidate?.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-400">
                          <a 
                            href={`mailto:${app.candidate?.email}`}
                            className="flex items-center gap-1 hover:text-primary-400"
                          >
                            <Mail className="w-4 h-4" />
                            {app.candidate?.email}
                          </a>
                          {app.candidate?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {app.candidate.location}
                            </span>
                          )}
                          {app.candidate?.experience > 0 && (
                            <span>{app.candidate.experience} years exp.</span>
                          )}
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {app.matchedSkills?.map((skill, i) => (
                            <span key={i} className="skill-tag-matched text-xs">{skill}</span>
                          ))}
                          {app.candidate?.skills?.filter(s => !app.matchedSkills?.includes(s)).slice(0, 3).map((skill, i) => (
                            <span key={i} className="skill-tag text-xs">{skill}</span>
                          ))}
                        </div>

                        {/* Cover Letter Preview */}
                        {app.coverLetter && (
                          <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
                            <p className="text-sm text-slate-400 line-clamp-2">{app.coverLetter}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Match Score & Actions */}
                  <div className="flex flex-col items-center gap-4 lg:border-l lg:border-slate-700/50 lg:pl-6">
                    {/* Match Score */}
                    <div className="text-center">
                      <div className={getMatchScoreClass(app.matchScore)}>
                        {app.matchScore}%
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Match</p>
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        value={app.status}
                        onChange={(e) => updateApplicationStatus(app._id, e.target.value)}
                        disabled={updatingStatus === app._id}
                        className={`appearance-none px-4 py-2 pr-10 rounded-xl border font-medium cursor-pointer ${statusConfig.bg} ${statusConfig.color} border-current/30 focus:outline-none focus:ring-2 focus:ring-current/20`}
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
                        className="btn-ghost flex items-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Resume
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                    Last updated {new Date(app.updatedAt).toLocaleDateString()}
                  </span>
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

export default JobApplicants;
