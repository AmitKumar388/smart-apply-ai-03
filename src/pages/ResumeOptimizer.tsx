import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Zap, AlertCircle } from 'lucide-react';

export const ResumeOptimizer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSelectedFile(file);
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
    
    // Simulate AI optimization
    setTimeout(() => {
      toast({
        title: "Resume optimized!",
        description: "Your resume has been tailored for this job posting.",
      });
      setIsOptimizing(false);
    }, 3000);
  };

  return (
    <div>
      <DashboardHeader 
        title="Resume Optimizer" 
        subtitle="Upload your resume and job description to get AI-powered optimization"
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

          {/* Optimization Info */}
          <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-foreground">Upload your resume and job description to see AI optimization results</h3>
              </div>
            </div>
          </Card>
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
                {isOptimizing ? 'Optimizing with AI...' : 'Optimize with AI'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResumeOptimizer;