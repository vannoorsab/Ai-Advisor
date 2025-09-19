import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'article' | 'project' | 'certification';
  provider: string;
  rating: number;
  duration: string;
}

export function LearningResources() {
  const { data: resources, isLoading } = useQuery({
    queryKey: ['/api/learning-resources'],
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'course':
        return 'fas fa-play';
      case 'article':
        return 'fas fa-book';
      case 'project':
        return 'fas fa-code';
      case 'certification':
        return 'fas fa-certificate';
      default:
        return 'fas fa-book';
    }
  };

  const getResourceIconColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'text-primary';
      case 'article':
        return 'text-accent';
      case 'project':
        return 'text-chart-2';
      case 'certification':
        return 'text-chart-2';
      default:
        return 'text-primary';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border">
        <h2 className="text-xl font-semibold mb-6">Recommended Learning</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
              <div className="w-10 h-10 bg-muted rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <h2 className="text-xl font-semibold mb-6">Recommended Learning</h2>
      
      <div className="space-y-4">
        {resources?.slice(0, 3).map((resource: LearningResource) => (
          <div 
            key={resource.id}
            className="flex items-start space-x-3 p-3 border border-border rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
            data-testid={`learning-resource-${resource.id}`}
          >
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <i className={`${getResourceIcon(resource.type)} ${getResourceIconColor(resource.type)} text-sm`}></i>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">{resource.title}</h4>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {resource.description}
              </p>
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-chart-2">{resource.rating.toFixed(1)} ★</span>
                </div>
                <span className="text-muted-foreground">{resource.duration}</span>
                <span className="text-muted-foreground">by {resource.provider}</span>
              </div>
            </div>
          </div>
        )) || (
          <div className="text-center py-4">
            <i className="fas fa-book-open text-3xl text-muted-foreground mb-3"></i>
            <p className="text-sm text-muted-foreground">
              Complete your profile to get personalized learning recommendations
            </p>
          </div>
        )}
      </div>
      
      <Button 
        variant="ghost" 
        className="w-full mt-4 text-primary hover:underline font-medium text-sm"
        data-testid="button-view-all-resources"
      >
        View All Recommendations
      </Button>
    </div>
  );
}
