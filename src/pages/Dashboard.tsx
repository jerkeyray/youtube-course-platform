
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, Award, TrendingUp, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h1>
            <p className="text-gray-600">Track your learning progress and stay motivated</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Goals</CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">3</div>
                <p className="text-xs text-gray-600">2 on track this week</p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Current Streak</CardTitle>
                <Calendar className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">7 days</div>
                <p className="text-xs text-gray-600">Keep it going!</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Certificates Earned</CardTitle>
                <Award className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-gray-600">+2 this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Watch Time</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48h 32m</div>
                <p className="text-xs text-gray-600">This month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Current Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Current Goals</span>
                </CardTitle>
                <CardDescription>Your active learning objectives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">React Masterclass</h4>
                      <p className="text-sm text-gray-600">5 videos per week</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">3/5 videos</div>
                      <Progress value={60} className="w-20 h-2 mt-1" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Python Fundamentals</h4>
                      <p className="text-sm text-gray-600">3 videos per week</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">2/3 videos</div>
                      <Progress value={67} className="w-20 h-2 mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Design Systems</h4>
                      <p className="text-sm text-gray-600">2 videos per week</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">2/2 videos</div>
                      <Progress value={100} className="w-20 h-2 mt-1" />
                    </div>
                  </div>
                </div>
                
                <Link to="/set-goal">
                  <Button className="w-full mt-4 bg-primary hover:bg-primary-light">
                    Set New Goal
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PlayCircle className="h-5 w-5 text-accent" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Your latest learning sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <h4 className="font-medium">React Hooks Deep Dive</h4>
                      <p className="text-sm text-gray-600">Completed • 45 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <div className="flex-1">
                      <h4 className="font-medium">Python Data Structures</h4>
                      <p className="text-sm text-gray-600">Completed • 2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <h4 className="font-medium">Figma Components</h4>
                      <p className="text-sm text-gray-600">Completed • Yesterday</p>
                    </div>
                  </div>
                </div>
                
                <Link to="/calendar">
                  <Button variant="outline" className="w-full mt-4">
                    View Full Calendar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
