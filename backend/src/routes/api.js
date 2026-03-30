const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { extractSkills, generateRoadmap } = require('../utils/anthropic');
const skillsData = require('../../data/skills.json');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// /api/upload-resume
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file && !req.body.resumeText) {
      return res.status(400).json({ error: 'No file or text provided' });
    }

    let resumeText = req.body.resumeText || '';

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      
      if (ext === '.pdf') {
        const data = await pdfParse(req.file.buffer);
        resumeText = data.text;
      } else if (ext === '.docx') {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        resumeText = result.value;
      }
    }

    res.json({
      resumeText: resumeText.substring(0, 5000), // Limit text size
      extractedPreview: resumeText.substring(0, 200) + '...',
      experienceLevel: 'Unknown',
      inferredRole: 'Unknown'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
});

// /api/analyze
router.post('/analyze', async (req, res) => {
  const { resumeText, role, jobDescriptionText } = req.body;
  
  if (!resumeText || !role) {
    return res.status(400).json({ error: 'resumeText and role are required' });
  }

  const roleSkills = skillsData[role] || skillsData['Full Stack Developer'];
  const requiredSkills = roleSkills.required;

  try {
    const analysis = await extractSkills(resumeText, role, requiredSkills);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// /api/generate-roadmap
router.post('/generate-roadmap', async (req, res) => {
  const { role, missingSkills, weakSkills, extractedSkills } = req.body;

  try {
    const roadmapData = await generateRoadmap(role, missingSkills || [], weakSkills || [], extractedSkills || []);
    res.json(roadmapData);
  } catch (error) {
    res.status(500).json({ error: 'Roadmap generation failed' });
  }
});

// /api/samples/resumes
router.get('/samples/resumes', (req, res) => {
  try {
    const data = require('../../data/sample_resumes.json');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Sample resumes not found. Ensure dataset files are in backend/data/' });
  }
});

// /api/samples/job-descriptions
router.get('/samples/job-descriptions', (req, res) => {
  try {
    const data = require('../../data/sample_job_descriptions.json');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Sample job descriptions not found. Ensure dataset files are in backend/data/' });
  }
});

module.exports = router;
