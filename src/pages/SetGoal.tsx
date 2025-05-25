
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Youtube } from "lucide-react";
import Sidebar from "@/components/Sidebar";

const SetGoal = () => {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [weeklyTarget, setWeeklyTarget] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Goal set:", { playlistUrl, weeklyTarget });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Your Learning Goal</h1>
            <p className="text-gray-600">Choose a YouTube playlist and set your weekly video target</p>
          </div>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Youtube className="h-6 w-6 text-red-500" />
                <span>Create New Goal</span>
              </CardTitle>
              <CardDescription>
                Enter a YouTube playlist URL and set how many videos you want to watch per week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="playlist">YouTube Playlist URL</Label>
                  <Input
                    id="playlist"
                    type="url"
                    placeholder="https://youtube.com/playlist?list=..."
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Weekly Video Target</Label>
                  <Select value={weeklyTarget} onValueChange={setWeeklyTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="How many videos per week?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 video per week</SelectItem>
                      <SelectItem value="2">2 videos per week</SelectItem>
                      <SelectItem value="3">3 videos per week</SelectItem>
                      <SelectItem value="5">5 videos per week</SelectItem>
                      <SelectItem value="7">1 video per day</SelectItem>
                      <SelectItem value="14">2 videos per day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary-light" size="lg">
                  Start Learning Journey
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SetGoal;
