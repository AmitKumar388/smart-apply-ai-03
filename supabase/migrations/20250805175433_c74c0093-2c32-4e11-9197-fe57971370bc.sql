
ALTER TABLE public.interview_questions 
ADD COLUMN IF NOT EXISTS user_answer text,
ADD COLUMN IF NOT EXISTS ai_suggestion text;

UPDATE public.interview_questions 
SET user_answer = star_answer 
WHERE user_answer IS NULL AND star_answer IS NOT NULL;