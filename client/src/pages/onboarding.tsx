import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useLocation } from 'wouter';

export default function Onboarding() {
  const [, setLocation] = useLocation();

  const handleComplete = () => {
    setLocation('/dashboard');
  };

  return <OnboardingWizard onComplete={handleComplete} />;
}
