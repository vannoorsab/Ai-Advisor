import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    category: string;
  }>;
  industry: string;
  locations: string[];
  growthPath?: Array<{
    level: string;
    title: string;
    salaryRange: { min: number; max: number };
    experience: string;
  }>;
  requirements?: string[];
}

interface CareerDetailModalProps {
  career: CareerMatch;
  isOpen: boolean;
  onClose: () => void;
}

export function CareerDetailModal({ career, isOpen, onClose }: CareerDetailModalProps) {
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

  const formatSalary = (salaryRange: { min: number; max: number }) => {
    return `₹${salaryRange.min}-${salaryRange.max} LPA`;
  };

  const getSkillsByCategory = (category: string) => {
    return career.skills.filter(skill => skill.category === category);
  };

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert':
        return 'text-chart-2';
      case 'advanced':
        return 'text-accent';
      case 'intermediate':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="career-detail-modal">
        <DialogHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <i className={`${getCareerIcon(career.title)} text-primary text-xl`}></i>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">{career.title}</DialogTitle>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-semibold text-chart-2">
                    {Math.round(career.compatibilityScore)}%
                  </span>
                  <span className="text-muted-foreground">compatibility</span>
                </div>
                <span className="text-lg font-semibold">
                  {formatSalary(career.salaryRange)}
                </span>
                {career.locations.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <i className="fas fa-map-marker-alt text-muted-foreground"></i>
                    <span className="text-muted-foreground">
                      {career.locations.slice(0, 2).join(', ')}
                      {career.locations.length > 2 && ` +${career.locations.length - 2} more`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-4">Role Overview</h4>
            <p className="text-muted-foreground mb-6">
              {career.description}
            </p>
            
            {career.requirements && (
              <>
                <h4 className="font-semibold mb-4">Key Responsibilities</h4>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  {career.requirements.slice(0, 4).map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <i className="fas fa-check text-chart-2 mt-1 text-sm"></i>
                      <span className="text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Required Skills</h4>
            <div className="space-y-4 mb-6">
              {['technical', 'soft', 'domain'].map(category => {
                const categorySkills = getSkillsByCategory(category);
                if (categorySkills.length === 0) return null;
                
                return (
                  <div key={category} className="p-3 border border-border rounded-lg">
                    <h5 className="font-medium text-sm mb-2 capitalize">{category} Skills</h5>
                    <div className="space-y-1">
                      {categorySkills.slice(0, 4).map((skill, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{skill.name}</span>
                          <span className={getSkillLevelColor(skill.level)}>
                            {skill.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {career.growthPath && (
              <>
                <h4 className="font-semibold mb-4">Career Growth</h4>
                <div className="space-y-2 text-sm">
                  {career.growthPath.map((path, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        path.title === career.title 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-secondary/30'
                      }`}
                    >
                      <span className={path.title === career.title ? 'font-medium' : ''}>
                        {path.title}
                      </span>
                      <span className={path.title === career.title ? 'font-medium' : 'text-muted-foreground'}>
                        {formatSalary(path.salaryRange)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-border">
          <Button variant="outline" onClick={onClose} data-testid="button-close-modal">
            Close
          </Button>
          <Button data-testid="button-start-roadmap">
            Start Roadmap
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
