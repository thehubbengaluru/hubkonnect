import { useState } from "react";
import { Search, Check, X, Clock, MessageCircle, ArrowRight, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageShell from "@/components/PageShell";

const PENDING_REQUESTS = [
  {
    id: "1", name: "Arjun Mehta", handle: "@arjunbuilds", type: "Co-working", initials: "AM",
    message: "Hey Riya! I saw your profile and noticed we're both into documentary filmmaking. Would love to chat about potential collaborations!",
    matchPercent: 92, matchReason: "Shared: Photography, Looking for collaborators", timeAgo: "2 hours ago",
  },
  {
    id: "2", name: "Sneha Desai", handle: "@snehadesign", type: "Co-living", initials: "SD",
    message: "Hi! I'm working on a design project and could use some help with video content. Your work looks amazing!",
    matchPercent: 87, matchReason: "Shared: Design, Film", timeAgo: "5 hours ago",
  },
  {
    id: "3", name: "Vikram Rao", handle: "@vikramcodes", type: "Event Attendee", initials: "VR",
    message: "Met you at the creative mixer last week. Would love to stay connected!",
    matchPercent: 79, matchReason: "Both attend Hub events", timeAgo: "1 day ago",
  },
];

const SENT_REQUESTS = [
  {
    id: "s1", name: "Priya Nair", handle: "@priyaframes", type: "Event Attendee", initials: "PN",
    message: "Hi Priya! Love your photography work...", timeAgo: "1 day ago",
  },
  {
    id: "s2", name: "Ravi Kumar", handle: "@ravitech", type: "Co-working", initials: "RK",
    message: "Hey Ravi, saw we share an interest in AI/ML...", timeAgo: "3 days ago",
  },
];

const MY_CONNECTIONS = [
  { id: "c1", name: "Arjun M.", handle: "@arjunbuilds", role: "Product Designer", initials: "AM", connectedAgo: "2 weeks ago" },
  { id: "c2", name: "Karan S.", handle: "@karanvibes", role: "Brand Strategist", initials: "KS", connectedAgo: "1 week ago" },
  { id: "c3", name: "Ravi K.", handle: "@ravitech", role: "Developer", initials: "RK", connectedAgo: "3 days ago" },
  { id: "c4", name: "Sneha D.", handle: "@snehadesign", role: "Designer", initials: "SD", connectedAgo: "yesterday" },
  { id: "c5", name: "Meera J.", handle: "@meeracodes", role: "Full-Stack Dev", initials: "MJ", connectedAgo: "5 days ago" },
  { id: "c6", name: "Ananya R.", handle: "@ananyawrites", role: "Copywriter", initials: "AR", connectedAgo: "1 week ago" },
  { id: "c7", name: "Rohan D.", handle: "@rohandas", role: "Content Creator", initials: "RD", connectedAgo: "2 weeks ago" },
  { id: "c8", name: "Priya N.", handle: "@priyaframes", role: "Photographer", initials: "PN", connectedAgo: "3 weeks ago" },
];

const Connections = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConnections = MY_CONNECTIONS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageShell>
      <div className="container py-8">
        <h1 className="font-heading text-3xl md:text-4xl uppercase mb-1">My Connections</h1>
        <p className="font-mono text-sm text-muted-foreground mb-6">
          People you've connected with at The Hub
        </p>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b-2 border-foreground rounded-none p-0 h-auto gap-0">
            <TabsTrigger
              value="pending"
              className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-mono text-xs uppercase tracking-wider px-4 py-3"
            >
              Pending ({PENDING_REQUESTS.length})
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-mono text-xs uppercase tracking-wider px-4 py-3"
            >
              Sent ({SENT_REQUESTS.length})
            </TabsTrigger>
            <TabsTrigger
              value="connections"
              className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-mono text-xs uppercase tracking-wider px-4 py-3"
            >
              Connections ({MY_CONNECTIONS.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending */}
          <TabsContent value="pending" className="mt-6 space-y-4">
            {PENDING_REQUESTS.map((req) => (
              <div key={req.id} className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <div className="flex gap-4">
                  <div className="h-14 w-14 flex-shrink-0 border-2 border-foreground bg-accent flex items-center justify-center">
                    <span className="font-heading text-sm">{req.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <h3 className="font-heading text-base uppercase">
                        {req.name} <span className="font-mono text-xs font-normal normal-case text-muted-foreground">wants to connect</span>
                      </h3>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {req.handle} · {req.type}
                      </p>
                    </div>

                    {/* Message */}
                    <div className="bg-secondary border border-foreground/20 px-3 py-2">
                      <p className="font-mono text-xs italic text-muted-foreground leading-relaxed">
                        "{req.message}"
                      </p>
                    </div>

                    {/* Match reason */}
                    <div className="bg-accent/15 border-l-[3px] border-accent px-3 py-1.5">
                      <p className="font-mono text-[11px] font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-accent" />
                        {req.matchPercent}% Match · {req.matchReason}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" className="h-9 px-4 border-2 border-foreground font-mono text-xs uppercase tracking-wider shadow-brutal-sm gap-1">
                        <Check className="h-3.5 w-3.5" /> Accept
                      </Button>
                      <Button variant="ghost" size="sm" className="h-9 px-4 font-mono text-xs uppercase tracking-wider text-destructive hover:text-destructive hover:bg-destructive/10 gap-1">
                        <X className="h-3.5 w-3.5" /> Decline
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 px-4 border-2 border-foreground font-mono text-xs uppercase tracking-wider gap-1">
                        <Eye className="h-3.5 w-3.5" /> View Profile
                      </Button>
                    </div>

                    <p className="font-mono text-[10px] text-muted-foreground text-right">
                      Sent {req.timeAgo}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Sent */}
          <TabsContent value="sent" className="mt-6 space-y-4">
            {SENT_REQUESTS.map((req) => (
              <div key={req.id} className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <div className="flex gap-4">
                  <div className="h-14 w-14 flex-shrink-0 border-2 border-foreground bg-accent flex items-center justify-center">
                    <span className="font-heading text-sm">{req.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <h3 className="font-heading text-base uppercase">{req.name}</h3>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {req.handle} · {req.type}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="inline-flex items-center gap-1 bg-warning/20 text-warning-foreground px-3 py-1 font-mono text-[11px] font-bold">
                      <Clock className="h-3 w-3" /> Pending · Sent {req.timeAgo}
                    </div>

                    {/* Message */}
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Your message:</p>
                      <p className="font-mono text-xs text-muted-foreground italic">"{req.message}"</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-9 px-4 font-mono text-xs uppercase tracking-wider text-destructive hover:text-destructive hover:bg-destructive/10">
                        Cancel Request
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 px-4 border-2 border-foreground font-mono text-xs uppercase tracking-wider gap-1">
                        <Eye className="h-3.5 w-3.5" /> View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* My Connections */}
          <TabsContent value="connections" className="mt-6">
            {/* Search + sort */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search connections..."
                  className="border-2 border-foreground bg-background font-mono text-xs h-10 pl-9"
                />
              </div>
              <select className="border-2 border-foreground bg-background font-mono text-xs uppercase tracking-wider px-3 py-2 h-10">
                <option value="recent">Recent</option>
                <option value="name">Name</option>
                <option value="active">Most Active</option>
              </select>
            </div>

            {/* Connections grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredConnections.map((conn) => (
                <div
                  key={conn.id}
                  className="border-2 border-foreground bg-card p-5 shadow-brutal hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-center"
                >
                  <div className="h-16 w-16 mx-auto border-2 border-foreground bg-accent flex items-center justify-center mb-3">
                    <span className="font-heading text-lg">{conn.initials}</span>
                  </div>
                  <h3 className="font-heading text-sm uppercase">{conn.name}</h3>
                  <p className="font-mono text-[11px] text-muted-foreground">{conn.handle}</p>
                  <p className="font-mono text-[11px] text-muted-foreground mt-1">{conn.role}</p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-2">Connected {conn.connectedAgo}</p>
                  <div className="mt-3 space-y-1.5">
                    <Button size="sm" className="w-full h-8 border-2 border-foreground font-mono text-[10px] uppercase tracking-wider shadow-brutal-sm gap-1">
                      <MessageCircle className="h-3 w-3" /> Message
                    </Button>
                    <button className="w-full font-mono text-[10px] text-muted-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-foreground transition-colors py-1">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredConnections.length === 0 && (
              <div className="border-2 border-foreground bg-card p-8 text-center font-mono text-sm text-muted-foreground shadow-brutal mt-4">
                No connections found matching "{searchQuery}"
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
};

export default Connections;
