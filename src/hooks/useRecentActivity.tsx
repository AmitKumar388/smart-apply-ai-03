import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ActivityItem {
  id: string;
  type: 'resume_optimization' | 'interview_questions' | 'job_application';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export const useRecentActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRecentActivity = async () => {
      try {
        const [optimizations, questions, applications] = await Promise.all([
          supabase
            .from('resume_optimizations')
            .select('id, match_score, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
          
          supabase
            .from('interview_questions')
            .select('id, job_title, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
            
          supabase
            .from('job_applications')
            .select('id, company_name, job_title, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        const allActivities: ActivityItem[] = [];

        // Add optimizations
        optimizations.data?.forEach(opt => {
          allActivities.push({
            id: opt.id,
            type: 'resume_optimization',
            title: 'Resume Optimized',
            description: `Match score: ${opt.match_score}%`,
            timestamp: opt.created_at,
            icon: 'FileText'
          });
        });

        // Add interview questions
        questions.data?.forEach(q => {
          allActivities.push({
            id: q.id,
            type: 'interview_questions', 
            title: 'Interview Questions Generated',
            description: `For ${q.job_title} position`,
            timestamp: q.created_at,
            icon: 'MessageSquare'
          });
        });

        // Add applications
        applications.data?.forEach(app => {
          allActivities.push({
            id: app.id,
            type: 'job_application',
            title: 'Application Tracked',
            description: `${app.job_title} at ${app.company_name}`,
            timestamp: app.created_at,
            icon: 'BarChart3'
          });
        });

        // Sort by timestamp and take most recent
        allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(allActivities.slice(0, 5));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        setLoading(false);
      }
    };

    fetchRecentActivity();

    // Set up real-time subscriptions for activity updates
    const subscriptions = [
      supabase
        .channel('activity_updates')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'resume_optimizations' }, 
          () => fetchRecentActivity()
        )
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'interview_questions' }, 
          () => fetchRecentActivity()
        )
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'job_applications' }, 
          () => fetchRecentActivity()
        )
        .subscribe()
    ];

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [user]);

  return { activities, loading };
};