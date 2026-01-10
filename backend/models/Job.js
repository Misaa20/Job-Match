const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a job description'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  company: {
    type: String,
    required: [true, 'Please provide company name'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please provide job location'],
    trim: true
  },
  locationType: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
    default: 'onsite'
  },
  salary: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    default: 'full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid'
  },
  skills: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  requirements: [{
    type: String
  }],
  benefits: [{
    type: String
  }],
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'paused'],
    default: 'open'
  },
  deadline: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for search functionality
jobSchema.index({ title: 'text', description: 'text', company: 'text', skills: 'text' });
jobSchema.index({ skills: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
