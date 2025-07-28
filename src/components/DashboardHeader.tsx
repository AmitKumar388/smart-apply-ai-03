import React from 'react';
import { Bell, Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-background border-b border-border/50 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-muted-foreground rounded"></div>
            <span className="text-sm text-foreground font-medium">{title}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
            <User className="w-5 h-5" />
            <span className="ml-2 text-sm">{user?.email?.split('@')[0] || 'User'}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="text-foreground hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {subtitle && (
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
      )}
    </header>
  );
};