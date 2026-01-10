import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  MapPin, 
  Clock, 
  Building2, 
  Heart,
  Share2,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Send,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formatSalaryFull } from '../utils/formatSalary';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCandidate } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJob();
    if (isCandidate) {
      checkMatchScore();
      checkSavedStatus();
      checkApplicationStatus();
    }
  }, [id, isCandidate]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.data);
    } catch (error) {
      toast.error('Job not found');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const checkMatchScore = async () => {
    try {
      const response = await api.get(`/matching/job/${id}`);
      setMatchData(response.data.data);
    } catch (error) {
      // Ignore
    }
  };

  const checkSavedStatus = async () => {
    try {
      const response = await api.get('/jobs/saved/list');
      const savedIds = response.data.data.map(job => job._id);
      setIsSaved(savedIds.includes(id));
    } catch (error) {
      // Ignore
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      const applied = response.data.data.some(app => app.job._id === id);
      setHasApplied(applied);
    } catch (error) {
      // Ignore
    }
  };

  const handleSave = async () => {
    if (!isCandidate) {
      toast.error('Please login as a candidate to save jobs');
      return;
    }

    try {
      const response = await api.post(`/jobs/${id}/save`);
      setIsSaved(response.data.saved);
      toast.success(response.data.saved ? 'Job saved!' : 'Job removed from saved');
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isCandidate) {
      toast.error('Only candidates can apply for jobs');
      return;
    }

    setApplying(true);
    try {
      await api.post(`/applications/${id}`, { coverLetter });
      setHasApplied(true);
      setShowApplyModal(false);
      toast.success('Application submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const getMatchScoreClass = (score) => {
    if (score >= 70) return 'match-score-high';
    if (score >= 40) return 'match-score-medium';
    return 'match-score-low';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="py-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Jobs
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/50">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold text-white mb-1">
                  {job.title}
                </h1>
                <p className="text-lg text-slate-400">{job.company}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="badge-success capitalize">{job.jobType?.replace('-', ' ')}</span>
                  <span className="badge-primary capitalize">{job.locationType}</span>
                  <span className="badge-neutral capitalize">{job.experienceLevel}</span>
                  {job.status !== 'open' && (
                    <span className="badge-danger uppercase">{job.status}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/50">
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-5 h-5" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span>{formatSalaryFull(job.salary)}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Calendar className="w-5 h-5" />
                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Users className="w-5 h-5" />
                <span>{job.applicationsCount || 0} applicants</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card p-6">
            <h2 className="font-display text-lg font-semibold text-white mb-4">Job Description</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="font-display text-lg font-semibold text-white mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="font-display text-lg font-semibold text-white mb-4">Benefits</h2>
              <ul className="space-y-2">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <div className="glass-card p-6 sticky top-24">
            {/* Match Score */}
            {isCandidate && matchData && (
              <div className="mb-6 pb-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400">Your Match Score</span>
                  <div className={getMatchScoreClass(matchData.matchScore)}>
                    {matchData.matchScore}%
                  </div>
                </div>
                
                {matchData.matchedSkills?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-slate-400 mb-2">Matched Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchData.matchedSkills.map((skill, i) => (
                        <span key={i} className="skill-tag-matched text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {matchData.missingSkills?.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Missing Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchData.missingSkills.map((skill, i) => (
                        <span key={i} className="skill-tag text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {hasApplied ? (
              <div className="text-center py-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-emerald-400 font-medium">You've applied!</p>
                <Link 
                  to="/candidate/applications"
                  className="text-sm text-slate-400 hover:text-white"
                >
                  View your applications
                </Link>
              </div>
            ) : job.status !== 'open' ? (
              <div className="text-center py-4 bg-slate-700/30 rounded-xl">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400">This job is no longer accepting applications</p>
              </div>
            ) : (
              <button
                onClick={() => isAuthenticated ? setShowApplyModal(true) : navigate('/login')}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {isAuthenticated ? 'Apply Now' : 'Login to Apply'}
              </button>
            )}

            {/* Save & Share */}
            {isCandidate && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSave}
                  className={`btn-secondary flex-1 flex items-center justify-center gap-2 ${
                    isSaved ? 'text-red-400' : ''
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied!');
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            )}

            {/* Skills Required */}
            {job.skills && job.skills.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className={`skill-tag text-xs ${
                        matchData?.matchedSkills?.includes(skill) ? 'skill-tag-matched' : ''
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recruiter Info */}
            {job.recruiter && (
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Posted By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium">
                    {job.recruiter.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{job.recruiter.name}</p>
                    <p className="text-sm text-slate-400">{job.recruiter.company}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-lg p-6 animate-scale-in">
            <h2 className="font-display text-xl font-bold text-white mb-4">
              Apply for {job.title}
            </h2>
            
            {matchData && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-slate-700/30 rounded-xl">
                <div className={getMatchScoreClass(matchData.matchScore)}>
                  {matchData.matchScore}%
                </div>
                <div>
                  <p className="text-sm text-white">Your Match Score</p>
                  <p className="text-xs text-slate-400">
                    {matchData.matchedSkills?.length || 0} of {job.skills?.length || 0} skills matched
                  </p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="label-text">Cover Letter (Optional)</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="input-field min-h-[150px] resize-none"
                placeholder="Tell the recruiter why you're a great fit for this role..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {applying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
