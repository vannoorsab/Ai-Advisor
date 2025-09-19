import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { uploadResumeFile } from '@/services/firebase';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiRequest } from '@/lib/queryClient';

interface OnboardingData {
  name: string;
  title: string;
  location: string;
  experience: string;
  education: {
    degree: string;
    field: string;
    institution: string;
    year: number;
  }[];
  interests: string[];
  bio: string;
  resumeFile?: File;
}

const INTERESTS = [
  { id: 'technology', name: 'Technology', icon: 'fas fa-code', description: 'Software development, AI, cybersecurity' },
  { id: 'business', name: 'Business', icon: 'fas fa-chart-line', description: 'Management, analytics, consulting' },
  { id: 'creative', name: 'Creative', icon: 'fas fa-palette', description: 'Design, content, media' },
  { id: 'healthcare', name: 'Healthcare', icon: 'fas fa-stethoscope', description: 'Medicine, research, therapy' },
  { id: 'education', name: 'Education', icon: 'fas fa-graduation-cap', description: 'Teaching, training, curriculum' },
  { id: 'finance', name: 'Finance', icon: 'fas fa-building', description: 'Banking, investing, accounting' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: 'Fresh Graduate' },
  { value: '0-2', label: '0-2 years' },
  { value: '2-5', label: '2-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: user?.displayName || '',
    title: '',
    location: '',
    experience: '',
    education: [{ degree: '', field: '', institution: '', year: new Date().getFullYear() }],
    interests: [],
    bio: '',
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData({ ...data, ...updates });
  };

  const toggleInterest = (interest: string) => {
    const newInterests = data.interests.includes(interest)
      ? data.interests.filter(i => i !== interest)
      : [...data.interests, interest];
    updateData({ interests: newInterests });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        updateData({ resumeFile: file });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
      }
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      let resumeUrl = '';
      
      // Upload resume if provided
      if (data.resumeFile && user) {
        resumeUrl = await uploadResumeFile(data.resumeFile, user.uid);
        toast({
          title: "Resume uploaded successfully",
          description: "Your resume is being processed...",
        });
      }

      // Create profile
      await apiRequest('POST', '/api/profile', {
        ...data,
        resumeUrl,
        userId: user?.uid,
      });

      toast({
        title: "Profile created successfully",
        description: "Welcome to AI Career Advisor!",
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Failed to create profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Tell us about yourself</h2>
              <p className="text-muted-foreground">Let's start with some basic information</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => updateData({ name: e.target.value })}
                  placeholder="Enter your full name"
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Current Title/Status</Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={(e) => updateData({ title: e.target.value })}
                  placeholder="e.g., Computer Science Student, Software Developer"
                  data-testid="input-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={data.location}
                  onChange={(e) => updateData({ location: e.target.value })}
                  placeholder="e.g., Mumbai, India"
                  data-testid="input-location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={data.experience} onValueChange={(value) => updateData({ experience: value })}>
                  <SelectTrigger data-testid="select-experience">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Tell us about your interests</h2>
              <p className="text-muted-foreground">Select areas that excite you most to get personalized career recommendations</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {INTERESTS.map((interest) => (
                <div
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-6 border rounded-xl cursor-pointer transition-all ${
                    data.interests.includes(interest.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary'
                  }`}
                  data-testid={`interest-${interest.id}`}
                >
                  <div className="text-center">
                    <i className={`${interest.icon} text-3xl text-primary mb-4`}></i>
                    <h3 className="font-semibold mb-2">{interest.name}</h3>
                    <p className="text-sm text-muted-foreground">{interest.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Education Background</h2>
              <p className="text-muted-foreground">Help us understand your academic background</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    value={data.education[0].degree}
                    onChange={(e) => {
                      const newEducation = [...data.education];
                      newEducation[0].degree = e.target.value;
                      updateData({ education: newEducation });
                    }}
                    placeholder="e.g., B.Tech, MBA, B.Sc"
                    data-testid="input-degree"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field">Field of Study</Label>
                  <Input
                    id="field"
                    value={data.education[0].field}
                    onChange={(e) => {
                      const newEducation = [...data.education];
                      newEducation[0].field = e.target.value;
                      updateData({ education: newEducation });
                    }}
                    placeholder="e.g., Computer Science, Business Administration"
                    data-testid="input-field"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={data.education[0].institution}
                  onChange={(e) => {
                    const newEducation = [...data.education];
                    newEducation[0].institution = e.target.value;
                    updateData({ education: newEducation });
                  }}
                  placeholder="e.g., IIT Delhi, Delhi University"
                  data-testid="input-institution"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Graduation Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={data.education[0].year}
                  onChange={(e) => {
                    const newEducation = [...data.education];
                    newEducation[0].year = parseInt(e.target.value);
                    updateData({ education: newEducation });
                  }}
                  placeholder="e.g., 2024"
                  data-testid="input-year"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Brief Bio</Label>
                <Textarea
                  id="bio"
                  value={data.bio}
                  onChange={(e) => updateData({ bio: e.target.value })}
                  placeholder="Tell us a bit about yourself, your goals, and what you're passionate about..."
                  rows={4}
                  data-testid="textarea-bio"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Upload Your Resume (Optional)</h2>
              <p className="text-muted-foreground">Upload your resume for better career matching and skill analysis</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume">Resume File (PDF, DOC, DOCX)</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                  data-testid="input-resume"
                />
                {data.resumeFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {data.resumeFile.name}
                  </p>
                )}
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2">Why upload your resume?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Better career matching based on your experience</li>
                  <li>• Automatic skill extraction and analysis</li>
                  <li>• Personalized roadmap recommendations</li>
                  <li>• Track your progress over time</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Step {step} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" data-testid="progress-bar" />
            </div>

            <div className="max-w-2xl mx-auto">
              {renderStep()}

              <div className="flex justify-between pt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                  data-testid="button-back"
                >
                  Back
                </Button>
                
                {step === totalSteps ? (
                  <Button
                    onClick={handleComplete}
                    disabled={loading || !data.name || !data.title}
                    data-testid="button-complete"
                  >
                    {loading ? 'Creating Profile...' : 'Complete Setup'}
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    disabled={
                      (step === 1 && (!data.name || !data.title)) ||
                      (step === 2 && data.interests.length === 0)
                    }
                    data-testid="button-next"
                  >
                    Continue
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
