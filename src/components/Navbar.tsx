
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <PlayCircle className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-gray-900">Yudoku</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="text-gray-700 hover:text-primary">
              Log In
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-primary hover:bg-primary-light text-white">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
