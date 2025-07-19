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
            <Link to="/" className="text-2xl font-bold text-gradient font-interface">
              Unthink
            </Link>
          </div>

          {/* Search Bar - Enhanced for dark mode */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search posts, authors, topics..."
                className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/feed">
              <Button variant="ghost" size="sm" className="hover:text-accent">
                Feed
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="ghost" size="sm" className="hover:text-accent">
                Explore
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="ghost" size="sm" className="hover:text-accent">
                Topics
              </Button>
            </Link>
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <Link to="/write">
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <PenTool className="w-4 h-4 mr-2" />
                      Write
                    </Button>
                  </Link>
                  <Link to="/hot-take">
                    <Button variant="outline" size="sm" className="border-accent/30 hover:border-accent/60 hover:bg-accent/10">
                      Hot Take
                    </Button>
                  </Link>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity border-2 border-accent/30 hover:border-accent/60">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="text-xs bg-accent/20 text-accent-foreground border border-accent/30">
                        {profile?.display_name ? getInitials(profile.display_name) : 'UN'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-accent/10">
                      <Settings className="w-4 h-4 mr-2" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/write')} className="hover:bg-accent/10">
                      <PenTool className="w-4 h-4 mr-2" />
                      Write Post
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={() => navigate('/payment-settings')} className="hover:bg-accent/10">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/creator/${user.id}`)} className="hover:bg-accent/10">
                      <Avatar className="w-4 h-4 mr-2">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {profile?.display_name ? getInitials(profile.display_name) : 'UN'}
                        </AvatarFallback>
                      </Avatar>
                      My Creator Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={handleLogout} className="hover:bg-destructive/10 text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" className="hover:text-accent">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
