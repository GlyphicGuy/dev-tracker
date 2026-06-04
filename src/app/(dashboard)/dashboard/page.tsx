import {
  getDashboardStats,
  getTodayAttendance,
  getRecentActivity,
} from "@/actions/attendance";
import { StatsCard } from "@/components/stats-card";
import { Users, Building2, UserCheck, UserX } from "lucide-react";
import { TodayAttendanceTable } from "./today-attendance-table";
import { RecentActivityFeed } from "./recent-activity-feed";

export default async function DashboardPage() {
  const [stats, todayAttendance, recentActivity] = await Promise.all([
    getDashboardStats(),
    getTodayAttendance(),
    getRecentActivity(10),
  ]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Developers"
          value={stats.totalActiveDevelopers}
          description="Currently placed developers"
          icon={Users}
          iconColor="text-emerald-400"
        />
        <StatsCard
          title="Client Companies"
          value={stats.totalCompanies}
          description="Total partner companies"
          icon={Building2}
          iconColor="text-blue-400"
        />
        <StatsCard
          title="Present Today"
          value={stats.presentToday}
          description="Checked in today"
          icon={UserCheck}
          iconColor="text-green-400"
        />
        <StatsCard
          title="Absent Today"
          value={stats.absentToday}
          description="Not checked in"
          icon={UserX}
          iconColor="text-red-400"
        />
      </div>

      {/* Today's Attendance */}
      <TodayAttendanceTable developers={todayAttendance} />

      {/* Recent Activity Feed */}
      <RecentActivityFeed activities={recentActivity} />
    </div>
  );
}
