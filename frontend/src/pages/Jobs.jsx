import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import Pagination from '../components/Pagination';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  X,
  Loader2,
  SlidersHorizontal 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Jobs = () => {
  const { isCandidate, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    locationType: searchParams.get('locationType') || '',
    skills: searchParams.get('skills') || ''
  });

  useEffect(() => {
    fetchJobs();
    if (isCandidate) {
      fetchSavedJobs();
    }
  }, [searchParams]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      params.set('limit', '10');
      
      const response = await api.get(`/jobs?${params.toString()}`);
      setJobs(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await api.get('/jobs/saved/list');
      const savedIds = new Set(response.data.data.map(job => job._id));
      setSavedJobs(savedIds);
    } catch (error) {
      // Ignore - user might not be logged in
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      jobType: '',
      experienceLevel: '',
      locationType: '',
      skills: ''
    });
    setSearchParams({});
  };

  const handleSaveJob = async (jobId) => {
    if (!isCandidate) {
      toast.error('Please login as a candidate to save jobs');
      return;
    }

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

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="py-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-warm-100 mb-2">
          Find Your Dream Job
        </h1>
        <p className="text-warm-400">
          {pagination.total} jobs available • Updated daily
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="glass-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Job title, company, or keywords..."
              className="input-field pl-12"
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-500" />
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="Location..."
              className="input-field pl-12"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-slate-700' : ''}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 animate-slide-down">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label-text">Job Type</label>
                <select
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
              <div>
                <label className="label-text">Experience Level</label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
              <div>
                <label className="label-text">Work Type</label>
                <select
                  value={filters.locationType}
                  onChange={(e) => handleFilterChange('locationType', e.target.value)}
                  className="input-field"
                >
                  <option value="">All</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
              <div>
                <label className="label-text">Skills (comma separated)</label>
                <input
                  type="text"
                  value={filters.skills}
                  onChange={(e) => handleFilterChange('skills', e.target.value)}
                  placeholder="react, node, python..."
                  className="input-field"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Job Listings */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase className="w-16 h-16 text-warm-500/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-warm-100 mb-2">No jobs found</h3>
          <p className="text-warm-400 mb-4">Try adjusting your search criteria</p>
          <button onClick={clearFilters} className="btn-secondary">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <div key={job._id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <JobCard
                job={job}
                showMatchScore={isCandidate && user?.skills?.length > 0}
                onSave={handleSaveJob}
                isSaved={savedJobs.has(job._id)}
                showSaveButton={isCandidate}
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

export default Jobs;
