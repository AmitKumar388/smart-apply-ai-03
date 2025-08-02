import React, { useState } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { User, Camera } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <div>
      <DashboardHeader 
        title="Profile" 
        subtitle="Manage your personal information and preferences"
      />
      
      <div className="p-8">
        <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm max-w-2xl">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Camera className="w-4 h-4" />
                    <span>Change Photo</span>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    defaultValue={user?.user_metadata?.full_name || ''} 
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={user?.email || ''} 
                    className="bg-secondary/50 border-border/50"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+1 (555) 123-4567"
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="San Francisco, CA"
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Software Engineer"
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    placeholder="Current Company"
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveProfile} className="bg-gradient-primary text-primary-foreground">
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;