import { Dashboard } from '@/components/dashboard/Dashboard';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/auth');
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-graduation-cap text-primary text-lg"></i>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-primary-foreground text-sm"></i>
                </div>
                <span className="text-xl font-semibold">AI Career Advisor</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#dashboard" className="text-foreground font-medium">Dashboard</a>
              <a href="#careers" className="text-muted-foreground hover:text-foreground transition-colors">Career Match</a>
              <a href="#roadmap" className="text-muted-foreground hover:text-foreground transition-colors">Roadmap</a>
              <a href="#profile" className="text-muted-foreground hover:text-foreground transition-colors">Profile</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary transition-colors">
                  <img 
                    src={user.photoURL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80"} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium hidden sm:inline">
                    {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                  <i className="fas fa-chevron-down text-xs text-muted-foreground"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <Dashboard />
    </>
  );
}
