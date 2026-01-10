import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import JobCard from '../../components/JobCard';
import Pagination from '../../components/Pagination';
import { Target, Loader2, AlertCircle, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';

const MatchedJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    fetchMatchedJobs();
    fetchSavedJobs();
  }, [pagination.current, minScore]);

  const fetchMatchedJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pagination.current.toString());
      params.set('limit', '10');
      params.set('minScore', minScore.toString());
      params.set('sortBy', 'matchScore');

      const response = await api.get(`/matching/jobs?${params.toString()}`);
      setJobs(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load matched jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await api.get('/jobs/saved/list');
      setSavedJobs(new Set(response.data.data.map(j => j._id)));
    } catch (error) {
      // Ignore
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

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasSkills = user?.skills && user.skills.length > 0;

  return (
    <div className="py-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Target className="w-8 h-8 text-primary-400" />
            Matched Jobs
          </h1>
          <p className="text-slate-400">
            Jobs that match your skills, sorted by relevance
          </p>
        </div>

        {/* Score Filter */}
        {hasSkills && (
          <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-2">
            <Sliders className="w-5 h-5 text-slate-500" />
            <span className="text-sm text-slate-400">Min Score:</span>
            <select
              value={minScore}
              onChange={(e) => {
                setMinScore(parseInt(e.target.value));
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
              className="bg-transparent text-white font-medium focus:outline-none"
            >
              <option value="0">All</option>
              <option value="25">25%+</option>
              <option value="50">50%+</option>
              <option value="75">75%+</option>
            </select>
          </div>
        )}
      </div>

      {/* No Skills Warning */}
      {!hasSkills && (
        <div className="glass-card p-6 mb-6 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-300">Add skills to see matches</h3>
              <p className="text-sm text-slate-400 mt-1">
                We need to know your skills to find jobs that match your experience.
              </p>
              <Link 
                to="/candidate/profile" 
                className="btn-primary mt-3 inline-block text-sm"
              >
                Update Profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Your Skills */}
      {hasSkills && (
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Your skills ({user.skills.length})</span>
            <Link 
              to="/candidate/profile"
              className="text-xs text-primary-400 hover:text-primary-300"
            >
              Edit
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.skills.slice(0, 10).map((skill, index) => (
              <span key={index} className="skill-tag text-xs">{skill}</span>
            ))}
            {user.skills.length > 10 && (
              <span className="text-xs text-slate-500">+{user.skills.length - 10} more</span>
            )}
          </div>
        </div>
      )}

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : !hasSkills ? (
        <div className="glass-card p-12 text-center">
          <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No skills added yet</h3>
          <p className="text-slate-400 mb-4">
            Add your skills to get personalized job recommendations
          </p>
          <Link to="/candidate/profile" className="btn-primary inline-block">
            Add Skills
          </Link>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No matching jobs found</h3>
          <p className="text-slate-400 mb-4">
            {minScore > 0 
              ? 'Try lowering the minimum match score'
              : 'Check back later for new opportunities'}
          </p>
          {minScore > 0 && (
            <button 
              onClick={() => setMinScore(0)}
              className="btn-secondary"
            >
              Show All Jobs
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <div 
              key={job._id} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
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

export default MatchedJobs;
