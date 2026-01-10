const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { calculateMatchScore } = require('../utils/skillExtractor');

// @route   GET /api/matching/jobs
// @desc    Get jobs matched to candidate's skills with scores
// @access  Private (Candidate only)
router.get('/jobs', protect, authorize('candidate'), async (req, res) => {
  try {
    const {
      minScore = 0,
      page = 1,
      limit = 10,
      sortBy = 'matchScore'
    } = req.query;

    const candidateSkills = req.user.skills || [];

    if (candidateSkills.length === 0) {
      return res.json({
        success: true,
        message: 'Add skills to your profile to see matched jobs',
        data: [],
        pagination: { current: 1, pages: 0, total: 0, limit: parseInt(limit) }
      });
    }

    // Get all open jobs
    const jobs = await Job.find({ status: 'open' })
      .populate('recruiter', 'name company')
      .lean();

    // Calculate match scores for each job
    const matchedJobs = jobs.map(job => {
      const { score, matchedSkills, missingSkills } = calculateMatchScore(
        candidateSkills,
        job.skills
      );
      return {
        ...job,
        matchScore: score,
        matchedSkills,
        missingSkills
      };
    });

    // Filter by minimum score
    const filteredJobs = matchedJobs.filter(job => job.matchScore >= parseInt(minScore));

    // Sort jobs
    if (sortBy === 'matchScore') {
      filteredJobs.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'createdAt') {
      filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedJobs,
      pagination: {
        current: pageNum,
        pages: Math.ceil(filteredJobs.length / limitNum),
        total: filteredJobs.length,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Job matching error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/matching/job/:jobId
// @desc    Get match score for a specific job
// @access  Private (Candidate only)
router.get('/job/:jobId', protect, authorize('candidate'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const candidateSkills = req.user.skills || [];
    const { score, matchedSkills, missingSkills } = calculateMatchScore(
      candidateSkills,
      job.skills
    );

    res.json({
      success: true,
      data: {
        jobId: job._id,
        matchScore: score,
        matchedSkills,
        missingSkills,
        totalRequiredSkills: job.skills.length,
        candidateSkillsCount: candidateSkills.length
      }
    });
  } catch (error) {
    console.error('Job match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/matching/candidates/:jobId
// @desc    Get candidates matched to a job with scores (for recruiters)
// @access  Private (Recruiter only)
router.get('/candidates/:jobId', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { minScore = 0, page = 1, limit = 10 } = req.query;

    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Verify recruiter owns this job
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get all candidates with skills
    const candidates = await User.find({ 
      role: 'candidate',
      skills: { $exists: true, $ne: [] }
    })
    .select('name email skills experience location resume')
    .lean();

    // Calculate match scores
    const matchedCandidates = candidates.map(candidate => {
      const { score, matchedSkills, missingSkills } = calculateMatchScore(
        candidate.skills,
        job.skills
      );
      return {
        ...candidate,
        matchScore: score,
        matchedSkills,
        missingSkills
      };
    });

    // Filter and sort
    const filteredCandidates = matchedCandidates
      .filter(c => c.matchScore >= parseInt(minScore))
      .sort((a, b) => b.matchScore - a.matchScore);

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedCandidates,
      pagination: {
        current: pageNum,
        pages: Math.ceil(filteredCandidates.length / limitNum),
        total: filteredCandidates.length,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Candidate matching error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/matching/recommendations
// @desc    Get job recommendations based on skills and preferences
// @access  Private (Candidate only)
router.get('/recommendations', protect, authorize('candidate'), async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const candidateSkills = req.user.skills || [];
    const candidateLocation = req.user.location;

    if (candidateSkills.length === 0) {
      return res.json({
        success: true,
        message: 'Add skills to get recommendations',
        data: []
      });
    }

    // Get open jobs
    const jobs = await Job.find({ status: 'open' })
      .populate('recruiter', 'name company')
      .lean();

    // Calculate match scores with location bonus
    const scoredJobs = jobs.map(job => {
      const { score, matchedSkills } = calculateMatchScore(candidateSkills, job.skills);
      
      // Add location bonus (10% if matches)
      let finalScore = score;
      if (candidateLocation && job.location && 
          job.location.toLowerCase().includes(candidateLocation.toLowerCase())) {
        finalScore = Math.min(100, score + 10);
      }

      return {
        ...job,
        matchScore: finalScore,
        matchedSkills
      };
    });

    // Get top recommendations
    const recommendations = scoredJobs
      .filter(job => job.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
