import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Pagination from '../../components/Pagination';
import { 
  Briefcase, 
  MapPin, 
  Users,
  Calendar,
  Loader2,
  PlusCircle,
  Edit2,
  ExternalLink,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, pagination.current]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pagination.current.toString());
      params.set('limit', '10');
      if (statusFilter) params.set('status', statusFilter);

      const response = await api.get(`/jobs/recruiter/my-jobs?${params.toString()}`);
      setJobs(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'badge-success',
      paused: 'badge-warning',
      closed: 'badge-neutral'
    };
    return styles[status] || 'badge-neutral';
  };

  return (
    <div className="py-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary-400" />
            My Job Postings
          </h1>
          <p className="text-slate-400">
            {pagination.total} job{pagination.total !== 1 ? 's' : ''} posted
          </p>
        </div>

        <div className="flex items-center gap-3">
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
              <option value="open">Open</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <Link to="/recruiter/post-job" className="btn-primary flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Post Job
          </Link>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No jobs posted yet</h3>
          <p className="text-slate-400 mb-4">
            {statusFilter ? 'No jobs match this filter' : 'Create your first job posting to start hiring'}
          </p>
          <Link to="/recruiter/post-job" className="btn-primary inline-flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <div 
              key={job._id}
              className="glass-card p-6 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/50 flex-shrink-0">
                      <Briefcase className="w-7 h-7 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-lg text-white line-clamp-1">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {job.applicationsCount || 0} applicants
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className={getStatusBadge(job.status)}>{job.status}</span>
                        <span className="badge-neutral capitalize">{job.jobType?.replace('-', ' ')}</span>
                        <span className="badge-neutral capitalize">{job.locationType}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/recruiter/jobs/${job._id}/applicants`}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <Users className="w-4 h-4" />
                    View Applicants
                    {job.applicationsCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                        {job.applicationsCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to={`/recruiter/jobs/${job._id}/edit`}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Link>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="btn-ghost flex items-center gap-1 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Skills preview */}
              {job.skills && job.skills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 6).map((skill, i) => (
                      <span key={i} className="skill-tag text-xs">{skill}</span>
                    ))}
                    {job.skills.length > 6 && (
                      <span className="text-xs text-slate-500">+{job.skills.length - 6} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && jobs.length > 0 && (
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

export default MyJobs;
