import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, PenTool, LogOut, Menu, Settings, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Link, useNavigate } from "react-router-dom";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-primary font-interface">
              Unthink
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search essays, beliefs, topics..."
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/feed">
              <Button variant="ghost" size="sm">
                Feed
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="ghost" size="sm">
                Explore
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              Topics
            </Button>
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <Link to="/write">
                    <Button variant="warm" size="sm">
                      <PenTool className="w-4 h-4 mr-2" />
                      Write
                    </Button>
                  </Link>
                  <Link to="/belief-card">
                    <Button variant="gentle" size="sm">
                      Add Belief
                    </Button>
                  </Link>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                        {profile?.display_name ? getInitials(profile.display_name) : 'UN'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/write')}>
                      <PenTool className="w-4 h-4 mr-2" />
                      Write Post
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/payment-settings')}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/creator/${user.id}`)}>
                      <Avatar className="w-4 h-4 mr-2">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {profile?.display_name ? getInitials(profile.display_name) : 'UN'}
                        </AvatarFallback>
                      </Avatar>
                      My Creator Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="warm" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;