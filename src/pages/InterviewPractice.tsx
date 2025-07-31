import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Lightbulb, Clock, User, Trash2, RotateCcw } from 'lucide-react';

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

interface InterviewQuestion {
  id: string;
  question: string;
  job_title: string;
  company_name?: string;
  star_answer?: string;
  created_at: string;
}

export const InterviewPractice = () => {
  const [jobRole, setJobRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [starAnswer, setStarAnswer] = useState('');
  const [isProTipsVisible, setIsProTipsVisible] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchQuestions();
    }
  }, [user]);

  const fetchQuestions = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching questions:', error);
    } else {
      setQuestions(data || []);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!jobRole.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a job role.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Import the question generation logic
      const { getQuestionsForRole } = await import('@/data/interviewQuestions');
      const questionTemplates = getQuestionsForRole(jobRole.trim());
      
      // Create question objects with user data
      const questionsToSave = questionTemplates.map((template) => ({
        user_id: user!.id,
        question: template.question,
        category: template.category,
        job_title: jobRole.trim(),
        company_name: companyName.trim() || null,
      }));

      const { error } = await supabase
        .from('interview_questions')
        .insert(questionsToSave);

      if (error) throw error;

      toast({
        title: "Questions generated!",
        description: `Generated ${questionTemplates.length} interview questions for ${jobRole}.`,
      });
      
      await fetchQuestions();
      setJobRole('');
      setCompanyName('');
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAnswer = async () => {
    if (!selectedQuestionId || !starAnswer.trim()) return;

    try {
      const { error } = await supabase
        .from('interview_questions')
        .update({ star_answer: starAnswer.trim() })
        .eq('id', selectedQuestionId);

      if (error) throw error;

      toast({
        title: "Answer saved!",
        description: "Your STAR answer has been saved.",
      });
      
      await fetchQuestions();
      setSelectedQuestionId(null);
      setStarAnswer('');
    } catch (error) {
      console.error('Error saving answer:', error);
      toast({
        title: "Save failed",
        description: "Failed to save answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('interview_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Question deleted",
        description: "Interview question removed.",
      });
      
      await fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  return (
    <div>
      <DashboardHeader 
        title="Interview Practice" 
        subtitle="Practice with curated questions using the STAR method"
      />
      
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Start Practice Session */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Generate Questions</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter the job details to get relevant interview questions
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Job Role *
                    </label>
                    <Input
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      placeholder="e.g., Software Engineer, Product Manager"
                      className="bg-secondary/50 border-border/50 text-foreground"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Company (Optional)
                    </label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g., Google, Microsoft, Startup"
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

          {/* Pro Tips - Compact Design */}
          {isProTipsVisible && (
            <div className="lg:col-span-1">
              <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProTipsVisible(false)}
                  className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-orange-400" />
                    <h3 className="text-sm font-semibold text-foreground">Pro Tips</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {interviewTips.map((tip, index) => (
                      <div key={index} className="border border-border/30 rounded-md p-2">
                        <h4 className="text-xs font-medium text-foreground mb-1">{tip.title}</h4>
                        <p className="text-xs text-muted-foreground leading-tight">{tip.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {!isProTipsVisible && (
            <div className="lg:col-span-1">
              <Button
                variant="outline"
                onClick={() => setIsProTipsVisible(true)}
                className="w-full h-12 border-border/50 text-muted-foreground hover:text-foreground"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Show Pro Tips
              </Button>
            </div>
          )}
        </div>

        {/* Generated Questions */}
        <div className="mt-8 space-y-6">
          {questions.length > 0 ? (
            questions.map((question) => (
              <Card key={question.id} className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {question.company_name || 'General'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.job_title}
                        </Badge>
                      </div>
                      <p className="text-foreground text-sm leading-relaxed">{question.question}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-muted-foreground hover:text-destructive ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {question.star_answer && (
                    <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                      <h4 className="text-sm font-medium text-foreground mb-2">Your STAR Answer:</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{question.star_answer}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQuestionId(question.id);
                        setStarAnswer(question.star_answer || '');
                      }}
                      className="text-xs"
                    >
                      {question.star_answer ? 'Edit Answer' : 'Add STAR Answer'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
              <div className="p-6">
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Questions Generated Yet</h3>
                  <p className="text-muted-foreground">
                    Enter a job role above to start generating interview questions.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* STAR Answer Modal */}
        {selectedQuestionId && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-gradient-card border-border/50 shadow-glow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Write Your STAR Answer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Structure your answer using: <strong>Situation</strong>, <strong>Task</strong>, <strong>Action</strong>, <strong>Result</strong>
                </p>
                <textarea
                  value={starAnswer}
                  onChange={(e) => setStarAnswer(e.target.value)}
                  placeholder="Situation: Describe the context...&#10;Task: Explain what needed to be done...&#10;Action: Detail the steps you took...&#10;Result: Share the outcome..."
                  className="w-full h-48 p-3 bg-secondary/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground resize-none"
                />
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedQuestionId(null);
                      setStarAnswer('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAnswer}
                    className="bg-gradient-primary text-primary-foreground"
                  >
                    Save Answer
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPractice;