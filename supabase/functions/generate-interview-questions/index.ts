import "https://deno.land/x/xhr@0.1.0/mod.ts";
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

const openAIApiKey = process.env.OPENAI_API_KEY!;
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const app = express();
app.use(express.json());

app.options('*', (req, res) => {
  res.set(corsHeaders);
  res.sendStatus(204);
});

app.post('/', async (req, res) => {
  try {
    const { jobRole, companyName } = req.body;

    // Get user from auth header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const prompt = `Generate interview questions for: ${jobRole}${companyName ? ` at ${companyName}` : ""}`;

    const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content:
              "You are an expert interview coach. Generate 5 challenging but realistic interview questions for the given job role/company. Each question should be structured to allow for STAR method responses (Situation, Task, Action, Result). Return the questions as a JSON array of objects with 'question' and 'category' fields. Categories should be: 'behavioral', 'technical', 'situational', or 'leadership'.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!openAiRes.ok) {
      throw new Error(`OpenAI API Error: ${openAiRes.statusText}`);
    }

    const aiData = await openAiRes.json();
    let questions;

    try {
      questions = JSON.parse(aiData.choices[0].message.content);
    } catch (_) {
      // Fallback questions if JSON parsing fails
      questions = [
        {
          question: "Tell me about a time you faced a significant challenge and how you overcame it.",
          category: "behavioral",
        },
        {
          question: "Describe a situation with a difficult team member. What did you do?",
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
          question: "Tell me about a decision you made with incomplete information.",
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

    res.set(corsHeaders);
    res.status(200).json({ questions });
  } catch (error: any) {
    console.error('Error in generate-interview-questions function:', error);
    res.set(corsHeaders);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
