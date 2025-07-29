import "https://deno.land/x/xhr@0.1.0/mod.ts";
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

const openAIApiKey = process.env.OPENAI_API_KEY!;
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Generating questions for:', { jobRole, companyName, userId: user.id });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert interview coach. Generate 5 challenging but realistic interview questions for the given job role/company. Each question should be structured to allow for STAR method responses (Situation, Task, Action, Result). Return the questions as a JSON array of objects with "question" and "category" fields. Categories should be: "behavioral", "technical", "situational", or "leadership".`
          },
          {
            role: 'user',
            content: `Generate interview questions for: ${jobRole}${companyName ? ` at ${companyName}` : ''}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const questionsText = data.choices[0].message.content;

    let questions;
    try {
      questions = JSON.parse(questionsText);
    } catch {
      // Fallback if JSON parsing fails
      questions = [
        { question: "Tell me about a time when you faced a significant challenge at work and how you overcame it.", category: "behavioral" },
        { question: "Describe a situation where you had to work with a difficult team member. How did you handle it?", category: "behavioral" },
        { question: "Give me an example of a time when you had to learn a new technology or skill quickly.", category: "technical" },
        { question: "Tell me about a project you led from start to finish. What was your approach?", category: "leadership" },
        { question: "Describe a time when you had to make a decision with limited information.", category: "situational" }
      ];
    }

    // Save questions to database
    const questionsToSave = questions.map((q: any) => ({
      user_id: user.id,
      question: q.question,
      job_title: jobRole,
      company_name: companyName || null,
    }));

    const { error: dbError } = await supabase
      .from('interview_questions')
      .insert(questionsToSave);

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save questions');
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