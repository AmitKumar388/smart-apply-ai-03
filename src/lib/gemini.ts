import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "AIzaSyB-fN_WzPtqZr_A4wS4dV6OcQOiJ4cZvOc";

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateInterviewQuestions = async (jobRole: string, companyName?: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Generate 5 relevant interview questions for a ${jobRole} position${companyName ? ` at ${companyName}` : ''}. 
  Include a mix of:
  - Technical questions (2)
  - Behavioral questions (2) 
  - Situational questions (1)
  
  Return only the questions, one per line, without numbering or bullets.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return text.split('\n').filter(q => q.trim()).map(question => ({
    question: question.trim(),
    category: 'general'
  }));
};

export const optimizeResume = async (resumeContent: string, jobDescription: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Based on this job description: "${jobDescription}"
  
  Optimize this resume: "${resumeContent}"
  
  Please provide:
  1. An optimized version of the resume that better matches the job requirements
  2. Key improvements made
  3. Match score (0-100)
  4. Relevant keywords found
  
  Format your response as:
  OPTIMIZED_RESUME:
  [optimized resume content here]
  
  IMPROVEMENTS:
  [list of improvements]
  
  MATCH_SCORE:
  [score]
  
  KEYWORDS:
  [comma separated keywords]`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  const sections = text.split(/(?:OPTIMIZED_RESUME:|IMPROVEMENTS:|MATCH_SCORE:|KEYWORDS:)/);
  
  return {
    optimizedResume: sections[1]?.trim() || text,
    improvements: sections[2]?.trim() || 'General optimization applied',
    matchScore: parseInt(sections[3]?.trim() || '85'),
    keywords: sections[4]?.trim().split(',').map(k => k.trim()).filter(k => k) || ['relevant', 'skills', 'experience']
  };
};

export const generateAnswer = async (question: string, context?: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Generate a professional answer to this interview question using the STAR method (Situation, Task, Action, Result):
  
  Question: "${question}"
  ${context ? `Context: ${context}` : ''}
  
  Provide a well-structured answer that demonstrates competency and professionalism.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};