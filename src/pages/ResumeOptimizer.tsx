import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Zap, AlertCircle, Download, Copy, Check, Star } from 'lucide-react';

interface ResumeOptimization {
  id: string;
  optimized_resume: string;
  cover_letter: string;
  match_score: number;
  matched_keywords: string[];
  created_at: string;
}

export const ResumeOptimizer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeContent, setResumeContent] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<ResumeOptimization | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSelectedFile(file);
        // Simulate file content extraction
        setResumeContent(`Sample resume content for ${file.name}. In a real implementation, this would be extracted from the actual file.`);
        toast({
          title: "File uploaded",
          description: `${file.name} has been selected for optimization.`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or DOCX file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleOptimize = async () => {
    if (!selectedFile || !jobDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please upload a resume and provide a job description.",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    
    try {
      // Import the optimization logic
      const { 
        generateOptimizedResume, 
        generateCoverLetter, 
        analyzeKeywords, 
        calculateMatchScore 
      } = await import('@/data/resumeOptimizations');
      
      const optimizedResume = generateOptimizedResume(resumeContent, jobDescription);
      const coverLetter = generateCoverLetter('Professional', 'Target Company');
      const keywords = analyzeKeywords(jobDescription);
      const matchScore = calculateMatchScore();
      
      const optimizationData = {
        user_id: user!.id,
        job_description: jobDescription.trim(),
        optimized_resume: optimizedResume,
        cover_letter: coverLetter,
        match_score: matchScore,
        matched_keywords: keywords,
      };

      const { data, error } = await supabase
        .from('resume_optimizations')
        .insert(optimizationData)
        .select()
        .single();

      if (error) throw error;

      setOptimization(data);
      toast({
        title: "Resume optimized!",
        description: `Match score: ${matchScore}%. Your resume has been optimized!`,
      });
    } catch (error) {
      console.error('Error optimizing resume:', error);
      toast({
        title: "Optimization failed",
        description: "Failed to optimize resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard.",
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <DashboardHeader 
        title="Resume Optimizer" 
        subtitle="Upload your resume and job description to get optimization suggestions"
      />
      
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Resume */}
          <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Upload className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Upload Resume</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Upload your current resume (.pdf or .docx)
              </p>
              
              <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-foreground mb-2">
                    {selectedFile ? selectedFile.name : 'Click to upload resume'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF or DOCX up to 10MB
                  </p>
                </label>
              </div>
            </div>
          </Card>

          {/* Match Score */}
          {optimization && (
            <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-foreground">Match Score</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-foreground">Resume-Job Match</span>
                      <span className="text-sm font-semibold text-foreground">{optimization.match_score}%</span>
                    </div>
                    <Progress value={optimization.match_score} className="h-2" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Key Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {optimization.matched_keywords.slice(0, 6).map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {optimization.matched_keywords.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{optimization.matched_keywords.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {!optimization && (
            <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-foreground">AI Optimization</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload your resume and provide a job description to see optimization results, match score, and keyword analysis.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Job Description */}
        <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm mt-8">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Job Description</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Paste the job description you're applying for
            </p>
            
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="min-h-[200px] bg-secondary/50 border-border/50 text-foreground resize-none"
            />
            
            <div className="mt-6">
              <Button 
                onClick={handleOptimize}
                disabled={isOptimizing || !selectedFile || !jobDescription.trim()}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isOptimizing ? 'Optimizing...' : 'Optimize Resume'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Optimization Results */}
        {optimization && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Optimized Resume */}
            <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Optimized Resume</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(optimization.optimized_resume, 'resume')}
                    className="h-8"
                  >
                    {copiedField === 'resume' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <div className="bg-secondary/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                    {optimization.optimized_resume}
                  </pre>
                </div>
              </div>
            </Card>

            {/* Cover Letter */}
            <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Generated Cover Letter</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(optimization.cover_letter, 'cover')}
                    className="h-8"
                  >
                    {copiedField === 'cover' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <div className="bg-secondary/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                    {optimization.cover_letter}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeOptimizer;