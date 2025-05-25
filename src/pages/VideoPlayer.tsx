
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Target, PlayCircle } from "lucide-react";

const VideoPlayer = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video Player Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden">
                <div className="aspect-video bg-black relative">
                  {/* YouTube Embed Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="h-16 w-16 text-white/70" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 text-white px-3 py-1 rounded text-sm">
                      25:30 / 45:00
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        React Masterclass
                      </Badge>
                      <CardTitle className="text-xl">
                        Understanding React Hooks - useState and useEffect
                      </CardTitle>
                      <p className="text-gray-600">
                        Learn the fundamentals of React Hooks and how to manage state and side effects in functional components.
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Button className="bg-primary hover:bg-primary-light">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Watched
                    </Button>
                    <Button variant="outline">
                      <Clock className="h-4 w-4 mr-2" />
                      Save for Later
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span>Goal Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Weekly Target</span>
                      <span>3/5 videos</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Progress</span>
                      <span>12/24 videos</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>

                  <div className="pt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Watched Today</span>
                      <span className="font-medium">1h 45m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Streak</span>
                      <span className="font-medium">7 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Up Next</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <PlayCircle className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">Custom Hooks in React</h4>
                      <p className="text-xs text-gray-600">35:20</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <PlayCircle className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">Context API Deep Dive</h4>
                      <p className="text-xs text-gray-600">42:15</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <PlayCircle className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">Performance Optimization</h4>
                      <p className="text-xs text-gray-600">38:45</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
