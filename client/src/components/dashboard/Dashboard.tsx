import { useQuery } from '@tanstack/react-query';
import { CareerMatches } from './CareerMatches';
import { RoadmapProgress } from './RoadmapProgress';
import { ProfileSummary } from './ProfileSummary';
import { LearningResources } from './LearningResources';
import { RecentActivity } from './RecentActivity';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';

export function Dashboard() {
  const { user } = useAuth();

  // Sample personalized goals and tasks
  const goals = [
    { id: 1, title: "Become a Data Scientist", progress: 60 },
    { id: 2, title: "Apply to 5 jobs this month", progress: 40 },
  ];
  const tasks = [
    { id: 1, title: "Update Resume", action: "Update", completed: false },
    { id: 2, title: "Complete Python Course", action: "Start Learning", completed: false },
    { id: 3, title: "Apply for Data Analyst role", action: "Apply", completed: true },
  ];

  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/profile/stats'],
    enabled: !!user,
  });

  const sampleStats = {
    careerMatches: 2,
    roadmapProgress: 55,
    skillsAcquired: 4,
  };

  const displayStats = stats || sampleStats;

  return (
    <main className="py-8 min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-teal-50 relative overflow-x-hidden">
      {/* Bubble background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-40 h-40 bg-blue-200 rounded-full opacity-30 blur-2xl animate-bubble"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-teal-200 rounded-full opacity-30 blur-2xl animate-bubble"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-orange-200 rounded-full opacity-20 blur-2xl animate-bubble"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-2 text-blue-900 drop-shadow">
            Welcome, {user?.displayName?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-lg text-blue-700">
            Your personalized career dashboard.
          </p>
        </div>

        {/* Widget Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Profile & Goals */}
          <div className="lg:col-span-1 space-y-8">
            <ProfileSummary />
            {/* Personalized Goals Widget */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-700">My Goals</h2>
              <div className="space-y-4">
                {goals.map(goal => (
                  <div key={goal.id}>
                    <p className="font-medium">{goal.title}</p>
                    <div className="w-full bg-blue-100 rounded-full h-2 mt-2 mb-1">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-600">{goal.progress}% complete</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column: Main Widgets */}
          <div className="lg:col-span-2 space-y-8">
            {/* Task Management Widget */}
            <div className="bg-white rounded-2xl shadow-lg border border-teal-100 p-6">
              <h2 className="text-xl font-semibold mb-4 text-teal-700">My Tasks</h2>
              <ul className="space-y-3">
                {tasks.map(task => (
                  <li key={task.id} className="flex items-center justify-between">
                    <span className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</span>
                    <Button
                      size="sm"
                      className={`rounded-full px-4 py-1 font-semibold transition-transform duration-300
                        ${task.completed ? 'bg-gray-300 text-gray-600 cursor-default' : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105 shadow'}`}
                      disabled={task.completed}
                    >
                      {task.action}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <CareerMatches />
            <RoadmapProgress />
          </div>

          {/* Right Column: Insights & Resources */}
          <div className="lg:col-span-1 space-y-8">
            {/* Skill Gap Analysis Widget */}
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
              <h2 className="text-xl font-semibold mb-4 text-green-700">Skill Gap Analysis</h2>
              <p className="text-sm text-gray-700 mb-2">
                You can improve your <span className="font-semibold text-green-700">Statistics</span> and <span className="font-semibold text-green-700">SQL</span> skills.
              </p>
              <Button
                size="sm"
                className="bg-green-500 text-white rounded-full shadow hover:bg-green-600 hover:scale-105 transition-transform"
              >
                View Recommended Courses
              </Button>
            </div>
            <LearningResources />
            <RecentActivity />
          </div>
        </div>
      </div>
      {/* Bubble animation keyframes */}
      <style>{`
        @keyframes bubble {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        .animate-bubble { animation: bubble 6s ease-in-out infinite; }
      `}</style>
    </main>
  );
}
