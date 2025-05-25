
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, TrendingUp, Flame } from "lucide-react";

const Calendar = () => {
  // Mock data for calendar
  const currentDate = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const learningData = {
    1: { minutes: 45, videos: 2 },
    2: { minutes: 30, videos: 1 },
    3: { minutes: 60, videos: 3 },
    5: { minutes: 25, videos: 1 },
    6: { minutes: 90, videos: 4 },
    7: { minutes: 40, videos: 2 },
    8: { minutes: 55, videos: 2 },
    10: { minutes: 35, videos: 1 },
    11: { minutes: 70, videos: 3 },
    12: { minutes: 45, videos: 2 },
    13: { minutes: 80, videos: 3 },
    14: { minutes: 30, videos: 1 },
    15: { minutes: 65, videos: 3 },
  };

  const getStreakIntensity = (minutes) => {
    if (!minutes) return '';
    if (minutes < 30) return 'bg-accent/20';
    if (minutes < 60) return 'bg-accent/50';
    return 'bg-accent';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
              <CalendarIcon className="h-8 w-8 text-primary" />
              <span>Learning Calendar</span>
            </h1>
            <p className="text-gray-600">Track your daily learning progress and maintain your streak</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>December 2024</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <Flame className="h-4 w-4 mr-1" />
                      7 Day Streak
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: firstDayOfMonth }, (_, i) => (
                      <div key={`empty-${i}`} className="aspect-square"></div>
                    ))}
                    
                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const data = learningData[day];
                      const isToday = day === currentDate.getDate();
                      
                      return (
                        <div
                          key={day}
                          className={`aspect-square relative cursor-pointer rounded-lg border-2 transition-colors ${
                            isToday 
                              ? 'border-primary bg-primary/5' 
                              : data 
                                ? 'border-accent/20 hover:border-accent/40' 
                                : 'border-gray-100 hover:border-gray-200'
                          } ${data ? getStreakIntensity(data.minutes) : 'bg-white'}`}
                          title={data ? `${data.minutes} minutes, ${data.videos} videos` : 'No activity'}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-sm font-medium ${
                              isToday 
                                ? 'text-primary' 
                                : data && data.minutes >= 60 
                                  ? 'text-white' 
                                  : 'text-gray-700'
                            }`}>
                              {day}
                            </span>
                          </div>
                          {data && (
                            <div className="absolute bottom-1 left-1 right-1 text-center">
                              <div className={`text-xs ${
                                data.minutes >= 60 ? 'text-white/90' : 'text-gray-600'
                              }`}>
                                {data.minutes}m
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <span>This Month</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Watch Time</span>
                      <span className="font-medium">12h 35m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Videos Watched</span>
                      <span className="font-medium">32</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Learning Days</span>
                      <span className="font-medium">13/31</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Streak</span>
                      <span className="font-medium text-primary">7 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Legend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-accent/20 rounded"></div>
                    <span className="text-sm">1-29 minutes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-accent/50 rounded"></div>
                    <span className="text-sm">30-59 minutes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-accent rounded"></div>
                    <span className="text-sm">60+ minutes</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Streak Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">3 Day Streak</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✓ Completed
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">7 Day Streak</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✓ Completed
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">14 Day Streak</span>
                    <Badge variant="outline">
                      7/14 days
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">30 Day Streak</span>
                    <Badge variant="outline">
                      7/30 days
                    </Badge>
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

export default Calendar;
