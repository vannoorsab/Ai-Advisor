import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Milestone {
  id: string;
  title: string;
  description: string;
  skills: string[];
  estimatedTime: string;
  order: number;
  status: 'not_started' | 'in_progress' | 'completed';
  progress?: number;
}

interface RoadmapData {
  id: string;
  title: string;
  description: string;
  milestones: Milestone[];
  totalProgress: number;
}

export function RoadmapProgress() {
  const { data: roadmap, isLoading } = useQuery({
    queryKey: ['/api/roadmap/current'],
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  if (isLoading) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Current Roadmap</h2>
        </div>
        <div className="space-y-6">
          <div className="h-4 bg-muted rounded animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-muted rounded-full mt-2 animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border">
        <div className="text-center py-8">
          <i className="fas fa-route text-4xl text-muted-foreground mb-4"></i>
          <h3 className="font-semibold mb-2">No active roadmap</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start a career roadmap to track your learning progress
          </p>
          <Button data-testid="button-start-roadmap">Start a Roadmap</Button>
        </div>
      </div>
    );
  }

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'w-3 h-3 bg-chart-2 rounded-full mt-2 relative z-10';
      case 'in_progress':
        return 'w-3 h-3 bg-primary rounded-full mt-2 relative z-10';
      default:
        return 'w-3 h-3 bg-muted rounded-full mt-2 relative z-10';
    }
  };

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-chart-2';
      case 'in_progress':
        return 'text-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Current Roadmap: {roadmap.title}</h2>
        <Button variant="ghost" className="text-primary hover:underline font-medium" data-testid="button-view-roadmap-details">
          View Details
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-medium">{Math.round(roadmap.totalProgress)}%</span>
          </div>
          <Progress value={roadmap.totalProgress} className="h-2" />
        </div>

        {/* Roadmap Timeline */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-border"></div>
          <div 
            className="absolute left-6 top-8 w-0.5 bg-primary transition-all duration-500"
            style={{ height: `${(roadmap.totalProgress / 100) * 100}px` }}
          ></div>
          
          {/* Milestones */}
          <div className="space-y-8">
            {roadmap.milestones.slice(0, 4).map((milestone: Milestone, index: number) => (
              <div key={milestone.id} className="flex items-start space-x-4" data-testid={`milestone-${index}`}>
                <div className={getMilestoneIcon(milestone.status)}></div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${getMilestoneColor(milestone.status)}`}>
                    {milestone.title}
                    {milestone.status === 'completed' && ' ✓'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {milestone.description}
                  </p>
                  
                  {milestone.status === 'in_progress' && milestone.progress && (
                    <div className="mb-3">
                      <div className="w-full bg-secondary rounded-full h-2 mb-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${milestone.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Progress:</span>
                        <span className="text-xs font-medium">{milestone.progress}% completed</span>
                      </div>
                    </div>
                  )}
                  
                  {milestone.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {milestone.skills.slice(0, 3).map((skill, skillIndex) => (
                        <Badge
                          key={skillIndex}
                          variant="secondary"
                          className="text-xs bg-primary/10 text-primary"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {milestone.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{milestone.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>
                      <i className="fas fa-clock mr-1"></i>
                      {milestone.estimatedTime}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
