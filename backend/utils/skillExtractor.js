const pdfParse = require('pdf-parse');
const fs = require('fs');
const { TECH_SKILLS, normalizeSkill, getSkillsSet } = require('../config/skills');

/**
 * Extract text from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
};

/**
 * Extract skills from text using keyword matching
 * @param {string} text - Text to extract skills from
 * @returns {string[]} - Array of extracted skills
 */
const extractSkillsFromText = (text) => {
  const skillsSet = getSkillsSet();
  const foundSkills = new Set();
  
  // Normalize text for matching
  const normalizedText = text.toLowerCase();
  
  // Check each known skill
  for (const skill of TECH_SKILLS) {
    const normalizedSkill = normalizeSkill(skill);
    
    // Create variations to match
    const variations = [
      skill.toLowerCase(),
      normalizedSkill,
      skill.toLowerCase().replace(/[.-]/g, ' '),
      skill.toLowerCase().replace(/\s+/g, '')
    ];
    
    for (const variation of variations) {
      // Word boundary matching to avoid partial matches
      const regex = new RegExp(`\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(normalizedText)) {
        foundSkills.add(skill.toLowerCase());
        break;
      }
    }
  }
  
  return Array.from(foundSkills);
};

/**
 * Extract skills from a PDF resume
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<{text: string, skills: string[]}>}
 */
const extractSkillsFromResume = async (filePath) => {
  const text = await extractTextFromPDF(filePath);
  const skills = extractSkillsFromText(text);
  
  return {
    text,
    skills
  };
};

/**
 * Calculate match score between candidate skills and job requirements
 * @param {string[]} candidateSkills - Array of candidate's skills
 * @param {string[]} jobSkills - Array of job's required skills
 * @returns {{score: number, matchedSkills: string[], missingSkills: string[]}}
 */
const calculateMatchScore = (candidateSkills, jobSkills) => {
  if (!jobSkills || jobSkills.length === 0) {
    return { score: 0, matchedSkills: [], missingSkills: [] };
  }
  
  const normalizedCandidateSkills = new Set(
    candidateSkills.map(s => normalizeSkill(s))
  );
  const normalizedJobSkills = jobSkills.map(s => normalizeSkill(s));
  
  const matchedSkills = [];
  const missingSkills = [];
  
  for (let i = 0; i < jobSkills.length; i++) {
    if (normalizedCandidateSkills.has(normalizedJobSkills[i])) {
      matchedSkills.push(jobSkills[i]);
    } else {
      missingSkills.push(jobSkills[i]);
    }
  }
  
  // Calculate percentage score
  const score = Math.round((matchedSkills.length / jobSkills.length) * 100);
  
  return {
    score,
    matchedSkills,
    missingSkills
  };
};

module.exports = {
  extractTextFromPDF,
  extractSkillsFromText,
  extractSkillsFromResume,
  calculateMatchScore
};
