import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import JobCard from '../../components/JobCard';
import { Heart, Loader2, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const SavedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await api.get('/jobs/saved/list');
      setJobs(response.data.data);
      setSavedIds(new Set(response.data.data.map(j => j._id)));
    } catch (error) {
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/save`);
      setJobs(jobs.filter(j => j._id !== jobId));
      setSavedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      toast.success('Job removed from saved');
    } catch (error) {
      toast.error('Failed to remove job');
    }
  };

  return (
    <div className="py-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-400" />
          Saved Jobs
        </h1>
        <p className="text-slate-400">
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No saved jobs</h3>
          <p className="text-slate-400 mb-4">
            Save jobs you're interested in to apply later
          </p>
          <Link to="/jobs" className="btn-primary inline-block">
            Browse Jobs
          </Link>
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
                onSave={handleUnsave}
                isSaved={true}
                showSaveButton={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
