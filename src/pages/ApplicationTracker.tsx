import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building, MapPin, Calendar } from 'lucide-react';

interface Application {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedDate: string;
  notes: string;
}

export const ApplicationTracker = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'Applied',
    notes: ''
  });
  const { toast } = useToast();

  const handleAddApplication = () => {
    if (!formData.company || !formData.role) {
      toast({
        title: "Missing information",
        description: "Please fill in company and role.",
        variant: "destructive",
      });
      return;
    }

    const newApplication: Application = {
      id: Date.now().toString(),
      company: formData.company,
      role: formData.role,
      status: formData.status,
      appliedDate: new Date().toLocaleDateString(),
      notes: formData.notes
    };

    setApplications(prev => [newApplication, ...prev]);
    setFormData({ company: '', role: '', status: 'Applied', notes: '' });
    setShowAddForm(false);
    
    toast({
      title: "Application added",
      description: `${formData.role} at ${formData.company} has been added to your tracker.`,
    });
  };

  const statusColors = {
    'Applied': 'bg-blue-500/10 text-blue-400',
    'Interviewing': 'bg-yellow-500/10 text-yellow-400',
    'Rejected': 'bg-red-500/10 text-red-400',
    'Offer': 'bg-green-500/10 text-green-400'
  };

  return (
    <div>
      <DashboardHeader 
        title="Application Tracker" 
        subtitle="Track your job applications and their status"
      />
      
      <div className="p-8">
        {/* Add New Application */}
        <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Add New Application</h3>
              </div>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                variant="outline"
                className="border-border/50 text-foreground hover:bg-secondary/50"
              >
                {showAddForm ? 'Cancel' : 'Add Application'}
              </Button>
            </div>
            
            {showAddForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Company</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                    className="bg-secondary/50 border-border/50 text-foreground"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Role</label>
                  <Input
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Job title"
                    className="bg-secondary/50 border-border/50 text-foreground"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="bg-secondary/50 border-border/50 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Interviewing">Interviewing</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground mb-2 block">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about this application..."
                    className="bg-secondary/50 border-border/50 text-foreground"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Button 
                    onClick={handleAddApplication}
                    className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
                  >
                    Add Application
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Applications List */}
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Building className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">{app.role}</h3>
                      </div>
                      <p className="text-muted-foreground mb-3">{app.company}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Applied: {app.appliedDate}</span>
                        </div>
                      </div>
                      {app.notes && (
                        <p className="text-sm text-muted-foreground">{app.notes}</p>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status as keyof typeof statusColors]}`}>
                      {app.status}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
            <div className="p-12 text-center">
              <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start tracking your job applications to stay organized.
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
              >
                Add Your First Application
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApplicationTracker;