
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resumes table
CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_description TEXT,
  status TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied', 'Interviewing', 'Rejected', 'Offer')),
  notes TEXT,
  applied_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interview_questions table
CREATE TABLE public.interview_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company_name TEXT,
  question TEXT NOT NULL,
  star_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resume_optimizations table
CREATE TABLE public.resume_optimizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_description TEXT NOT NULL,
  optimized_resume TEXT,
  cover_letter TEXT,
  match_score INTEGER,
  matched_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_optimizations ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for resumes
CREATE POLICY "Users can view their own resumes" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own resumes" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own resumes" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own resumes" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

-- Create policies for job_applications
CREATE POLICY "Users can view their own applications" ON public.job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own applications" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own applications" ON public.job_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own applications" ON public.job_applications FOR DELETE USING (auth.uid() = user_id);

-- Create policies for interview_questions
CREATE POLICY "Users can view their own interview questions" ON public.interview_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own interview questions" ON public.interview_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interview questions" ON public.interview_questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interview questions" ON public.interview_questions FOR DELETE USING (auth.uid() = user_id);

-- Create policies for resume_optimizations
CREATE POLICY "Users can view their own optimizations" ON public.resume_optimizations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own optimizations" ON public.resume_optimizations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own optimizations" ON public.resume_optimizations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own optimizations" ON public.resume_optimizations FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resume_optimizations_updated_at BEFORE UPDATE ON public.resume_optimizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();