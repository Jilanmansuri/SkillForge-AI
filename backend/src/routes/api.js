const express = require('express');
const multer = require('multer');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { extractSkills, generateRoadmap } = require('../utils/aiProvider');
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
        try {
          const data = await pdfParse(req.file.buffer);
          if (!data || !data.text) {
            throw new Error("PDF parse result was empty.");
          }
          resumeText = data.text;
          console.log(`Successfully extracted ${resumeText.length} characters from PDF.`);
        } catch (pdfError) {
          console.error("PDF Parsing Error:", pdfError.message);
          return res.status(422).json({ error: 'Could not extract text from PDF. It might be an image-only PDF or corrupt.' });
        }
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
  const { resumeText, role } = req.body;
  
  if (!resumeText || !role) {
    return res.status(400).json({ error: 'resumeText and role are required' });
  }

  const roleSkills = skillsData[role] || skillsData['Full Stack Developer'];
  const requiredSkills = roleSkills.required;

  try {
    const analysis = await extractSkills(resumeText, role, requiredSkills);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

// /api/generate-roadmap
router.post('/generate-roadmap', async (req, res) => {
  const { role, missingSkills, weakSkills, extractedSkills, gaps } = req.body;
  const resolvedMissingSkills = missingSkills || gaps?.missingSkills || [];
  const resolvedWeakSkills = weakSkills || gaps?.weakSkills || [];

  try {
    const roadmapData = await generateRoadmap(
      role,
      resolvedMissingSkills,
      resolvedWeakSkills,
      extractedSkills || []
    );
    res.json(roadmapData);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Roadmap generation failed' });
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
