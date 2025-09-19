import { Dashboard } from '@/components/dashboard/Dashboard';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLocation } from 'wouter';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/auth');
    }
  }, [user, loading, setLocation]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

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
              <button className="text-foreground font-medium bg-transparent border-none cursor-pointer" onClick={() => setLocation('/dashboard')}>Dashboard</button>
              <button className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer" onClick={() => setLocation('/careers')}>Career Match</button>
              <button className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer" onClick={() => setLocation('/roadmap')}>Roadmap</button>
              <button className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer" onClick={() => setLocation('/profile')}>Profile</button>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="relative" ref={menuRef}>
                <button
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-label="Account menu"
                >
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
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-left"
                      onClick={() => {
                        setMenuOpen(false);
                        setLocation('/profile/edit');
                      }}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-left"
                      onClick={async () => {
                        setMenuOpen(false);
                        // Sign out and go to landing page
                        const { logOut } = await import('@/services/firebase');
                        await logOut();
                        setLocation('/');
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <Dashboard />
    </>
  );
}
