import { getCompanyForCurrentUser } from "@/lib/auth-helpers";
import {
  getCompanyDashboardStats,
  getPendingReviews,
} from "@/actions/reviews";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import {
  Users,
  ClipboardCheck,
  CheckCircle2,
  Trophy,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function CompanyDashboardPage() {
  const company = await getCompanyForCurrentUser();

  if (!company) {
    redirect("/");
  }

  const [stats, pendingReviews] = await Promise.all([
    getCompanyDashboardStats(),
    getPendingReviews(),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {company.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and manage your developers&apos; work submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Developers"
          value={stats.totalDevs}
          description="Developers in your team"
          icon={Users}
          iconColor="text-blue-400"
        />
        <StatsCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          description="Awaiting your approval"
          icon={ClipboardCheck}
          iconColor="text-amber-400"
        />
        <StatsCard
          title="Approved Today"
          value={stats.approvedToday}
          description="Approved today"
          icon={CheckCircle2}
          iconColor="text-emerald-400"
        />
        <StatsCard
          title="Total Approved"
          value={stats.totalApproved}
          description="All time approvals"
          icon={Trophy}
          iconColor="text-purple-400"
        />
      </div>

      {/* Pending Reviews Preview */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            Pending Reviews
          </CardTitle>
          {pendingReviews.length > 0 && (
            <Link
              href="/company/reviews"
              className="text-sm text-blue-400 hover:underline"
            >
              View all →
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {pendingReviews.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="No pending reviews"
              description="All submissions have been reviewed. Check back later!"
            />
          ) : (
            <div className="space-y-3">
              {pendingReviews.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-3 border-b border-border/30 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {session.developers?.full_name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {session.work_description || "No description"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(session.date)}
                    </span>
                    <span className="text-sm font-medium">
                      {session.duration_minutes
                        ? `${Math.round(session.duration_minutes / 60 * 10) / 10}h`
                        : "—"}
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-amber-500/15 text-amber-400 border-amber-500/20 text-xs"
                    >
                      Pending
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
