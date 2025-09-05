import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hnljsidibomwkriacecn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhubGpzaWRpYm9td2tyaWFjZWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTAxMzYsImV4cCI6MjA2OTI2NjEzNn0.MHNGIcfyzpqxyZxNKXbpevt-mSH0qKvvJXudiVUClhg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
