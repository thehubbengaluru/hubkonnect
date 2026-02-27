import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useConnections } from "@/hooks/use-connections";
import { useUnreadCount } from "@/hooks/use-messages";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase();

const NotificationBell = () => {
  const { user } = useAuth();
  const { data: connData } = useConnections(user?.id);
  const { data: unreadMsgCount } = useUnreadCount(user?.id);
  const navigate = useNavigate();

  const pendingRequests = connData?.pending ?? [];
  const totalBadge = pendingRequests.length + (unreadMsgCount ?? 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative border-2 border-transparent hover:border-foreground">
          <Bell className="h-5 w-5" />
          {totalBadge > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground font-mono text-[10px] font-bold h-5 w-5 flex items-center justify-center border border-foreground">
              {totalBadge > 9 ? "9+" : totalBadge}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-2 border-foreground shadow-brutal p-0 bg-background" align="end">
        <div className="p-3 border-b-2 border-foreground">
          <p className="font-heading text-sm uppercase">Notifications</p>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {totalBadge === 0 ? (
            <div className="p-6 text-center font-mono text-xs text-muted-foreground">
              You're all caught up! 🎉
            </div>
          ) : (
            <>
              {pendingRequests.map((req) => (
                <button
                  key={req.id}
                  onClick={() => navigate("/connections")}
                  className="w-full text-left p-3 border-b border-foreground/10 hover:bg-accent/10 transition-colors flex gap-3"
                >
                  <div className="h-8 w-8 flex-shrink-0 border-2 border-foreground bg-accent flex items-center justify-center overflow-hidden">
                    {req.profile.avatar_url ? (
                      <img src={req.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-mono text-[10px] font-bold">{getInitials(req.profile.full_name)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs">
                      <span className="font-bold">{req.profile.full_name}</span> wants to connect
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </button>
              ))}
              {(unreadMsgCount ?? 0) > 0 && (
                <button
                  onClick={() => navigate("/messages")}
                  className="w-full text-left p-3 border-b border-foreground/10 hover:bg-accent/10 transition-colors flex gap-3 items-center"
                >
                  <div className="h-8 w-8 flex-shrink-0 border-2 border-foreground bg-foreground text-primary-foreground flex items-center justify-center">
                    <span className="font-mono text-[10px] font-bold">{unreadMsgCount}</span>
                  </div>
                  <p className="font-mono text-xs">
                    <span className="font-bold">{unreadMsgCount} unread message{(unreadMsgCount ?? 0) > 1 ? "s" : ""}</span>
                  </p>
                </button>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
