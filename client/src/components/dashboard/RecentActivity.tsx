import { useQuery } from '@tanstack/react-query';

interface Activity {
  id: string;
  type: 'completion' | 'upload' | 'achievement' | 'roadmap_start';
  title: string;
  timestamp: string;
}

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/profile/activity'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completion':
        return 'bg-primary';
      case 'upload':
        return 'bg-chart-2';
      case 'achievement':
        return 'bg-accent';
      case 'roadmap_start':
        return 'bg-muted';
      default:
        return 'bg-muted';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border">
        <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-muted rounded-full mt-2 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded animate-pulse"></div>
                <div className="h-2 bg-muted rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
      
      <div className="space-y-4">
        {activities?.slice(0, 4).map((activity: Activity) => (
          <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
            <div className={`w-2 h-2 ${getActivityIcon(activity.type)} rounded-full mt-2`}></div>
            <div className="flex-1">
              <p className="text-sm">{activity.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
          </div>
        )) || (
          <div className="text-center py-4">
            <i className="fas fa-clock text-3xl text-muted-foreground mb-3"></i>
            <p className="text-sm text-muted-foreground">
              No recent activity yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
