import { Link, useLocation } from "react-router-dom";
import { Users, UserCircle, Compass, MessageCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

const navItems = [
  { to: "/for-you", label: "For You", icon: Compass },
  { to: "/connections", label: "Connections", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

const Navbar = () => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  return (
    <>
      {/* Top navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-foreground">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-9 w-9 border-2 border-foreground bg-accent flex items-center justify-center shadow-brutal-sm">
              <span className="font-heading text-base">H</span>
            </div>
            <span className="font-heading text-sm uppercase tracking-wide hidden sm:inline">
              Hub Konnect
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    size="sm"
                    className={`gap-2 font-mono text-xs uppercase tracking-wider ${
                      active ? "border-2 border-foreground shadow-brutal-sm" : "border-2 border-transparent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            {/* Avatar links to profile */}
            {user && profile?.avatar_url && (
              <Link to="/profile" className="h-8 w-8 border-2 border-foreground overflow-hidden hover:shadow-brutal-sm transition-all" aria-label="My profile">
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </Link>
            )}
            <ThemeToggle />
            <NotificationBell />
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="border-2 border-transparent hover:border-foreground"
                onClick={signOut}
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t-2 border-foreground pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around py-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 min-h-[48px] justify-center px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors relative ${
                  active ? "text-accent" : "text-muted-foreground"
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {/* Show notification badge on messages tab if needed */}
                </div>
                <span>{label}</span>
              </Link>
            );
          })}
          {/* Sign out on mobile */}
          {user && (
            <button
              onClick={signOut}
              className="flex flex-col items-center gap-1 min-h-[48px] justify-center px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign out</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
