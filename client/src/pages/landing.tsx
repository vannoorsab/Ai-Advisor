import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
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
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" data-testid="button-signin">
                Sign In
              </Button>
              <Button data-testid="button-get-started">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-chart-2 text-primary-foreground py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Discover Your Perfect Career Path with AI
              </h1>
              <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl">
                Get personalized career recommendations, skill-based matching, and structured roadmaps tailored for the Indian job market.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-card text-foreground hover:bg-secondary"
                  data-testid="button-start-assessment"
                >
                  Start Free Assessment
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  data-testid="button-view-sample"
                >
                  View Sample Roadmap
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
                alt="Diverse professionals collaborating" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose AI Career Advisor?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive career guidance tailored for the Indian market
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-brain text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered Matching</h3>
              <p className="text-muted-foreground">
                Our advanced AI analyzes your skills, interests, and experience to find the perfect career matches
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-chart-2/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-route text-chart-2 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">Personalized Roadmaps</h3>
              <p className="text-muted-foreground">
                Get step-by-step learning paths with resources, milestones, and progress tracking
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-map-marker-alt text-accent text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">India-Focused</h3>
              <p className="text-muted-foreground">
                Tailored for the Indian job market with local insights, salary data, and opportunities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-primary-foreground text-sm"></i>
                </div>
                <span className="text-lg font-semibold">AI Career Advisor</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering Indian professionals with AI-driven career guidance and personalized learning paths.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Career Matching</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Skill Assessment</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Learning Roadmaps</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Resume Analysis</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Career Guide</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Industry Insights</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AI Career Advisor India. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
