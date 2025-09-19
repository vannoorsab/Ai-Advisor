import { RoadmapProgress } from "@/components/dashboard/RoadmapProgress";

export default function RoadmapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Roadmap</h1>
      <RoadmapProgress />
    </div>
  );
}