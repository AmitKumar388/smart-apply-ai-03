import { supabase } from '@/integrations/supabase/client';

export const generateInterviewQuestions = async (jobRole: string, companyName?: string) => {
  const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
    body: { jobRole, companyName }
  });

  if (error) {
    console.error('Error generating interview questions:', error);
    throw new Error('Failed to generate interview questions');
  }

  return data.questions;
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
  
  // Parse the response
  const sections = text.split(/(?:OPTIMIZED_RESUME:|IMPROVEMENTS:|MATCH_SCORE:|KEYWORDS:)/);
  
  return {
    optimizedResume: data.optimizedResume,
    improvements: 'Resume optimized based on job requirements',
    matchScore: data.matchScore,
    keywords: data.keywords
  };
};

export const generateAnswer = async (question: string, context?: string) => {
  // For now, return a placeholder since this isn't used in edge functions yet
  return `This is a sample STAR method answer for the question: "${question}". 
  
Situation: Describe a specific situation where you demonstrated relevant skills.
Task: Explain what you needed to accomplish.
Action: Detail the specific actions you took.
Result: Share the positive outcome of your actions.

${context ? `Additional context: ${context}` : ''}`;
};