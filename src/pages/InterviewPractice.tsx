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
import { MessageSquare, Mic, MicOff, Volume2, VolumeX, Save, Play, Pause } from 'lucide-react';

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
  user_answer?: string;
  ai_suggestion?: string;
  created_at: string;
}

interface QASession {
  questionId: string;
  userAnswer: string;
  aiSuggestion: string;
}

export const InterviewPractice = () => {
  const [jobRole, setJobRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'list' | 'qa'>('list');
  const [qaSessions, setQaSessions] = useState<QASession[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const voice = useVoice();

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
      setQuestions(
        (data || []).map((q) => ({
          ...q,
          company_name: q.company_name === null ? undefined : q.company_name,
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
      
      // Create question objects with user data
      const questionsToSave = questionTemplates.map((template) => ({
        user_id: user!.id,
        question: template.question,
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

  const handleSaveSession = async () => {
    if (!questions[currentQuestionIndex] || (!userAnswer.trim() && !aiSuggestion)) return;

    try {
      const { error } = await supabase
        .from('interview_questions')
        .update({ 
          user_answer: userAnswer.trim(),
          ai_suggestion: aiSuggestion 
        } as any)
        .eq('id', questions[currentQuestionIndex].id);

      if (error) throw error;

      // Update local state
      const newSession: QASession = {
        questionId: questions[currentQuestionIndex].id,
        userAnswer: userAnswer.trim(),
        aiSuggestion
      };
      
      setQaSessions(prev => [...prev, newSession]);
      
      toast({
        title: "Session saved!",
        description: "Your answer and AI suggestion have been saved.",
      });
      
      // Move to next question
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setUserAnswer('');
        setAiSuggestion('');
      }
      
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Save failed",
        description: "Failed to save session. Please try again.",
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

  const startPracticeSession = () => {
    if (questions.length === 0) {
      toast({
        title: "No questions",
        description: "Please generate questions first.",
        variant: "destructive",
      });
      return;
    }
    setPracticeMode('qa');
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setAiSuggestion('');
  };

  if (practiceMode === 'qa') {
    return (
      <div>
        <DashboardHeader 
          title="Interview Practice Session" 
          subtitle={`Question ${currentQuestionIndex + 1} of ${questions.length}`}
        />
        
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress */}
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
                      onClick={() => setPracticeMode('list')}
                    >
                      Back to List
                    </Button>
                  </div>
                </div>
                <p className="text-foreground text-lg leading-relaxed">
                  {questions[currentQuestionIndex]?.question}
                </p>
              </div>
            </Card>

            {/* Answer Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <p className="text-sm text-red-500 mt-2">🔴 Recording... Click mic again to stop</p>
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
                      {isGeneratingAnswer ? 'Generating...' : 'Get Suggestion'}
                    </Button>
                  </div>
                  {aiSuggestion ? (
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                        {aiSuggestion}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => voice.textToSpeech(aiSuggestion)}
                        className="mt-2"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Listen
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Click "Get Suggestion" to see an AI-generated answer example.
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(prev => prev - 1);
                    setUserAnswer('');
                    setAiSuggestion('');
                  }
                }}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <Button
                onClick={handleSaveSession}
                disabled={!userAnswer.trim() && !aiSuggestion}
                className="bg-gradient-primary text-primary-foreground"
              >
                <Save className="w-4 h-4 mr-2" />
                Save & Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader 
        title="Interview Practice" 
        subtitle="Generate questions and practice with AI-powered suggestions"
      />
      
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generate Questions */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Generate Questions</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter job details to get AI-generated interview questions
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

            {/* Start Practice Button */}
            {questions.length > 0 && (
              <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm mt-6">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Practice?</h3>
                      <p className="text-sm text-muted-foreground">
                        Start practicing with {questions.length} generated questions
                      </p>
                    </div>
                    <Button 
                      onClick={startPracticeSession}
                      className="bg-gradient-primary text-primary-foreground"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Practice
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Questions Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Generated Questions</h3>
                {questions.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {questions.map((question, index) => (
                      <div key={question.id} className="border border-border/30 rounded-md p-2">
                        <p className="text-xs text-muted-foreground leading-tight">
                          {index + 1}. {question.question.substring(0, 60)}...
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No questions generated yet. Enter a job role to get started.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPractice;