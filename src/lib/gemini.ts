import { supabase } from "../integrations/supabase/client";

// ✅ Calls Edge Function for interview questions
export const generateInterviewQuestions = async (
  jobRole: string,
  companyName?: string,
) => {
  const { data, error } = await supabase.functions.invoke(
    "generate-interview-questions",
    { body: { jobRole, companyName } },
  );

  if (error) {
    console.error("Error generating interview questions:", error);
    throw new Error("Failed to generate interview questions");
  }

  return data.questions;
};

// ✅ Calls Edge Function for resume optimization
export const optimizeResume = async (
  resumeContent: string,
  jobDescription: string,
) => {
  const { data, error } = await supabase.functions.invoke("optimize-resume", {
    body: { resumeContent, jobDescription },
  });

  if (error) {
    console.error("Error optimizing resume:", error);
    throw new Error("Failed to optimize resume");
  }

  return data.optimization;
};

// ✅ Simple placeholder for STAR answers (optional)
export const generateAnswer = async (question: string, context?: string) => {
  return `This is a sample STAR method answer for the question: "${question}".

Situation: Describe a situation.
Task: Explain what needed to be done.
Action: Detail what you did.
Result: Share the outcome.

${context ? `Extra context: ${context}` : ""}`;
};
