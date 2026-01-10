import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Plus, 
  X, 
  Loader2,
  ArrowLeft,
  CheckCircle,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    locationType: 'onsite',
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    status: 'open'
  });
  
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [requirements, setRequirements] = useState(['']);
  const [benefits, setBenefits] = useState(['']);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      const job = response.data.data;
      
      setFormData({
        title: job.title || '',
        description: job.description || '',
        company: job.company || '',
        location: job.location || '',
        locationType: job.locationType || 'onsite',
        jobType: job.jobType || 'full-time',
        experienceLevel: job.experienceLevel || 'mid',
        salaryMin: job.salary?.min || '',
        salaryMax: job.salary?.max || '',
        salaryCurrency: job.salary?.currency || 'USD',
        status: job.status || 'open'
      });
      setSkills(job.skills || []);
      setRequirements(job.requirements?.length ? job.requirements : ['']);
      setBenefits(job.benefits?.length ? job.benefits : ['']);
    } catch (error) {
      toast.error('Job not found');
      navigate('/recruiter/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.toLowerCase().trim())) {
      setSkills([...skills, newSkill.toLowerCase().trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleListChange = (list, setList, index, value) => {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  };

  const handleAddListItem = (list, setList) => {
    setList([...list, '']);
  };

  const handleRemoveListItem = (list, setList, index) => {
    if (list.length > 1) {
      setList(list.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    setSaving(true);
    try {
      const jobData = {
        ...formData,
        skills,
        requirements: requirements.filter(r => r.trim()),
        benefits: benefits.filter(b => b.trim()),
        salary: {
          min: formData.salaryMin ? parseInt(formData.salaryMin) : 0,
          max: formData.salaryMax ? parseInt(formData.salaryMax) : 0,
          currency: formData.salaryCurrency
        }
      };

      await api.put(`/jobs/${id}`, jobData);
      toast.success('Job updated successfully!');
      navigate('/recruiter/jobs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/jobs/${id}`);
      toast.success('Job deleted successfully');
      navigate('/recruiter/jobs');
    } catch (error) {
      toast.error('Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Edit Job</h1>
            <p className="text-slate-400">Update your job listing</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-secondary text-red-400 hover:text-red-300 hover:border-red-500/50 flex items-center gap-2"
        >
          {deleting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Trash2 className="w-5 h-5" />
              Delete Job
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status */}
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            Job Status
          </h2>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input-field w-auto"
          >
            <option value="open">Open - Accepting applications</option>
            <option value="paused">Paused - Temporarily not accepting</option>
            <option value="closed">Closed - No longer accepting</option>
          </select>
        </div>

        {/* Basic Info */}
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="label-text">Job Title *</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-text">Company Name *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label-text">Job Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field min-h-[150px] resize-none"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-text">Work Type</label>
                <select
                  name="locationType"
                  value={formData.locationType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="onsite">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text">Job Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="input-field"
                >
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
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            Salary Range
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text">Currency</label>
              <select
                name="salaryCurrency"
                value={formData.salaryCurrency}
                onChange={handleChange}
                className="input-field"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>

            <div>
              <label className="label-text">Minimum</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  className="input-field pl-12"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="label-text">Maximum</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  className="input-field pl-12"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            Required Skills *
          </h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
              className="input-field flex-1"
              placeholder="Add a skill"
            />
            <button 
              type="button"
              onClick={handleAddSkill}
              className="btn-secondary"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="skill-tag group">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            Requirements
          </h2>

          <div className="space-y-3">
            {requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleListChange(requirements, setRequirements, index, e.target.value)}
                  className="input-field flex-1"
                  placeholder="e.g., 3+ years of experience"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveListItem(requirements, setRequirements, index)}
                  className="p-3 text-slate-500 hover:text-red-400 transition-colors"
                  disabled={requirements.length === 1}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddListItem(requirements, setRequirements)}
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Requirement
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            Benefits
          </h2>

          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => handleListChange(benefits, setBenefits, index, e.target.value)}
                  className="input-field flex-1"
                  placeholder="e.g., Health insurance"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveListItem(benefits, setBenefits, index)}
                  className="p-3 text-slate-500 hover:text-red-400 transition-colors"
                  disabled={benefits.length === 1}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddListItem(benefits, setBenefits)}
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Benefit
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
