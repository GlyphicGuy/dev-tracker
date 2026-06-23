import { getCompanyDevelopersWithStats } from "@/actions/developers";
import { DevelopersClient } from "./developers-client";

export default async function DevelopersPage() {
  const developers = await getCompanyDevelopersWithStats();

  return <DevelopersClient developers={developers} />;
}
