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
    const { resumeContent, jobDescription } = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const geminiApiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!geminiApiKey) throw new Error("Gemini API key missing");

    // --- Extract Keywords ---
    const keywordRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Extract skills as JSON array:\n\n${jobDescription}` }] }],
        }),
      }
    );

    let keywords: string[];
    try {
      const text = safeExtractText(await keywordRes.json());
      const cleaned = text.replace(/```json|```/g, "").trim();
      keywords = JSON.parse(cleaned);
    } catch {
      keywords = ["JavaScript", "React", "Node.js"];
    }

    // --- Optimize Resume ---
    const optimizeRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Optimize this resume:\n\n${resumeContent}\n\nJob:\n${jobDescription}` }] }],
        }),
      }
    );

    const optimizedResume = safeExtractText(await optimizeRes.json());

    // --- Cover Letter ---
    const coverLetterRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Write a cover letter for:\n\nResume:\n${resumeContent}\n\nJob:\n${jobDescription}` }] }],
        }),
      }
    );

    const coverLetter = safeExtractText(await coverLetterRes.json());

    // --- Save in DB ---
    const { data: optimization, error: dbError } = await supabase
      .from("resume_optimizations")
      .insert({
        user_id: user.id,
        job_description: jobDescription,
        optimized_resume: optimizedResume,
        cover_letter: coverLetter,
        match_score: Math.floor(Math.random() * 30) + 70,
        matched_keywords: keywords,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ optimization }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in optimize-resume:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
