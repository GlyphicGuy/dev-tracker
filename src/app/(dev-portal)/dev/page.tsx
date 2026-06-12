import { getDeveloperForCurrentUser } from "@/lib/auth-helpers";
import {
  getMyTodaySession,
  getMyRecentSessions,
} from "@/actions/work-sessions";
import { redirect } from "next/navigation";
import { DevPortalClient } from "./dev-client";

export default async function DevPortalPage() {
  const developer = await getDeveloperForCurrentUser();

  if (!developer) {
    redirect("/");
  }

  const [todaySession, recentSessions] = await Promise.all([
    getMyTodaySession(),
    getMyRecentSessions(7),
  ]);

  return (
    <DevPortalClient
      developer={developer}
      todaySession={todaySession}
      recentSessions={recentSessions}
    />
  );
}
