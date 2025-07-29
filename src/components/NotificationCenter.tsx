import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Resume Optimized',
    message: 'Your resume for Software Engineer position has been optimized with 85% match score.',
    type: 'success',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: '2',
    title: 'Interview Questions Generated',
    message: '5 new interview questions generated for Product Manager role.',
    type: 'info',
    timestamp: '1 day ago',
    read: false
  },
  {
    id: '3',
    title: 'Application Reminder',
    message: 'Follow up on your application to Google - it has been 1 week.',
    type: 'warning',
    timestamp: '3 days ago',
    read: true
  }
];

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-md bg-gradient-card border-border/50 shadow-glow backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg border ${
                    notification.read ? 'bg-secondary/30' : 'bg-primary/5 border-primary/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      {getIcon(notification.type)}
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteNotification(notification.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};