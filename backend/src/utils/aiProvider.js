const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');
dotenv.config();

const AI_PROVIDER = (process.env.AI_PROVIDER || 'mock').toLowerCase();

let openai = null;
let anthropic = null;

if (AI_PROVIDER === 'openai') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
    timeout: 15000,
    maxRetries: 1,
  });
} else if (AI_PROVIDER === 'anthropic') {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
    timeout: 15000,
    maxRetries: 1,
  });
}

// Reusable Fallbacks for Demo Resilience
const FALLBACKS = {
  analysis: {
    extractedSkills: ["JavaScript", "HTML", "CSS", "React"],
    missingSkills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "REST APIs", "Git", "Docker", "AWS", "System Design"],
    weakSkills: ["TypeScript"],
    reasoningTrace: "Claude/GPT identified strong frontend foundations but gaps in backend infrastructure. (Fallback Data)"
  },
  roadmap: {
    roadmap: [
      { step: 1, skill: "Node.js", phase: "Basics", weekStart: 1, weekEnd: 2, description: "Fundamentals of Node.js.", whyLearnThis: "Backbone of stack.", resource: "Node Docs", dependencies: [] },
      { step: 2, skill: "Express", phase: "Basics", weekStart: 2, weekEnd: 3, description: "Master APIs.", whyLearnThis: "Essential for servers.", resource: "Express Guide", dependencies: ["Node.js"] }
    ],
    reasoningTrace: "Prioritized backend fundamentals. (Fallback Data)"
  },
  questions: {
    questions: [
      { id: 1, question: "How would you handle server-side rendering in a full stack project?", targetSkill: "Node.js", difficulty: "medium" },
      { id: 2, question: "Explain the difference between SQL and NoSQL databases.", targetSkill: "PostgreSQL", difficulty: "medium" }
    ]
  },
  evaluation: {
    overallScore: 78, technicalScore: 82, communicationScore: 74, confidenceScore: 79, problemSolvingScore: 75, roleFitScore: 80,
    strengths: ["Clear functional knowledge"],
    improvements: ["Gaps in backend architecture"],
    questionFeedback: []
  }
};

async function getAIResponse(prompt, type) {
  try {
    if (AI_PROVIDER === 'openai' && process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return JSON.parse(response.choices[0].message.content);
    } 
    
    if (AI_PROVIDER === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        temperature: 0,
        messages: [{ role: "user", content: prompt }]
      });
      return JSON.parse(msg.content[0].text);
    }

    throw new Error("No valid AI provider or API key found.");
  } catch (error) {
    console.error(`AI Provider (${AI_PROVIDER}) Error:`, error.message);
    if (AI_PROVIDER !== 'mock') {
      throw error;
    }
    return FALLBACKS[type];
  }
}

async function extractSkills(resumeText, roleText, requiredSkills) {
  const prompt = `You are a skills analyst. Extract skills from this resume and compare with requirements for ${roleText}.
    Return JSON only: { "extractedSkills": [], "missingSkills": [], "weakSkills": [], "reasoningTrace": "" }
    Required: ${requiredSkills.join(', ')}
    Resume: ${resumeText.substring(0, 4000)}`;
  return getAIResponse(prompt, 'analysis');
}

async function generateRoadmap(role, missingSkills, weakSkills, extractedSkills) {
  const prompt = `Generate a learning roadmap for ${role}. Skills: ${[...missingSkills, ...weakSkills].join(', ')}.
    Return JSON: { "roadmap": [ { "step": 1, "skill": "", "phase": "", "weekStart": 1, "weekEnd": 2, "description": "", "whyLearnThis": "", "resource": "", "dependencies": [] } ] }`;
  return getAIResponse(prompt, 'roadmap');
}

async function generateQuestions(role, missingSkills, weakSkills, extractedSkills) {
  const prompt = `Generate 5 interview questions for ${role}. Gaps: ${[...missingSkills, ...weakSkills].join(', ')}.
    Return JSON: { "questions": [ { "id": 1, "question": "", "targetSkill": "", "difficulty": "medium" } ] }`;
  return getAIResponse(prompt, 'questions');
}

async function evaluateAnswers(role, questions, answers) {
  const prompt = `Evaluate these interview answers for ${role}.
    Questions: ${JSON.stringify(questions)}
    Answers: ${JSON.stringify(answers)}
    Return JSON: { "overallScore": 0, "strengths": [], "improvements": [], "questionFeedback": [] }`;
  return getAIResponse(prompt, 'evaluation');
}

async function extractLinkedInSkills(profileText) {
  const prompt = `Extract all technical skills from this LinkedIn profile text.
    Profile text: ${profileText}
    Return JSON ONLY: { "extractedSkills": [], "experienceLevel": "junior|mid|senior", "inferredRole": "" }`;
  const type = 'analysis'; // Reuse analysis fallback
  return getAIResponse(prompt, type);
}

module.exports = { extractSkills, generateRoadmap, generateQuestions, evaluateAnswers, extractLinkedInSkills };
