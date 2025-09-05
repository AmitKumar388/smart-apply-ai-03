import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

// Add Deno type declaration for TypeScript
// @ts-ignore
declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobRole, companyName } = await req.json();

    // Get environment variables
    const geminiApiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!geminiApiKey) {
      throw new Error("Google Gemini API key not configured");
    }

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(supabaseUrl!, supabaseKey!, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const prompt = `You are an expert interview coach. Generate 5 challenging but realistic interview questions for a ${jobRole} position${
      companyName ? ` at ${companyName}` : ""
    }. Each question should be structured to allow for STAR method responses (Situation, Task, Action, Result). Return the questions as a JSON array of objects with 'question' and 'category' fields. Categories should be: 'behavioral', 'technical', 'situational', or 'leadership'.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiRes.ok) {
      throw new Error(`Google Gemini API Error: ${geminiRes.statusText}`);
    }

    const aiData = await geminiRes.json();
    let questions;

    try {
      const content = aiData.candidates[0].content.parts[0].text;
      questions = JSON.parse(content);
    } catch (_) {
      // Fallback questions if JSON parsing fails
      questions = [
        {
          question:
            "Tell me about a time you faced a significant challenge and how you overcame it.",
          category: "behavioral",
        },
        {
          question:
            "Describe a situation with a difficult team member. What did you do?",
          category: "behavioral",
        },
        {
          question: "Explain a time you had to learn a new technology quickly.",
          category: "technical",
        },
        {
          question: "Describe a project you led. What was your strategy?",
          category: "leadership",
        },
        {
          question:
            "Tell me about a decision you made with incomplete information.",
          category: "situational",
        },
      ];
    }

    const questionsToSave = questions.map((q: any) => ({
      user_id: user.id,
      question: q.question,
      category: q.category,
      job_title: jobRole,
      company_name: companyName || null,
    }));

    const { error: dbError } = await supabase
      .from("interview_questions")
      .insert(questionsToSave);

    if (dbError) {
      console.error("DB Error:", dbError);
      throw new Error("Failed to save questions");
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in generate-interview-questions function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
