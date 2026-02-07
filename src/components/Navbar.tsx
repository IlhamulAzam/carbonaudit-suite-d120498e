import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CarboLogo } from "./CarboLogo";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, FileText, Upload } from "lucide-react";

export function Navbar() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <CarboLogo size="sm" />
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/evaluate"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <Upload size={16} />
            Evaluate PDD
          </Link>

          {user && (
            <Link
              to="/reports"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <FileText size={16} />
              Reports
            </Link>
          )}

          {loading ? (
            <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
