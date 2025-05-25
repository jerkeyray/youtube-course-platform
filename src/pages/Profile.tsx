
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Calendar, 
  Award, 
  Target, 
  Share, 
  Edit,
  Clock,
  Trophy,
  Star
} from "lucide-react";

const Profile = () => {
  const achievements = [
    { icon: "🎯", name: "Goal Setter", description: "Created first learning goal" },
    { icon: "🔥", name: "Week Warrior", description: "7-day learning streak" },
    { icon: "⚡", name: "Speed Learner", description: "Completed 5 videos in one day" },
    { icon: "🌅", name: "Early Bird", description: "Learning before 8 AM" },
  ];

  const recentCertificates = [
    { title: "React Fundamentals Master", date: "Dec 10, 2024", type: "Course" },
    { title: "7-Day Learning Streak", date: "Dec 15, 2024", type: "Milestone" },
    { title: "Python Basics Graduate", date: "Dec 8, 2024", type: "Course" },
  ];

  const learningStats = [
    { label: "Total Watch Time", value: "148h 32m", icon: Clock },
    { label: "Videos Completed", value: "387", icon: Target },
    { label: "Certificates Earned", value: "12", icon: Award },
    { label: "Current Streak", value: "7 days", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-start space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg" alt="John Doe" />
                  <AvatarFallback className="text-2xl bg-primary text-white">JD</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">John Doe</h1>
                      <p className="text-gray-600 mb-3">
                        Passionate learner focused on web development and data science. 
                        Building skills one video at a time.
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Joined November 2024</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>yudoku.app/user/johndoe</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-2" />
                        Share Profile
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary-light">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    {learningStats.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                          <Icon className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                          <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
                          <div className="text-xs text-gray-600">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="achievements" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-accent" />
                    <span>Recent Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div>
                          <h3 className="font-medium text-gray-900">{achievement.name}</h3>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certificates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Recent Certificates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentCertificates.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Award className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{cert.title}</h3>
                            <p className="text-sm text-gray-600">{cert.date}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {cert.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    <span>Learning Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <h3 className="font-medium text-gray-900">Completed "React Hooks Deep Dive"</h3>
                        <p className="text-sm text-gray-600">2 hours ago • React Masterclass</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 border-l-4 border-accent bg-accent/5 rounded-r-lg">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <div>
                        <h3 className="font-medium text-gray-900">Earned "7-Day Learning Streak" certificate</h3>
                        <p className="text-sm text-gray-600">5 hours ago • Milestone Achievement</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <h3 className="font-medium text-gray-900">Completed "Python Data Structures"</h3>
                        <p className="text-sm text-gray-600">Yesterday • Python Fundamentals</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
