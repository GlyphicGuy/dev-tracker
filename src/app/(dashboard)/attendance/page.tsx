import { getAttendanceLogs } from "@/actions/attendance";
import { getDevelopers } from "@/actions/developers";
import { getCompanies } from "@/actions/companies";
import { AttendanceLogClient } from "./attendance-log-client";

export default async function AttendanceLogPage() {
  const [attendanceData, developers, companies] = await Promise.all([
    getAttendanceLogs({ limit: 50 }),
    getDevelopers(),
    getCompanies(),
  ]);

  return (
    <AttendanceLogClient
      initialData={attendanceData}
      developers={developers}
      companies={companies}
    />
  );
}
