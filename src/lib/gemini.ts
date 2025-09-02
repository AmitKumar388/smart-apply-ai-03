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
  const { data, error } = await supabase.functions.invoke('optimize-resume', {
    body: { resumeContent, jobDescription }
  });

  if (error) {
    console.error('Error optimizing resume:', error);
    throw new Error('Failed to optimize resume');
  }

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