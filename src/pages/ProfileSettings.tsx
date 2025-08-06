import React from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';
import { Settings, Bell, Shield, Eye, Trash2 } from 'lucide-react';

export const ProfileSettings = () => {
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your profile settings have been updated successfully.",
    });
  };

  return (
    <div>
      <DashboardHeader 
        title="Profile Settings" 
        subtitle="Manage your account preferences and privacy settings"
      />
      
      <div className="p-4 lg:p-8">
        <div className="max-w-4xl space-y-6">
          {/* Notification Settings */}
          <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
            <div className="p-4 lg:p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Notification Settings</h3>
              </div>
              
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1 pr-4">
                    <Label className="text-sm lg:text-base">Email Notifications</Label>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      Receive notifications about new features and updates
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1 pr-4">
                    <Label className="text-sm lg:text-base">Interview Reminders</Label>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      Get reminded about upcoming interview sessions
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1 pr-4">
                    <Label className="text-sm lg:text-base">Resume Optimization Alerts</Label>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      Notifications when optimization results are ready
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
            <div className="p-4 lg:p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Privacy & Security</h3>
              </div>
              
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1 pr-4">
                    <Label className="text-sm lg:text-base">Profile Visibility</Label>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      Make your profile visible to recruiters
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1 pr-4">
                    <Label className="text-sm lg:text-base">Data Analytics</Label>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      Allow anonymous usage analytics to improve the service
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </Card>

          {/* Account Management */}
          <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
            <div className="p-4 lg:p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Account Management</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border border-border/50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-foreground text-sm lg:text-base">Export Data</h4>
                      <p className="text-xs lg:text-sm text-muted-foreground">
                        Download all your profile data and interview history
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      Export
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-foreground text-sm lg:text-base">Delete Account</h4>
                      <p className="text-xs lg:text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button onClick={handleSaveSettings} className="bg-gradient-primary text-primary-foreground w-full sm:w-auto">
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;