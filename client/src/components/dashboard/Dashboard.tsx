import { useQuery } from '@tanstack/react-query';
import { CareerMatches } from './CareerMatches';
import { RoadmapProgress } from './RoadmapProgress';
import { ProfileSummary } from './ProfileSummary';
import { LearningResources } from './LearningResources';
import { RecentActivity } from './RecentActivity';
import { useAuth } from '@/components/auth/AuthProvider';

export function Dashboard() {
  const { user } = useAuth();
  
  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/profile/stats'],
    enabled: !!user,
  });

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="dashboard-welcome">
            Welcome back, {profile?.name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-muted-foreground">
            Here's your career journey overview and personalized recommendations.
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-xl border border-border" data-testid="stat-career-matches">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Career Matches</p>
                <p className="text-2xl font-bold">{stats?.careerMatches || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-bullseye text-primary"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-xl border border-border" data-testid="stat-roadmap-progress">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Roadmap Progress</p>
                <p className="text-2xl font-bold">{stats?.roadmapProgress || 0}%</p>
              </div>
              <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-route text-chart-2"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-xl border border-border" data-testid="stat-skills-acquired">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Skills Acquired</p>
                <p className="text-2xl font-bold">{stats?.skillsAcquired || 0}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-trophy text-accent"></i>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <CareerMatches />
            <RoadmapProgress />
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-8">
            <ProfileSummary />
            <LearningResources />
            <RecentActivity />
          </div>
        </div>
      </div>
    </main>
  );
}
