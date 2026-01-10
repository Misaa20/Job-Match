import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  User, 
  Mail, 
  MapPin, 
  Upload, 
  FileText, 
  Plus, 
  X, 
  Loader2,
  CheckCircle,
  Briefcase,
  Clock,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    experience: user?.experience || 0
  });
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);

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

  const handleAddExtractedSkill = (skill) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
      setExtractedSkills(extractedSkills.filter(s => s !== skill));
    }
  };

  const handleAddAllExtracted = () => {
    const newSkills = extractedSkills.filter(s => !skills.includes(s));
    setSkills([...skills, ...newSkills]);
    setExtractedSkills([]);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', {
        ...formData,
        skills
      });
      updateUser({ ...formData, skills });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      updateUser({ 
        resume: response.data.data.resume,
        skills: response.data.data.allSkills
      });
      setSkills(response.data.data.allSkills);
      
      // Show extracted skills for review
      const newExtracted = response.data.data.extractedSkills.filter(
        s => !skills.includes(s)
      );
      if (newExtracted.length > 0) {
        setExtractedSkills(newExtracted);
        toast.success(`Resume uploaded! Found ${response.data.data.extractedSkills.length} skills.`);
      } else {
        toast.success('Resume uploaded successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="py-6 animate-fade-in max-w-4xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Your Profile</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="glass-card p-6">
            <h2 className="font-display text-lg font-semibold text-white mb-4">
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="label-text">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-12"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="label-text">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-field pl-12 bg-slate-800/50 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="label-text">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field pl-12"
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              <div>
                <label className="label-text">Years of Experience</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="label-text">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Tell recruiters about yourself..."
                  maxLength={500}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="glass-card p-6">
            <h2 className="font-display text-lg font-semibold text-white mb-4">
              Skills
            </h2>

            {/* Extracted Skills from Resume */}
            {extractedSkills.length > 0 && (
              <div className="mb-4 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl animate-slide-down">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-400" />
                    <span className="font-medium text-primary-300">Skills extracted from resume</span>
                  </div>
                  <button
                    onClick={handleAddAllExtracted}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    Add All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedSkills.map((skill, index) => (
                    <button
                      key={index}
                      onClick={() => handleAddExtractedSkill(skill)}
                      className="skill-tag hover:bg-primary-500/20 hover:border-primary-500/50 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="input-field flex-1"
                placeholder="Add a skill (e.g., React, Python)"
              />
              <button type="submit" className="btn-secondary">
                <Plus className="w-5 h-5" />
              </button>
            </form>

            {/* Skills List */}
            <div className="flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <p className="text-slate-500 text-sm">No skills added yet. Upload your resume or add them manually.</p>
              ) : (
                skills.map((skill, index) => (
                  <span key={index} className="skill-tag group">
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2"
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

        {/* Sidebar - Resume */}
        <div>
          <div className="glass-card p-6 sticky top-24">
            <h2 className="font-display text-lg font-semibold text-white mb-4">
              Resume
            </h2>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleResumeUpload}
              className="hidden"
            />

            {user?.resume ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-emerald-300 truncate">
                        {user.resume.filename}
                      </p>
                      <p className="text-xs text-slate-400">
                        Uploaded {new Date(user.resume.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload New Resume
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div 
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-primary-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
                    <p className="text-slate-400">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-white font-medium mb-1">Upload Resume</p>
                    <p className="text-sm text-slate-500">PDF only, max 5MB</p>
                    <p className="text-xs text-primary-400 mt-3">
                      We'll automatically extract your skills!
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Profile Tips</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Add at least 5 skills for better matches</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Upload an up-to-date resume</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Complete your bio to stand out</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
