import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Mail, Lock, User, Building2, ArrowRight, Loader2, UserCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate',
    company: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await register(formData);
      toast.success(`Welcome to JobMatch, ${user.name}!`);
      navigate(user.role === 'candidate' ? '/candidate/profile' : '/recruiter/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 animated-bg">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent-400/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-lg shadow-primary-500/20">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <span className="font-display font-bold text-3xl text-warm-100">JobMatch</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card p-8 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-warm-100 mb-2">Create Account</h1>
            <p className="text-warm-400">Join thousands finding their perfect match</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="label-text">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'candidate' })}
                  className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 ${
                    formData.role === 'candidate'
                      ? 'border-accent-400 bg-accent-500/10 text-accent-300'
                      : 'border-[#3a3a40] hover:border-[#4a4a52] text-warm-400 hover:text-warm-200'
                  }`}
                >
                  <UserCircle className="w-8 h-8" />
                  <span className="font-medium">Candidate</span>
                  <span className="text-xs opacity-70">Looking for jobs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'recruiter' })}
                  className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 ${
                    formData.role === 'recruiter'
                      ? 'border-primary-400 bg-primary-500/10 text-primary-300'
                      : 'border-[#3a3a40] hover:border-[#4a4a52] text-warm-400 hover:text-warm-200'
                  }`}
                >
                  <Users className="w-8 h-8" />
                  <span className="font-medium">Recruiter</span>
                  <span className="text-xs opacity-70">Hiring talent</span>
                </button>
              </div>
            </div>

            <div>
              <label className="label-text">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-text">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-warm-500">Minimum 6 characters</p>
            </div>

            {formData.role === 'recruiter' && (
              <div className="animate-slide-down">
                <label className="label-text">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-500" />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="input-field pl-12"
                    placeholder="Acme Inc."
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-warm-400">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
