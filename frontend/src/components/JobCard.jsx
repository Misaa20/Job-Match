import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Building2, 
  Heart,
  ExternalLink
} from 'lucide-react';
import { formatSalaryRange } from '../utils/formatSalary';

const JobCard = ({ 
  job, 
  showMatchScore = false, 
  onSave, 
  isSaved = false,
  showSaveButton = true 
}) => {
  const getMatchScoreClass = (score) => {
    if (score >= 70) return 'match-score-high';
    if (score >= 40) return 'match-score-medium';
    return 'match-score-low';
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': 'badge-success',
      'part-time': 'badge-warning',
      'contract': 'badge-primary',
      'internship': 'badge-neutral',
      'freelance': 'badge-danger'
    };
    return colors[type] || 'badge-neutral';
  };

  const getLocationTypeColor = (type) => {
    const colors = {
      'remote': 'badge-success',
      'hybrid': 'badge-warning',
      'onsite': 'badge-neutral'
    };
    return colors[type] || 'badge-neutral';
  };

  return (
    <div className="glass-card-hover p-6 group">
      <div className="flex gap-4">
        {/* Company Logo Placeholder */}
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#252528] flex items-center justify-center border border-[#3a3a40]">
          <Building2 className="w-7 h-7 text-accent-400" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link 
                to={`/jobs/${job._id}`}
                className="font-display font-semibold text-lg text-warm-100 hover:text-accent-400 transition-colors line-clamp-1"
              >
                {job.title}
              </Link>
              <p className="text-warm-400 text-sm mt-0.5">{job.company}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {showMatchScore && job.matchScore !== undefined && (
                <div className={getMatchScoreClass(job.matchScore)}>
                  {job.matchScore}%
                </div>
              )}
              {showSaveButton && onSave && (
                <button
                  onClick={() => onSave(job._id)}
                  className={`p-2 rounded-lg transition-all ${
                    isSaved 
                      ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/20'
                      : 'bg-[#252528] text-warm-400 hover:bg-[#2a2a2e] hover:text-rose-400'
                  }`}
                >
                  {isSaved ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-warm-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            {formatSalaryRange(job.salary) && (
              <span className="flex items-center gap-1.5">
                {formatSalaryRange(job.salary)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={getJobTypeColor(job.jobType)}>
              {job.jobType?.replace('-', ' ')}
            </span>
            <span className={getLocationTypeColor(job.locationType)}>
              {job.locationType}
            </span>
            <span className="badge-neutral capitalize">
              {job.experienceLevel}
            </span>
          </div>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {job.skills.slice(0, 5).map((skill, index) => (
                <span 
                  key={index}
                  className={`skill-tag text-xs ${
                    job.matchedSkills?.includes(skill) ? 'skill-tag-matched' : ''
                  }`}
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="skill-tag text-xs">+{job.skills.length - 5} more</span>
              )}
            </div>
          )}

          {/* View button (appears on hover) */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-warm-500">
              {job.applicationsCount || 0} applicants
            </div>
            <Link
              to={`/jobs/${job._id}`}
              className="flex items-center gap-1 text-sm text-accent-400 hover:text-accent-300 opacity-0 group-hover:opacity-100 transition-all"
            >
              View Details <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
