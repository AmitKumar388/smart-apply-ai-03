import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Lightbulb, Clock, User } from 'lucide-react';

const interviewTips = [
  {
    title: 'Take your time',
    description: 'Pause and think before answering',
  },
  {
    title: 'Be specific',
    description: 'Use concrete examples and metrics',
  },
  {
    title: 'Stay positive',
    description: 'Focus on learning and growth',
  },
];

export const InterviewPractice = () => {
  const [jobRole, setJobRole] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateQuestions = async () => {
    if (!jobRole.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a job role or company.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI question generation
    setTimeout(() => {
      toast({
        title: "Questions generated!",
        description: "AI has created STAR-method questions for your practice.",
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div>
      <DashboardHeader 
        title="Interview Practice" 
        subtitle="Practice with AI-generated questions using the STAR method"
      />
      
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Start Practice Session */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Start Practice Session</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter the job role or company to get targeted questions
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Job Role or Company
                    </label>
                    <Input
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      placeholder="e.g., Software Engineer at Google"
                      className="bg-secondary/50 border-border/50 text-foreground"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleGenerateQuestions}
                    disabled={isGenerating}
                    className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
                  >
                    {isGenerating ? 'Generating Questions...' : 'Generate Questions'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Interview Tips */}
          <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-foreground">Interview Tips</h3>
              </div>
              
              <div className="space-y-4">
                {interviewTips.map((tip, index) => (
                  <div key={index} className="border border-border/30 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-foreground mb-1">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground">{tip.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Placeholder for generated questions */}
        <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm mt-8">
          <div className="p-6">
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Practice Session Started</h3>
              <p className="text-muted-foreground">
                Enter a job role above to start generating interview questions.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InterviewPractice;