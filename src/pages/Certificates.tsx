
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Share, Trophy, Star, Calendar } from "lucide-react";

const Certificates = () => {
  const certificates = [
    {
      id: 1,
      title: "React Fundamentals Master",
      description: "Completed comprehensive React.js fundamentals course",
      earnedDate: "2024-12-10",
      type: "Course Completion",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      id: 2,
      title: "7-Day Learning Streak",
      description: "Maintained consistent learning for 7 consecutive days",
      earnedDate: "2024-12-15",
      type: "Milestone",
      color: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      id: 3,
      title: "Python Basics Graduate",
      description: "Successfully completed Python programming basics",
      earnedDate: "2024-12-08",
      type: "Course Completion",
      color: "bg-gradient-to-br from-yellow-500 to-orange-500"
    },
    {
      id: 4,
      title: "First Goal Achiever",
      description: "Successfully completed your first learning goal",
      earnedDate: "2024-12-05",
      type: "Achievement",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    }
  ];

  const badges = [
    { name: "Early Bird", description: "Learning before 8 AM", icon: "🌅", earned: true },
    { name: "Night Owl", description: "Learning after 10 PM", icon: "🦉", earned: true },
    { name: "Speed Learner", description: "Completed 5 videos in one day", icon: "⚡", earned: true },
    { name: "Consistent", description: "14-day learning streak", icon: "🔥", earned: false },
    { name: "Dedicated", description: "30-day learning streak", icon: "💎", earned: false },
    { name: "Scholar", description: "Completed 10 courses", icon: "🎓", earned: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
              <Award className="h-8 w-8 text-primary" />
              <span>Certificates & Badges</span>
            </h1>
            <p className="text-gray-600">Your learning achievements and milestones</p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Certificates</p>
                    <p className="text-3xl font-bold text-primary">12</p>
                  </div>
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Badges Earned</p>
                    <p className="text-3xl font-bold text-accent">8</p>
                  </div>
                  <Star className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">This Month</p>
                    <p className="text-3xl font-bold">4</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Certificates */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Certificates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                      <Card key={cert.id} className="overflow-hidden">
                        <div className={`h-24 ${cert.color} relative`}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Award className="h-8 w-8 text-white" />
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="absolute top-2 right-2 bg-white/20 text-white border-white/30"
                          >
                            {cert.type}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{cert.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <Calendar className="h-3 w-3 mr-1" />
                            Earned {new Date(cert.earnedDate).toLocaleDateString()}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Share className="h-3 w-3 mr-1" />
                              Share
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Badges */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-accent" />
                    <span>Badges</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {badges.map((badge, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        badge.earned 
                          ? 'bg-accent/5 border-accent/20' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${badge.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                          {badge.name}
                        </h4>
                        <p className={`text-xs ${badge.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                          {badge.description}
                        </p>
                      </div>
                      {badge.earned && (
                        <Badge variant="secondary" className="bg-accent/10 text-accent">
                          ✓
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificates;
