import { ProfileSummary } from "@/components/dashboard/ProfileSummary";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function ProfilePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <ProfileSummary />
      <RecentActivity />
    </div>
  );
}