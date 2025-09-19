import { CareerMatches } from "@/components/dashboard/CareerMatches";

export default function CareersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Career Matches</h1>
      <CareerMatches />
    </div>
  );
}