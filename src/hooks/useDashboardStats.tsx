import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  applicationsTracked: number;
  interviewsPracticed: number;
  resumesOptimized: number;
  averageMatchScore: number;
  loading: boolean;
}

export const useDashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    applicationsTracked: 0,
    interviewsPracticed: 0,
    resumesOptimized: 0,
    averageMatchScore: 0,
    loading: true
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Fetch applications
        const { data: applications } = await supabase
          .from('job_applications')
          .select('id')
          .eq('user_id', user.id);

        // Fetch interview questions  
        const { data: questions } = await supabase
          .from('interview_questions')
          .select('id')
          .eq('user_id', user.id);

        // Fetch resume optimizations
        const { data: optimizations } = await supabase
          .from('resume_optimizations')
          .select('match_score')
          .eq('user_id', user.id);

        const avgScore = optimizations?.length 
          ? Math.round(optimizations.reduce((acc, curr) => acc + (curr.match_score || 0), 0) / optimizations.length)
          : 0;

        setStats({
          applicationsTracked: applications?.length || 0,
          interviewsPracticed: questions?.length || 0,
          resumesOptimized: optimizations?.length || 0,
          averageMatchScore: avgScore,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();

    // Set up real-time subscriptions
    const subscriptions = [
      supabase
        .channel('job_applications_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'job_applications' }, 
          () => fetchStats()
        )
        .subscribe(),
      
      supabase
        .channel('interview_questions_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'interview_questions' }, 
          () => fetchStats()
        )
        .subscribe(),
        
      supabase
        .channel('resume_optimizations_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'resume_optimizations' }, 
          () => fetchStats()
        )
        .subscribe()
    ];

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [user]);

  return stats;
};