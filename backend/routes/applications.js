const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { calculateMatchScore } = require('../utils/skillExtractor');

// @route   POST /api/applications/:jobId
// @desc    Apply for a job
// @access  Private (Candidate only)
router.post('/:jobId', protect, authorize('candidate'), async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.jobId;

    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user.id
    });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Calculate match score
    const candidateSkills = req.user.skills || [];
    const { score, matchedSkills } = calculateMatchScore(candidateSkills, job.skills);

    // Create application
    const application = await Application.create({
      job: jobId,
      candidate: req.user.id,
      recruiter: job.recruiter,
      coverLetter,
      matchScore: score,
      matchedSkills,
      resumeSnapshot: req.user.resume ? {
        filename: req.user.resume.filename,
        path: req.user.resume.path,
        skills: candidateSkills
      } : null,
      statusHistory: [{
        status: 'pending',
        changedAt: new Date()
      }]
    });

    // Update job application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    await application.populate([
      { path: 'job', select: 'title company location' },
      { path: 'candidate', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Apply error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/my-applications
// @desc    Get all applications for current candidate
// @access  Private (Candidate only)
router.get('/my-applications', protect, authorize('candidate'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { candidate: req.user.id };
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('job', 'title company location jobType status')
        .populate('recruiter', 'name company')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Application.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get all applications for a job (recruiter)
// @access  Private (Recruiter only)
router.get('/job/:jobId', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { status, sortBy = 'appliedAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Verify ownership
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const query = { job: req.params.jobId };
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('candidate', 'name email skills experience location resume')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Application.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/recruiter/all
// @desc    Get all applications for all recruiter's jobs
// @access  Private (Recruiter only)
router.get('/recruiter/all', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { recruiter: req.user.id };
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('job', 'title company location')
        .populate('candidate', 'name email skills')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Application.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application details
// @access  Private (Owner candidate or recruiter)
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate', 'name email skills experience location bio resume')
      .populate('recruiter', 'name company');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check authorization
    const isCandidate = application.candidate._id.toString() === req.user.id;
    const isRecruiter = application.recruiter._id.toString() === req.user.id;

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (recruiter only)
// @access  Private (Recruiter only)
router.put('/:id/status', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify ownership
    if (application.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user.id
    });

    await application.save();

    await application.populate([
      { path: 'job', select: 'title company' },
      { path: 'candidate', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      data: application
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/applications/:id/withdraw
// @desc    Withdraw application (candidate only)
// @access  Private (Candidate only)
router.put('/:id/withdraw', protect, authorize('candidate'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify ownership
    if (application.candidate.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (application.status === 'withdrawn') {
      return res.status(400).json({ message: 'Application already withdrawn' });
    }

    application.status = 'withdrawn';
    application.statusHistory.push({
      status: 'withdrawn',
      changedAt: new Date(),
      changedBy: req.user.id
    });

    await application.save();

    // Update job application count
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: application
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/applications/:id/notes
// @desc    Add note to application (recruiter only)
// @access  Private (Recruiter only)
router.post('/:id/notes', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Note text is required' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify ownership
    if (application.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.notes.push({
      text,
      addedBy: req.user.id,
      addedAt: new Date()
    });

    await application.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      data: application.notes
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/stats/candidate
// @desc    Get application statistics for candidate
// @access  Private (Candidate only)
router.get('/stats/candidate', protect, authorize('candidate'), async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { candidate: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      interviewed: 0,
      offered: 0,
      rejected: 0,
      withdrawn: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    res.json({
      success: true,
      data: {
        total,
        byStatus: statusCounts
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/stats/recruiter
// @desc    Get application statistics for recruiter
// @access  Private (Recruiter only)
router.get('/stats/recruiter', protect, authorize('recruiter'), async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { recruiter: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      interviewed: 0,
      offered: 0,
      rejected: 0,
      withdrawn: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    // Get jobs count
    const jobsCount = await Job.countDocuments({ recruiter: req.user._id });

    res.json({
      success: true,
      data: {
        total,
        jobsPosted: jobsCount,
        byStatus: statusCounts
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
