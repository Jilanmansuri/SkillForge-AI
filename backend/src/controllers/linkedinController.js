const axios = require('axios')
const { extractLinkedInSkills } = require('../utils/aiProvider')

exports.extractFromLinkedIn = async (req, res) => {
  const { url } = req.body

  if (!url || !url.includes('linkedin.com/in/')) {
    return res.status(400).json({ 
      error: 'Please provide a valid LinkedIn profile URL' 
    })
  }

  try {
    // Step 1: Fetch LinkedIn page HTML
    let profileText = ''
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 8000
      })
      
      // Strip HTML tags — keep only readable text
      profileText = response.data
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .substring(0, 4000)
        
    } catch (fetchError) {
      console.log('LinkedIn fetch blocked, using demo mode')
      profileText = `
        Software Developer with experience in JavaScript, React, Node.js, 
        Python, SQL, Git, REST APIs, TypeScript, CSS, HTML, 
        AWS basics, Docker, MongoDB, Express.js
        Skills: Problem Solving, Team Collaboration, Agile
      `
    }

    // Step 2: Use unified AI provider to extract skills
    const parsed = await extractLinkedInSkills(profileText);

    return res.json({
      extractedSkills: parsed.extractedSkills || [],
      experienceLevel: parsed.experienceLevel || 'mid',
      inferredRole: parsed.inferredRole || 'Software Developer',
      profileText: profileText.substring(0, 2000),
      demo: profileText.includes('Demo profile') || !profileText.includes('LinkedIn')
    })

  } catch (error) {
    console.error('LinkedIn extract error:', error)
    
    // Fallback for demo
    return res.json({
      extractedSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'REST APIs'],
      experienceLevel: 'mid',
      inferredRole: 'Full Stack Developer',
      profileText: 'Demo profile — Extraction failed',
      demo: true
    })
  }
}
