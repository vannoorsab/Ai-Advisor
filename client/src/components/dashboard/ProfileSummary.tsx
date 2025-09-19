import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLocation } from 'wouter';

export function ProfileSummary() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/profile'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border">
        <h2 className="text-xl font-semibold mb-6">Profile Overview</h2>
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-muted animate-pulse"></div>
          <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
          <div className="h-3 bg-muted rounded animate-pulse w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  const getProfilePicture = () => {
    if (profile?.profilePicture) return profile.profilePicture;
    if (user?.photoURL) return user.photoURL;
    return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80";
  };

  const sampleProfile = {
    name: "Amit Sharma",
    title: "Aspiring Data Scientist",
    skills: [
      { name: "Python" },
      { name: "Machine Learning" },
      { name: "SQL" },
      { name: "Statistics" }
    ],
    completionPercentage: 60,
    resumeUrl: "",
  };

  const displayProfile = profile || sampleProfile;

  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <h2 className="text-xl font-semibold mb-6">Profile Overview</h2>
      
      <div className="text-center mb-6">
        <img 
          src={getProfilePicture()}
          alt="Profile picture" 
          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
          data-testid="profile-picture"
        />
        <h3 className="font-semibold" data-testid="profile-name">
          {displayProfile?.name || user?.displayName || 'User'}
        </h3>
        <p className="text-sm text-muted-foreground" data-testid="profile-title">
          {displayProfile?.title || 'Professional'}
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Top Skills</h4>
          <div className="flex flex-wrap gap-2">
            {displayProfile?.skills?.slice(0, 4).map((skill: any, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-primary/10 text-primary"
                data-testid={`skill-${index}`}
              >
                {skill.name}
              </Badge>
            )) || (
              <p className="text-xs text-muted-foreground">No skills added yet</p>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Profile Completion</h4>
          <div className="w-full bg-secondary rounded-full h-2 mb-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${displayProfile?.completionPercentage || 0}%` }}
              data-testid="completion-progress"
            ></div>
          </div>
          <p className="text-xs text-muted-foreground">
            {displayProfile?.completionPercentage || 0}% complete
            {displayProfile?.completionPercentage < 100 && ' • Add more details to improve matches'}
          </p>
        </div>
        
        {displayProfile?.resumeUrl && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Resume</span>
              <i className="fas fa-check-circle text-chart-2" data-testid="resume-status"></i>
            </div>
            <p className="text-xs text-muted-foreground">Resume uploaded and processed</p>
          </div>
        )}
      </div>
      
      <Button 
        variant="secondary" 
        className="w-full mt-6"
        data-testid="button-edit-profile"
        onClick={() => setLocation('/profile/edit')}
      >
        Edit Profile
      </Button>
    </div>
  );
}
