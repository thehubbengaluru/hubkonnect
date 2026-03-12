import { Link, useLocation } from "react-router-dom";
import { Users, UserCircle, Compass, MessageCircle, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  return (
    <>
      {/* Desktop navbar */}
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
            {user && profile?.avatar_url && (
              <div className="h-8 w-8 border-2 border-foreground overflow-hidden">
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            )}
            <ThemeToggle />
            <NotificationBell />
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex border-2 border-transparent hover:border-foreground"
                onClick={signOut}
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden border-2 border-transparent hover:border-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t-2 border-foreground bg-background p-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
                <Button
                  variant={location.pathname === to ? "default" : "ghost"}
                  className="w-full justify-start gap-2 font-mono text-xs uppercase tracking-wider border-2 border-foreground shadow-brutal-sm mb-2"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
            {user && (
              <Button
                variant="ghost"
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="w-full justify-start gap-2 font-mono text-xs uppercase tracking-wider border-2 border-foreground shadow-brutal-sm mb-2 text-destructive"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            )}
          </div>
        )}
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
                className={`flex flex-col items-center gap-1 min-h-[48px] justify-center px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  active ? "text-accent" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
