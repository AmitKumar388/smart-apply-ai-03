import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { useVoice } from '../hooks/useVoice';
import { supabase } from '../integrations/supabase/client';
import { generateInterviewQuestions, generateAnswer } from '../lib/gemini';
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Save, 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Target,
  BookOpen
} from 'lucide-react';

interface InterviewQuestion {
  id: string;
  question: string;
  job_title: string;
  company_name?: string;
  user_answer?: string;
  ai_suggestion?: string;
  created_at: string;
}

interface SavedAnswer {
  id: string;
  questionId: string;
  question: string;
  userAnswer: string;
  aiSuggestion: string;
  createdAt: string;
}

export const InterviewPractice = () => {
  const [step, setStep] = useState<'setup' | 'practice' | 'saved'>('setup');
  const [jobRole, setJobRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([]);
  const [showSavedAnswers, setShowSavedAnswers] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const voice = useVoice();

  useEffect(() => {
    if (user) {
      fetchSavedAnswers();
    }
  }, [user]);

  const fetchSavedAnswers = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('user_id', user.id)
      .not('user_answer', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching saved answers:', error);
    } else {
      setSavedAnswers(
        (data || []).map((q) => ({
          id: q.id,
          questionId: q.id,
          question: q.question,
          userAnswer: q.user_answer || '',
          aiSuggestion: q.ai_suggestion || '',
          createdAt: q.created_at,
        }))
      );
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
      const questionTemplates = await generateInterviewQuestions(jobRole.trim(), companyName.trim() || undefined);
      
      const questionsToSave = questionTemplates.map((template) => ({
        user_id: user!.id,
        question: template.question,
        job_title: jobRole.trim(),
        company_name: companyName.trim() || null,
      }));

      const { data, error } = await supabase
        .from('interview_questions')
        .insert(questionsToSave)
        .select();

      if (error) throw error;

      setQuestions(data.map((q) => ({
        ...q,
        company_name: q.company_name === null ? undefined : q.company_name,
      })));

      toast({
        title: "Questions generated!",
        description: `Generated ${questionTemplates.length} interview questions for ${jobRole}.`,
      });
      
      setStep('practice');
      setCurrentQuestionIndex(0);
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

  const handleGenerateAiSuggestion = async () => {
    if (!questions[currentQuestionIndex]) return;
    
    setIsGeneratingAnswer(true);
    try {
      const suggestion = await generateAnswer(questions[currentQuestionIndex].question, jobRole);
      setAiSuggestion(suggestion);
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI suggestion.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  const handleSaveAnswer = async () => {
    if (!questions[currentQuestionIndex] || !userAnswer.trim()) {
      toast({
        title: "No answer to save",
        description: "Please provide an answer before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('interview_questions')
        .update({ 
          user_answer: userAnswer.trim(),
          ai_suggestion: aiSuggestion 
        })
        .eq('id', questions[currentQuestionIndex].id);

      if (error) throw error;

      toast({
        title: "Answer saved!",
        description: "Your answer has been saved successfully.",
      });
      
      await fetchSavedAnswers();
    } catch (error) {
      console.error('Error saving answer:', error);
      toast({
        title: "Save failed",
        description: "Failed to save answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceRecord = async () => {
    if (voice.isRecording) {
      const audioBlob = await voice.stopRecording();
      const transcript = await voice.speechToText(audioBlob);
      setUserAnswer(prev => prev + ' ' + transcript);
    } else {
      voice.startRecording();
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setAiSuggestion('');
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setUserAnswer('');
      setAiSuggestion('');
    }
  };

  const deleteSavedAnswer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('interview_questions')
        .update({ user_answer: null, ai_suggestion: null })
        .eq('id', id);

      if (error) throw error;

      await fetchSavedAnswers();
      toast({
        title: "Answer deleted",
        description: "Saved answer has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting answer:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete answer.",
        variant: "destructive",
      });
    }
  };

  if (step === 'setup') {
    return (
      <div>
        <DashboardHeader 
          title="Interview Practice" 
          subtitle="Generate AI-powered interview questions and practice with voice & text"
        />
        
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            {/* Hero Card */}
            <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm mb-8">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">AI Interview Coach</h2>
                <p className="text-muted-foreground">
                  Get personalized interview questions and practice with AI-powered suggestions
                </p>
              </div>
            </Card>

            {/* Setup Form */}
            <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Setup Your Practice Session</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Job Role *
                    </label>
                    <Input
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
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
                      placeholder="e.g., Google, Microsoft, OpenAI"
                      className="bg-secondary/50 border-border/50 text-foreground"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleGenerateQuestions}
                    disabled={isGenerating || !jobRole.trim()}
                    className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
                    size="lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {isGenerating ? 'Generating Questions...' : 'Start Practice Session'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Saved Answers Button */}
            {savedAnswers.length > 0 && (
              <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm mt-6">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Previous Practice Sessions</h3>
                      <p className="text-xs text-muted-foreground">
                        You have {savedAnswers.length} saved answers
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setStep('saved')}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      View Saved Answers
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'saved') {
    return (
      <div>
        <DashboardHeader 
          title="Saved Practice Answers" 
          subtitle="Review your previous interview practice sessions"
        />
        
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="outline"
                onClick={() => setStep('setup')}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Practice
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowSavedAnswers(!showSavedAnswers)}
              >
                {showSavedAnswers ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showSavedAnswers ? 'Hide Answers' : 'Show Answers'}
              </Button>
            </div>

            <div className="space-y-4">
              {savedAnswers.map((answer) => (
                <Card key={answer.id} className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-semibold text-foreground leading-tight">
                        {answer.question}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSavedAnswer(answer.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {showSavedAnswers && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2">Your Answer:</h4>
                          <div className="bg-secondary/20 rounded-lg p-3">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {answer.userAnswer}
                            </p>
                          </div>
                        </div>
                        
                        {answer.aiSuggestion && (
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-2">AI Suggestion:</h4>
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {answer.aiSuggestion}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-4">
                      Saved on {new Date(answer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
              
              {savedAnswers.length === 0 && (
                <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
                  <div className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No saved answers yet</h3>
                    <p className="text-muted-foreground">
                      Start a practice session to save your answers
                    </p>
                  </div>
                </Card>
              )}

              {/* Edit Answer Modal would go here */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  💡 Review your answers and identify areas for improvement based on AI suggestions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Practice mode
  return (
    <div>
      <DashboardHeader 
        title="Interview Practice Session" 
        subtitle={`Question ${currentQuestionIndex + 1} of ${questions.length}`}
      />
      
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            <div className="w-full bg-secondary/30 rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Interview Question</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => voice.textToSpeech(questions[currentQuestionIndex]?.question || '')}
                    disabled={voice.isPlaying}
                  >
                    {voice.isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep('setup')}
                  >
                    Back to Setup
                  </Button>
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-foreground text-lg leading-relaxed">
                  {questions[currentQuestionIndex]?.question}
                </p>
              </div>
            </div>
          </Card>

          {/* Answer Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* User Answer */}
            <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Your Answer</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVoiceRecord}
                    className={voice.isRecording ? 'bg-red-500/20 border-red-500' : ''}
                  >
                    {voice.isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type or record your answer here..."
                  className="min-h-[200px] bg-secondary/50 border-border/50 text-foreground resize-none"
                />
                {voice.isRecording && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <span className="animate-pulse mr-2">🔴</span>
                    Recording... Click mic to stop
                  </p>
                )}
              </div>
            </Card>

            {/* AI Suggestion */}
            <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">AI Suggestion</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateAiSuggestion}
                    disabled={isGeneratingAnswer}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isGeneratingAnswer ? 'Generating...' : 'Get Suggestion'}
                  </Button>
                </div>
                {aiSuggestion ? (
                  <div className="space-y-3">
                    <div className="bg-secondary/30 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                      <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                        {aiSuggestion}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => voice.textToSpeech(aiSuggestion)}
                      className="w-full"
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Listen to Suggestion
                    </Button>
                  </div>
                ) : (
                  <div className="bg-secondary/20 rounded-lg p-6 text-center">
                    <p className="text-muted-foreground text-sm">
                      Click "Get Suggestion" to see an AI-generated answer example
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Navigation and Actions */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleSaveAnswer}
                disabled={!userAnswer.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Answer
              </Button>
              
              <Button
                onClick={nextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="bg-gradient-primary text-primary-foreground"
              >
                Next Question
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPractice;