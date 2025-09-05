import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function safeExtractText(apiData: any): string {
  try {
    return apiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch {
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobRole, companyName } = await req.json();
    const geminiApiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!geminiApiKey) throw new Error("Gemini API key missing");

    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const prompt = `Generate 5 interview questions for a ${jobRole} ${companyName ? `at ${companyName}` : ""}. 
    Return JSON array with objects {question, category}. Categories: behavioral, technical, situational, leadership.`;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const aiData = await aiRes.json();
    let questions;
    try {
      const text = safeExtractText(aiData);
      const cleaned = text.replace(/```json|```/g, "").trim();
      questions = JSON.parse(cleaned);
    } catch {
      questions = [
        { question: "Tell me about a time you solved a difficult problem.", category: "behavioral" },
        { question: "Describe a challenging technical issue you faced.", category: "technical" },
        { question: "Explain a decision you made under pressure.", category: "situational" },
        { question: "Describe a project you led and its outcome.", category: "leadership" },
        { question: "How do you keep up with new industry trends?", category: "technical" },
      ];
    }

    // Save to DB
    const toSave = questions.map((q: any) => ({
      user_id: user.id,
      question: q.question,
      category: q.category,
      job_title: jobRole,
      company_name: companyName || null,
    }));

    const { error: dbError } = await supabase.from("interview_questions").insert(toSave);
    if (dbError) throw dbError;

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in generate-interview-questions:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
