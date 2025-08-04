import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Bell, Moon, Sun, Globe, Shield, Zap } from 'lucide-react';

export const Preferences = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: true,
      jobAlerts: true,
      weeklyDigest: false,
    },
    appearance: {
      theme: 'system',
      language: 'en',
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      allowAnalytics: true,
    },
    performance: {
      autoSave: true,
      enableAnimations: true,
    }
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Here you would save preferences
      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <DashboardHeader 
        title="Preferences" 
        subtitle="Customize your experience and notification settings"
      />
      
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {/* Notifications */}
        <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get real-time updates</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.notifications.push}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="job-alerts">Job Alerts</Label>
                  <p className="text-sm text-muted-foreground">Notifications for new job opportunities</p>
                </div>
                <Switch
                  id="job-alerts"
                  checked={preferences.notifications.jobAlerts}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, jobAlerts: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-digest">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Summary of your weekly activity</p>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={preferences.notifications.weeklyDigest}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, weeklyDigest: checked }
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Sun className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <Select
                  value={preferences.appearance.theme}
                  onValueChange={(value) => 
                    setPreferences(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, theme: value }
                    }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Language</Label>
                  <p className="text-sm text-muted-foreground">Select your language</p>
                </div>
                <Select
                  value={preferences.appearance.language}
                  onValueChange={(value) => 
                    setPreferences(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, language: value }
                    }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Privacy</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">Who can see your profile</p>
                </div>
                <Select
                  value={preferences.privacy.profileVisibility}
                  onValueChange={(value) => 
                    setPreferences(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, profileVisibility: value }
                    }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="contacts">Contacts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-email">Show Email</Label>
                  <p className="text-sm text-muted-foreground">Display email on public profile</p>
                </div>
                <Switch
                  id="show-email"
                  checked={preferences.privacy.showEmail}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, showEmail: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics">Allow Analytics</Label>
                  <p className="text-sm text-muted-foreground">Help improve our service</p>
                </div>
                <Switch
                  id="analytics"
                  checked={preferences.privacy.allowAnalytics}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, allowAnalytics: checked }
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Performance */}
        <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Performance</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Auto Save</Label>
                  <p className="text-sm text-muted-foreground">Automatically save your work</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={preferences.performance.autoSave}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      performance: { ...prev.performance, autoSave: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="animations">Enable Animations</Label>
                  <p className="text-sm text-muted-foreground">Show smooth transitions</p>
                </div>
                <Switch
                  id="animations"
                  checked={preferences.performance.enableAnimations}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      performance: { ...prev.performance, enableAnimations: checked }
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Preferences;