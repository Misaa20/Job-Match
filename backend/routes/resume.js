const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const { extractSkillsFromResume } = require('../utils/skillExtractor');

// @route   POST /api/resume/upload
// @desc    Upload resume PDF and extract skills
// @access  Private (Candidate only)
router.post('/upload', protect, authorize('candidate'), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const filePath = req.file.path;
    
    // Extract skills from resume
    let extractedSkills = [];
    try {
      const result = await extractSkillsFromResume(filePath);
      extractedSkills = result.skills;
    } catch (parseError) {
      console.error('Skill extraction error:', parseError);
      // Continue even if parsing fails - we still save the file
    }

    // Delete old resume if exists
    if (req.user.resume && req.user.resume.path) {
      const oldPath = path.join(__dirname, '..', req.user.resume.path);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update user with new resume info
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        resume: {
          filename: req.file.originalname,
          path: `/uploads/resumes/${req.file.filename}`,
          uploadedAt: new Date()
        },
        // Merge extracted skills with existing skills
        $addToSet: { skills: { $each: extractedSkills } }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resume: user.resume,
        extractedSkills,
        allSkills: user.skills
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// @route   GET /api/resume/skills/extract
// @desc    Re-extract skills from uploaded resume
// @access  Private (Candidate only)
router.get('/skills/extract', protect, authorize('candidate'), async (req, res) => {
  try {
    if (!req.user.resume || !req.user.resume.path) {
      return res.status(400).json({ message: 'No resume uploaded' });
    }

    const filePath = path.join(__dirname, '..', req.user.resume.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }

    const result = await extractSkillsFromResume(filePath);

    res.json({
      success: true,
      data: {
        extractedSkills: result.skills,
        currentSkills: req.user.skills
      }
    });
  } catch (error) {
    console.error('Skill extraction error:', error);
    res.status(500).json({ message: 'Failed to extract skills' });
  }
});

// @route   DELETE /api/resume
// @desc    Delete uploaded resume
// @access  Private (Candidate only)
router.delete('/', protect, authorize('candidate'), async (req, res) => {
  try {
    if (!req.user.resume || !req.user.resume.path) {
      return res.status(400).json({ message: 'No resume to delete' });
    }

    const filePath = path.join(__dirname, '..', req.user.resume.path);
    
    // Delete file if exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update user
    await User.findByIdAndUpdate(req.user.id, {
      $unset: { resume: 1 }
    });

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Resume delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resume/download/:userId
// @desc    Download candidate resume (for recruiters viewing applications)
// @access  Private (Recruiter only)
router.get('/download/:userId', protect, authorize('recruiter'), async (req, res) => {
  try {
    const candidate = await User.findById(req.params.userId);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    if (!candidate.resume || !candidate.resume.path) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const filePath = path.join(__dirname, '..', candidate.resume.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }

    res.download(filePath, candidate.resume.filename);
  } catch (error) {
    console.error('Resume download error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
