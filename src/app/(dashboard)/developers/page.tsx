import { getDevelopers } from "@/actions/developers";
import { getCompanies } from "@/actions/companies";
import { DevelopersClient } from "./developers-client";

export default async function DevelopersPage() {
  const [developers, companies] = await Promise.all([
    getDevelopers(),
    getCompanies(),
  ]);

  return <DevelopersClient developers={developers} companies={companies} />;
}
