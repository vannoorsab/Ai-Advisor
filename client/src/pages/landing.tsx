import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function Landing() {
  const [, setLocation] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-graduation-cap text-primary-foreground text-sm"></i>
            </div>
            <span className="text-xl font-semibold">AI Career Advisor</span>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button className="hover:text-primary transition-colors" onClick={() => setLocation('/')}>Home</button>
            <button className="hover:text-primary transition-colors" onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})}>Services</button>
            <button className="hover:text-primary transition-colors" onClick={() => window.scrollTo({top: 1600, behavior: 'smooth'})}>How It Works</button>
            <button className="hover:text-primary transition-colors" onClick={() => setLocation('/auth')}>Login</button>
            <button className="hover:text-primary transition-colors" onClick={() => setLocation('/auth')}>Register</button>
          </nav>
          {/* Mobile Drawer */}
          <div className="md:hidden">
            <button onClick={() => setDrawerOpen(!drawerOpen)} aria-label="Open menu">
              <i className="fas fa-bars text-xl"></i>
            </button>
            {drawerOpen && (
              <div className="absolute right-4 top-16 bg-card border border-border rounded-lg shadow-lg z-50 w-48">
                <button className="block w-full text-left px-4 py-2 hover:bg-muted" onClick={() => {setLocation('/'); setDrawerOpen(false);}}>Home</button>
                <button className="block w-full text-left px-4 py-2 hover:bg-muted" onClick={() => {window.scrollTo({top: 800, behavior: 'smooth'}); setDrawerOpen(false);}}>Services</button>
                <button className="block w-full text-left px-4 py-2 hover:bg-muted" onClick={() => {window.scrollTo({top: 1600, behavior: 'smooth'}); setDrawerOpen(false);}}>How It Works</button>
                <button className="block w-full text-left px-4 py-2 hover:bg-muted" onClick={() => {setLocation('/auth'); setDrawerOpen(false);}}>Login</button>
                <button className="block w-full text-left px-4 py-2 hover:bg-muted" onClick={() => { setLocation('/auth'); setDrawerOpen(false); }}>Register</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-chart-2 text-primary-foreground py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Discover Your Perfect Career Path with AI
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl">
              Get personalized career recommendations, skill-based matching, and structured roadmaps tailored for the Indian job market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-card text-foreground hover:bg-secondary"
                onClick={() => setLocation('/onboarding')}
              >
                Start Free Assessment
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setLocation('/roadmap')}
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
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive career guidance powered by AI, tailored for India.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-card shadow hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-brain text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered Matching</h3>
              <p className="text-muted-foreground">
                Advanced AI analyzes your skills, interests, and experience to find the perfect career matches.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card shadow hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-chart-2/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-route text-chart-2 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">Personalized Roadmaps</h3>
              <p className="text-muted-foreground">
                Get step-by-step learning paths with resources, milestones, and progress tracking.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card shadow hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-map-marker-alt text-accent text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">India-Focused Insights</h3>
              <p className="text-muted-foreground">
                Local insights, salary data, and opportunities for the Indian job market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50" id="how-it-works">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center text-indigo-700">How It Works</h2>
          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-indigo-200 rounded-full"></div>
            <div className="space-y-12">
              {[
                {
                  icon: "fas fa-user-plus",
                  title: "Sign Up & Authentication",
                  desc: "Create your account securely using email or Google. Your data is protected and private.",
                  color: "bg-indigo-100 text-indigo-700"
                },
                {
                  icon: "fas fa-user-edit",
                  title: "Onboarding & Profile Setup",
                  desc: "Complete a guided onboarding to add your interests, skills, and upload your resume.",
                  color: "bg-blue-100 text-blue-700"
                },
                {
                  icon: "fas fa-brain",
                  title: "AI Career Matching",
                  desc: "Our AI analyzes your profile and matches you to the best careers in India.",
                  color: "bg-green-100 text-green-700"
                },
                {
                  icon: "fas fa-route",
                  title: "Personalized Roadmaps",
                  desc: "Get step-by-step learning paths, milestones, and resources to reach your goals.",
                  color: "bg-yellow-100 text-yellow-700"
                },
                {
                  icon: "fas fa-file-alt",
                  title: "Resume Analysis",
                  desc: "Upload your resume for deeper skill and experience matching.",
                  color: "bg-pink-100 text-pink-700"
                },
                {
                  icon: "fas fa-tachometer-alt",
                  title: "Dashboard Overview",
                  desc: "Track your matches, roadmap progress, and recent activity in your dashboard.",
                  color: "bg-purple-100 text-purple-700"
                },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start space-x-6 relative">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${step.color} border-4 border-white z-10`}>
                    <i className={`${step.icon} text-2xl`}></i>
                  </div>
                  <div className="ml-2">
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-base text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8">
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
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Email: <a href="mailto:support@aicareeradvisor.in" className="hover:text-foreground transition-colors">support@aicareeradvisor.in</a></li>
                <li>Phone: <a href="tel:+911234567890" className="hover:text-foreground transition-colors">+91 12345 67890</a></li>
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact Form</a></li>
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
