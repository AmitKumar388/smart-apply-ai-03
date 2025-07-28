import React from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  MessageSquare, 
  BarChart3, 
  User,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const statCards = [
  { title: 'Applications Tracked', value: '0', subtitle: 'Get started', color: 'text-blue-400' },
  { title: 'Interviews Practiced', value: '0', subtitle: 'Start practicing', color: 'text-green-400' },
  { title: 'Resumes Optimized', value: '0', subtitle: 'Upload resume', color: 'text-purple-400' },
  { title: 'Match Score Avg', value: '0%', subtitle: 'No data yet', color: 'text-orange-400' },
];

const quickActions = [
  {
    title: 'Optimize Resume',
    description: 'Upload your resume and get AI-powered improvements',
    icon: FileText,
    href: '/dashboard/resume-optimizer',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Practice Interview',
    description: 'Get STAR-method questions for your target role',
    icon: MessageSquare,
    href: '/dashboard/interview-practice',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Track Application',
    description: 'Add and monitor your job applications',
    icon: BarChart3,
    href: '/dashboard/application-tracker',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'Build Portfolio',
    description: 'Auto-generate your professional portfolio',
    icon: User,
    href: '/dashboard/portfolio',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
];

export const Dashboard = () => {
  return (
    <div>
      <DashboardHeader 
        title="Welcome back!" 
        subtitle="Let's make your job search smarter with AI"
      />
      
      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${action.bgColor}`}>
                        <action.icon className={`w-6 h-6 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {action.description}
                        </p>
                        <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            </div>
            <div className="text-center py-12">
              <p className="text-muted-foreground">No recent activity yet. Start by optimizing your resume or practicing interviews!</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;