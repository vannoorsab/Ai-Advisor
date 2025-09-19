import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";

export default function ProfileEditPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Example state, replace with actual profile data from API
  const [name, setName] = useState(user?.displayName || "");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [linkedin, setLinkedin] = useState("");
  const [resume, setResume] = useState<File | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to update profile
    setLocation("/profile");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" value={bio} onChange={e => setBio(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input id="skills" value={skills.join(", ")} onChange={e => setSkills(e.target.value.split(",").map(s => s.trim()))} />
            </div>
            <div>
              <Label htmlFor="interests">Interests (comma separated)</Label>
              <Input id="interests" value={interests.join(", ")} onChange={e => setInterests(e.target.value.split(",").map(s => s.trim()))} />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input id="linkedin" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="resume">Resume (PDF)</Label>
              <Input id="resume" type="file" accept=".pdf" onChange={e => setResume(e.target.files?.[0] || null)} />
            </div>
            <Button type="submit" className="w-full mt-4">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}