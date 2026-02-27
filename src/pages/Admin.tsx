import { useAuth } from "@/contexts/AuthContext";
import { useAdminStats } from "@/hooks/use-admin-stats";
import { useIsAdmin } from "@/hooks/use-admin-role";
import { Navigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingUp, Users, MessageSquare, Link2, Activity } from "lucide-react";

const StatCard = ({ label, value, sub, icon: Icon, alert }: {
  label: string; value: string | number; sub?: string; icon?: any; alert?: boolean;
}) => (
  <div className={`border-2 border-foreground p-5 shadow-brutal ${alert ? "bg-destructive/10" : "bg-card"}`}>
    <div className="flex items-center justify-between mb-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
    </div>
    <p className="font-heading text-3xl">{value}</p>
    {sub && <p className="font-mono text-xs text-muted-foreground mt-1">{sub}</p>}
  </div>
);

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);
  const { data: stats, isLoading } = useAdminStats(isAdmin === true);

  if (authLoading || roleLoading) return null;

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageShell>
      <div className="container py-8 max-w-6xl">
        <h1 className="font-heading text-3xl md:text-4xl uppercase mb-1">Admin Dashboard</h1>
        <p className="font-mono text-sm text-muted-foreground mb-8">Community health metrics</p>

        {isLoading || !stats ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 border-2 border-foreground" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Activation Funnel */}
            <section>
              <h2 className="font-heading text-xl uppercase mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Activation Funnel
              </h2>
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="Total Signups" value={stats.totalSignups} icon={Users} />
                <StatCard label="Onboarding Done" value={stats.onboardingCompleted}
                  sub={`${stats.totalSignups > 0 ? Math.round((stats.onboardingCompleted / stats.totalSignups) * 100) : 0}% conversion`} />
                <StatCard label="1+ Connections" value={stats.usersWithConnections}
                  sub={`${stats.totalSignups > 0 ? Math.round((stats.usersWithConnections / stats.totalSignups) * 100) : 0}% of signups`} />
                <StatCard label="1+ Messages Sent" value={stats.usersWithMessages}
                  sub={`${stats.totalSignups > 0 ? Math.round((stats.usersWithMessages / stats.totalSignups) * 100) : 0}% of signups`} icon={MessageSquare} />
              </div>
            </section>

            {/* Engagement */}
            <section>
              <h2 className="font-heading text-xl uppercase mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" /> Engagement
              </h2>
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="Daily Active" value={stats.dailyActive}
                  sub={`${stats.totalSignups > 0 ? Math.round((stats.dailyActive / stats.totalSignups) * 100) : 0}% DAU`} />
                <StatCard label="Weekly Active" value={stats.weeklyActive}
                  sub={`${stats.totalSignups > 0 ? Math.round((stats.weeklyActive / stats.totalSignups) * 100) : 0}% WAU`} />
                <StatCard label="Avg Connections" value={stats.avgConnectionsPerUser} sub="per user" />
                <StatCard label="Avg Messages" value={stats.avgMessagesPerUser} sub="per user" />
              </div>
            </section>

            {/* Connection Funnel */}
            <section>
              <h2 className="font-heading text-xl uppercase mb-4 flex items-center gap-2">
                <Link2 className="h-5 w-5" /> Connection Funnel
              </h2>
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="Total Requests" value={stats.totalRequests} />
                <StatCard label="Accepted" value={stats.acceptedRequests} sub={`${stats.acceptRate}% accept rate`} />
                <StatCard label="0 Connections" value={stats.zeroConnectionUsers.length}
                  sub="users need help" alert={stats.zeroConnectionUsers.length > 0} icon={AlertTriangle} />
                <StatCard label="Power Users (5+)" value={stats.powerUsers.length} />
              </div>
            </section>

            {/* Retention */}
            <section>
              <h2 className="font-heading text-xl uppercase mb-4">Retention</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Active Today" value={stats.activeToday} />
                <StatCard label="Active 7 Days" value={stats.active7Days} />
                <StatCard label="Active 30 Days" value={stats.active30Days} />
              </div>
            </section>

            {/* Top Members */}
            <div className="grid gap-6 md:grid-cols-2">
              <section className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <h3 className="font-heading text-base uppercase mb-4">Top Connectors</h3>
                {stats.topConnectors.length === 0 ? (
                  <p className="font-mono text-sm text-muted-foreground">No data yet</p>
                ) : (
                  <div className="space-y-2">
                    {stats.topConnectors.map((u, i) => (
                      <div key={u.name} className="flex items-center justify-between font-mono text-sm">
                        <span>{i + 1}. {u.name}</span>
                        <span className="text-muted-foreground">{u.count} connections</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <h3 className="font-heading text-base uppercase mb-4">Top Messagers</h3>
                {stats.topMessagers.length === 0 ? (
                  <p className="font-mono text-sm text-muted-foreground">No data yet</p>
                ) : (
                  <div className="space-y-2">
                    {stats.topMessagers.map((u, i) => (
                      <div key={u.name} className="flex items-center justify-between font-mono text-sm">
                        <span>{i + 1}. {u.name}</span>
                        <span className="text-muted-foreground">{u.count} messages</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Zero Connection Users */}
            {stats.zeroConnectionUsers.length > 0 && (
              <section className="border-2 border-foreground bg-destructive/5 p-5 shadow-brutal">
                <h3 className="font-heading text-base uppercase mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Users With 0 Connections
                </h3>
                <p className="font-mono text-xs text-muted-foreground mb-3">
                  These users may need a manual intro or profile help
                </p>
                <div className="flex flex-wrap gap-2">
                  {stats.zeroConnectionUsers.map((name) => (
                    <span key={name} className="border-2 border-foreground bg-background px-3 py-1 font-mono text-xs">
                      {name}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default Admin;
