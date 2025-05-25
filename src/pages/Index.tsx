
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FeatureCard from "@/components/FeatureCard";
import { Target, Calendar, Award, Share } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Learn. Track. Earn <span className="text-primary">Certificates.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Transform your YouTube learning experience with focused sessions, goal tracking, 
            and achievements that matter.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary-light text-white px-8 py-4 text-lg">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 px-8 py-4 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to stay focused
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Distraction-free learning with powerful tracking and motivation tools
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Target}
              title="Set Learning Goals"
              description="Create focused learning paths with YouTube playlists and weekly targets"
            />
            <FeatureCard
              icon={Calendar}
              title="Track Streaks"
              description="Build consistent learning habits with visual streak tracking"
            />
            <FeatureCard
              icon={Award}
              title="Earn Certificates"
              description="Get recognized for your achievements with downloadable certificates"
            />
            <FeatureCard
              icon={Share}
              title="Share Progress"
              description="Showcase your learning journey with shareable public profiles"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-primary to-primary-light">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to transform your learning?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of focused learners who are achieving their goals with Yudoku
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-50 px-8 py-4 text-lg">
              Start Learning Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
