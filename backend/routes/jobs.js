const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Validation for creating/updating jobs
const jobValidation = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().notEmpty().withMessage('Job description is required'),
  body('company').trim().notEmpty().withMessage('Company name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('skills').isArray().withMessage('Skills must be an array')
];

// @route   GET /api/jobs
// @desc    Get all jobs with search, filters, and pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      skills,
      location,
      jobType,
      experienceLevel,
      locationType,
      salaryMin,
      salaryMax,
      status = 'open',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};

    // Status filter (default to open jobs)
    if (status) {
      query.status = status;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.toLowerCase().trim());
      query.skills = { $in: skillsArray };
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Job type filter
    if (jobType) {
      query.jobType = jobType;
    }

    // Experience level filter
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Location type filter (remote, onsite, hybrid)
    if (locationType) {
      query.locationType = locationType;
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      query['salary.min'] = {};
      if (salaryMin) query['salary.min'].$gte = parseInt(salaryMin);
      if (salaryMax) query['salary.max'] = { $lte: parseInt(salaryMax) };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('recruiter', 'name company')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name company companyWebsite');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private (Recruiter only)
router.post('/', protect, authorize('recruiter'), jobValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      company,
      location,
      locationType,
      salary,
      jobType,
      experienceLevel,
      skills,
      requirements,
      benefits,
      deadline
    } = req.body;

    const job = await Job.create({
      title,
      description,
      company: company || req.user.company,
      location,
      locationType,
      salary,
      jobType,
      experienceLevel,
      skills: skills.map(s => s.toLowerCase().trim()),
      requirements,
      benefits,
      deadline,
      recruiter: req.user.id
    });

    await job.populate('recruiter', 'name company');

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private (Recruiter owner only)
router.put('/:id', protect, authorize('recruiter'), async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updateData = { ...req.body };
    if (updateData.skills) {
      updateData.skills = updateData.skills.map(s => s.toLowerCase().trim());
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('recruiter', 'name company');

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private (Recruiter owner only)
router.delete('/:id', protect, authorize('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/jobs/recruiter/my-jobs
// @desc    Get all jobs posted by the current recruiter
// @access  Private (Recruiter only)
router.get('/recruiter/my-jobs', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { recruiter: req.user.id };
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Get recruiter jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/jobs/:id/save
// @desc    Save/unsave a job for candidate
// @access  Private (Candidate only)
router.post('/:id/save', protect, authorize('candidate'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const user = await User.findById(req.user.id);
    const savedIndex = user.savedJobs.indexOf(req.params.id);

    if (savedIndex > -1) {
      // Unsave
      user.savedJobs.splice(savedIndex, 1);
      await user.save();
      res.json({ success: true, saved: false, message: 'Job removed from saved' });
    } else {
      // Save
      user.savedJobs.push(req.params.id);
      await user.save();
      res.json({ success: true, saved: true, message: 'Job saved successfully' });
    }
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/jobs/saved/list
// @desc    Get all saved jobs for candidate
// @access  Private (Candidate only)
router.get('/saved/list', protect, authorize('candidate'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedJobs',
      populate: {
        path: 'recruiter',
        select: 'name company'
      }
    });

    res.json({
      success: true,
      data: user.savedJobs
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
