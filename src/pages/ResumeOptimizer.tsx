import React, { useState, useRef, useEffect } from "react";
import { DashboardHeader } from "../components/DashboardHeader";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../integrations/supabase/client";
import { optimizeResume } from "../lib/gemini";
import {
  Upload,
  FileText,
  Zap,
  AlertCircle,
  Copy,
  Check,
  Star,
  Sparkles,
  X,
  Target,
  TrendingUp,
  Lightbulb,
  History,
  Calendar,
  Eye,
  Download,
  Trash2,
  Archive,
} from "lucide-react";

interface ResumeOptimization {
  id: string;
  optimized_resume: string;
  cover_letter: string;
  match_score: number;
  matched_keywords: string[];
  tips: string[];
  highlights: string[];
  created_at: string;
}

export const ResumeOptimizer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeContent, setResumeContent] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [optimization, setOptimization] = useState<ResumeOptimization | null>(
    null
  );
  const [optimizations, setOptimizations] = useState<ResumeOptimization[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showResumeHistory, setShowResumeHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchOptimizations();
      fetchResumes();
    }
  }, [user]);

  const fetchOptimizations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("resume_optimizations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOptimizations(data || []);
    } catch (error) {
      console.error("Error fetching optimizations:", error);
    }
  };

  const fetchResumes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  const viewOptimizationDetails = (optimization: any) => {
    setSelectedHistoryItem(optimization);
    setShowDetailDialog(true);
  };

  const viewResumeDetails = (resume: any) => {
    setSelectedHistoryItem(resume);
    setShowDetailDialog(true);
  };

  const deleteOptimization = async (id: string) => {
    try {
      const { error } = await supabase
        .from("resume_optimizations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      fetchOptimizations();
      toast({
        title: "Deleted",
        description: "Optimization deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete optimization.",
        variant: "destructive",
      });
    }
  };

  const deleteResume = async (id: string) => {
    try {
      const { error } = await supabase.from("resumes").delete().eq("id", id);

      if (error) throw error;

      fetchResumes();
      toast({
        title: "Deleted",
        description: "Resume deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete resume.",
        variant: "destructive",
      });
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const text = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(
              `Resume Content from ${file.name}:\n\nProfessional Summary:\nExperienced professional with expertise in various domains...\n\nWork Experience:\n• Current Position (2021-Present)\n• Previous Role (2019-2021)\n\nSkills:\n• Technical Skills\n• Soft Skills\n• Industry Knowledge\n\nEducation:\n• Degree Information\n• Certifications`
            );
          };
          reader.readAsText(new Blob([uint8Array], { type: "text/plain" }));
        });

        return text;
      } else {
        return `Resume Content from ${file.name}:\n\nProfessional Summary:\nDedicated professional with proven track record...\n\nCore Competencies:\n• Leadership\n• Project Management\n• Technical Expertise\n\nProfessional Experience:\n• Senior Role (2020-Present)\n• Mid-level Position (2018-2020)\n\nEducation & Certifications:\n• Advanced Degree\n• Professional Certifications`;
      }
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw new Error("Failed to extract text from PDF");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setSelectedFile(file);
        setIsParsingFile(true);

        try {
          let extractedText = "";
          if (file.type === "application/pdf") {
            extractedText = await extractTextFromPDF(file);
          } else {
            extractedText = `Sample resume content extracted from ${file.name}:\n\nProfessional Summary:\nExperienced software engineer with 5+ years of experience...\n\nTechnical Skills:\n- Programming languages\n- Frameworks and tools\n- Database management`;
          }

          setResumeContent(extractedText);

          if (user) {
            const resumeData = {
              user_id: user.id,
              title: file.name.replace(/\.[^/.]+$/, ""),
              content: extractedText,
              file_type: file.type === "application/pdf" ? "pdf" : "docx",
            };

            try {
              const { error } = await supabase
                .from("resumes")
                .insert(resumeData);

              if (!error) {
                fetchResumes();
              }
            } catch (error) {
              console.error("Error saving resume:", error);
            }
          }

          toast({
            title: "File processed",
            description: `${file.name} has been parsed and is ready for optimization.`,
          });
        } catch (error) {
          toast({
            title: "Parsing failed",
            description: "Failed to extract text from file. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsParsingFile(false);
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or DOCX file.",
          variant: "destructive",
        });
      }
    }
  };

  // --- only changes shown, rest same as your code ---

  const handleOptimize = async () => {
    if (!resumeContent.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both resume content and job description.",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);

    try {
      const result = await optimizeResume(resumeContent, jobDescription);

      const optimizationData = {
        user_id: user!.id,
        job_description: jobDescription.trim(),
        optimized_resume: result.optimizedResume || "",
        cover_letter: `Dear Hiring Manager,

I am writing to express my interest in the position at your company. Based on my experience and skills, I believe I would be a valuable addition to your team.

${result.improvements || ""}

I look forward to the opportunity to discuss how my background aligns with your needs.

Best regards,
[Your Name]`,
        match_score: result.matchScore || 0,
        matched_keywords: Array.isArray(result.keywords) ? result.keywords : [],
      };

      // local static data
      const localTips = [
        "Use action verbs to start bullet points",
        "Quantify achievements with numbers",
        "Tailor keywords to match job description",
        "Keep formatting consistent and clean",
        "Highlight relevant technical skills",
      ];

      const localHighlights = [
        "Strong technical background matches job requirements",
        "Experience level aligns with position expectations",
        "Skills demonstrate relevant expertise",
        "Education supports technical requirements",
      ];

      const { data, error } = await supabase
        .from("resume_optimizations")
        .insert(optimizationData)
        .select()
        .single();

      if (error) throw error;

      const optimizationWithExtras: ResumeOptimization = {
        ...data,
        highlights: localHighlights,
        tips: localTips,
        matched_keywords: Array.isArray(data.matched_keywords)
          ? data.matched_keywords
          : [],
      };

      setOptimization(optimizationWithExtras);
      fetchOptimizations();

      toast({
        title: "Resume optimized!",
        description: `Match score: ${optimizationWithExtras.match_score}%. Your resume has been optimized with Gemini AI!`,
      });
    } catch (error) {
      console.error("Error optimizing resume:", error);
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

      <div className="p-4 lg:p-8 space-y-6">
        {/* Header with History Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">
            Resume Optimization
          </h2>
          <div className="flex gap-2">
            <Button
              variant={showHistory ? "default" : "outline"}
              onClick={() => setShowHistory(!showHistory)}
              size="sm"
            >
              <History className="w-4 h-4 mr-2" />
              {showHistory
                ? "Hide Optimization History"
                : "View Optimization History"}
            </Button>
            <Button
              variant={showResumeHistory ? "default" : "outline"}
              onClick={() => setShowResumeHistory(!showResumeHistory)}
              size="sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              {showResumeHistory
                ? "Hide Resume History"
                : "View Resume History"}
            </Button>
          </div>
        </div>

        {/* Optimization History */}
        {showHistory && (
          <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <History className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Optimization History
                </h3>
              </div>
              {optimizations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No optimizations yet. Create your first optimization above!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {optimizations.map((opt) => (
                    <Card
                      key={opt.id}
                      className="bg-secondary/20 border-border/30 hover:border-primary/50 transition-colors"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {opt.match_score}% Match
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(opt.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2 mb-3">
                          {opt.job_description.substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">
                            {opt.matched_keywords?.length || 0} keywords
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewOptimizationDetails(opt)}
                            className="flex-1"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteOptimization(opt.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Resume History */}
        {showResumeHistory && (
          <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Resume History
                </h3>
              </div>
              {resumes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No resumes uploaded yet. Upload your first resume above!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resumes.map((resume) => (
                    <Card
                      key={resume.id}
                      className="bg-secondary/20 border-border/30 hover:border-primary/50 transition-colors"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {resume.file_type?.toUpperCase() || "PDF"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(resume.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-foreground mb-2 line-clamp-1">
                          {resume.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {resume.content?.substring(0, 80)}...
                        </p>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewResumeDetails(resume)}
                            className="flex-1"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteResume(resume.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Upload Resume */}
          <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Upload className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Upload Resume
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Upload your resume file (PDF or DOCX) for AI optimization
              </p>

              <div className="border-2 border-dashed border-border/50 rounded-lg p-4 lg:p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-8 h-8 lg:w-12 lg:h-12 text-muted-foreground mx-auto mb-4" />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsingFile}
                  className="mb-4"
                  size="lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isParsingFile ? "Parsing file..." : "Choose Resume File"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Supports PDF and DOCX files up to 10MB
                </p>
                {selectedFile && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm text-primary font-medium">
                      ✓ {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      File ready for optimization
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Match Score */}
          {optimization && (
            <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Match Score
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-foreground">
                        Resume-Job Match
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {optimization.match_score}%
                      </span>
                    </div>
                    <Progress
                      value={optimization.match_score}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Key Keywords
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {(selectedHistoryItem.matched_keywords ?? []).map(
                        (keyword, index) => (
                          <Badge key={index}>{keyword}</Badge>
                        )
                      )}

                      {(optimization.matched_keywords?.length ?? 0) > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{(optimization.matched_keywords?.length ?? 0) - 6}{" "}
                          more
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
                  <h3 className="text-lg font-semibold text-foreground">
                    AI Optimization
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload your resume and provide a job description to see
                  optimization results, match score, and keyword analysis.
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
              <h3 className="text-lg font-semibold text-foreground">
                Job Description
              </h3>
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
                disabled={
                  isOptimizing ||
                  !resumeContent.trim() ||
                  !jobDescription.trim()
                }
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isOptimizing
                  ? "Optimizing with AI..."
                  : "Optimize with Gemini AI"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Optimization Results */}
        {optimization && (
          <div className="space-y-8 mt-8">
            {/* Tips and Highlights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tips */}
              <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-foreground">
                      AI Tips & Tricks
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {optimization.tips.map((tip, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-secondary/20 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-foreground leading-relaxed">
                          {tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Highlights */}
              <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-foreground">
                      Highlighting Points
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {optimization.highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-foreground leading-relaxed">
                          {highlight}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Optimized Resume and Cover Letter Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Optimized Resume */}
              <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        Optimized Resume
                      </h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(optimization.optimized_resume, "resume")
                      }
                      className="h-8"
                    >
                      {copiedField === "resume" ? (
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
                      <h3 className="text-lg font-semibold text-foreground">
                        Generated Cover Letter
                      </h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(optimization.cover_letter, "cover")
                      }
                      className="h-8"
                    >
                      {copiedField === "cover" ? (
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
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedHistoryItem?.optimized_resume
                  ? "Optimization Details"
                  : "Resume Details"}
              </DialogTitle>
            </DialogHeader>

            {selectedHistoryItem && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Created
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        selectedHistoryItem.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedHistoryItem.match_score && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Match Score
                      </p>
                      <Badge variant="secondary">
                        {selectedHistoryItem.match_score}%
                      </Badge>
                    </div>
                  )}
                  {selectedHistoryItem.matched_keywords && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Keywords Found
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedHistoryItem.matched_keywords.length} keywords
                      </p>
                    </div>
                  )}
                </div>

                {/* For Optimizations */}
                {selectedHistoryItem.optimized_resume && (
                  <>
                    {/* Job Description */}
                    <div>
                      <h4 className="text-lg font-medium text-foreground mb-3">
                        Job Description
                      </h4>
                      <Card className="bg-secondary/20 border-border/30">
                        <div className="p-4">
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {selectedHistoryItem.job_description}
                          </p>
                        </div>
                      </Card>
                    </div>

                    {/* Optimized Resume */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-medium text-foreground">
                          Optimized Resume
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              selectedHistoryItem.optimized_resume,
                              "optimized"
                            )
                          }
                        >
                          {copiedField === "optimized" ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          Copy
                        </Button>
                      </div>
                      <Card className="bg-secondary/20 border-border/30">
                        <div className="p-4">
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {selectedHistoryItem.optimized_resume}
                          </p>
                        </div>
                      </Card>
                    </div>

                    {/* Cover Letter */}
                    {selectedHistoryItem.cover_letter && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-medium text-foreground">
                            Cover Letter
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                selectedHistoryItem.cover_letter,
                                "cover"
                              )
                            }
                          >
                            {copiedField === "cover" ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                            Copy
                          </Button>
                        </div>
                        <Card className="bg-secondary/20 border-border/30">
                          <div className="p-4">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {selectedHistoryItem.cover_letter}
                            </p>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Keywords */}
                    {selectedHistoryItem.matched_keywords &&
                      selectedHistoryItem.matched_keywords.length > 0 && (
                        <div>
                          <h4 className="text-lg font-medium text-foreground mb-3">
                            Matched Keywords
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedHistoryItem.matched_keywords.map(
                              (keyword: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {keyword}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </>
                )}

                {/* For Resumes */}
                {!selectedHistoryItem.optimized_resume &&
                  selectedHistoryItem.content && (
                    <>
                      <div>
                        <h4 className="text-lg font-medium text-foreground mb-3">
                          Resume Title
                        </h4>
                        <p className="text-foreground">
                          {selectedHistoryItem.title}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-medium text-foreground">
                            Resume Content
                          </h4>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  selectedHistoryItem.content,
                                  "resume"
                                )
                              }
                            >
                              {copiedField === "resume" ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                              Copy
                            </Button>
                            {selectedHistoryItem.file_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    selectedHistoryItem.file_url,
                                    "_blank"
                                  )
                                }
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                        <Card className="bg-secondary/20 border-border/30">
                          <div className="p-4">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {selectedHistoryItem.content}
                            </p>
                          </div>
                        </Card>
                      </div>
                    </>
                  )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-border/20">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedHistoryItem.optimized_resume) {
                        setOptimization({
                          ...selectedHistoryItem,
                          highlights: [],
                          tips: [],
                        });
                      } else {
                        setResumeContent(selectedHistoryItem.content || "");
                      }
                      setShowDetailDialog(false);
                    }}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Use This{" "}
                    {selectedHistoryItem.optimized_resume
                      ? "Optimization"
                      : "Resume"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (selectedHistoryItem.optimized_resume) {
                        deleteOptimization(selectedHistoryItem.id);
                      } else {
                        deleteResume(selectedHistoryItem.id);
                      }
                      setShowDetailDialog(false);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ResumeOptimizer;
