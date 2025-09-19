import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { CareerDetailModal } from './CareerDetailModal';

interface CareerMatch {
  id: string;
  title: string;
  description: string;
  compatibilityScore: number;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  skills: Array<{
    name: string;
    level: string;
  }>;
  industry: string;
  locations: string[];
}

export function CareerMatches() {
  const [selectedCareer, setSelectedCareer] = useState<CareerMatch | null>(null);
  
  const { data: matches, isLoading } = useQuery({
    queryKey: ['/api/match'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Career Matches</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-4 p-4 border border-border rounded-lg">
              <div className="w-12 h-12 bg-muted rounded-lg animate-pulse"></div>
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

  const getCareerIcon = (title: string) => {
    if (title.toLowerCase().includes('developer') || title.toLowerCase().includes('software')) {
      return 'fas fa-laptop-code';
    }
    if (title.toLowerCase().includes('data') || title.toLowerCase().includes('analyst')) {
      return 'fas fa-chart-bar';
    }
    if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('ml')) {
      return 'fas fa-robot';
    }
    return 'fas fa-briefcase';
  };

  const formatSalary = (salaryRange: CareerMatch['salaryRange']) => {
    return `₹${salaryRange.min}-${salaryRange.max} LPA`;
  };

  return (
    <>
      <div className="bg-card p-6 rounded-xl border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Career Matches</h2>
          <Button variant="ghost" className="text-primary hover:underline font-medium" data-testid="button-view-all-matches">
            View All
          </Button>
        </div>
        
        <div className="space-y-4">
          {matches?.slice(0, 3).map((match: CareerMatch) => (
            <div
              key={match.id}
              onClick={() => setSelectedCareer(match)}
              className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
              data-testid={`career-match-${match.id}`}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <i className={`${getCareerIcon(match.title)} text-primary`}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{match.title}</h3>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-chart-2">
                      {Math.round(match.compatibilityScore)}%
                    </span>
                    <span className="text-sm text-muted-foreground">match</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {match.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {match.skills.slice(0, 3).map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-primary/10 text-primary"
                      >
                        {skill.name}
                      </Badge>
                    ))}
                    {match.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{match.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatSalary(match.salaryRange)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {!matches?.length && (
            <div className="text-center py-8">
              <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
              <h3 className="font-semibold mb-2">No career matches yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete your profile to get personalized career recommendations
              </p>
              <Button>Complete Profile</Button>
            </div>
          )}
        </div>
      </div>
      
      {selectedCareer && (
        <CareerDetailModal
          career={selectedCareer}
          isOpen={!!selectedCareer}
          onClose={() => setSelectedCareer(null)}
        />
      )}
    </>
  );
}
