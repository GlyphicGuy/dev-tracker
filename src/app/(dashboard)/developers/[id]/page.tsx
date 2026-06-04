import { getDeveloper } from "@/actions/developers";
import {
  getDeveloperAttendance,
  getMonthlyStats,
} from "@/actions/attendance";
import { DeveloperProfileClient } from "./developer-profile-client";
import { notFound } from "next/navigation";

export default async function DeveloperProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const now = new Date();
    const [developer, attendanceData, monthlyStats] = await Promise.all([
      getDeveloper(id),
      getDeveloperAttendance(id, 1, 20),
      getMonthlyStats(id, now.getFullYear(), now.getMonth() + 1),
    ]);

    return (
      <DeveloperProfileClient
        developer={developer}
        attendanceData={attendanceData}
        monthlyStats={monthlyStats}
      />
    );
  } catch {
    notFound();
  }
}
