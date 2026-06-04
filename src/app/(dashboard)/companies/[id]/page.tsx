import { getCompanyWithDevelopers } from "@/actions/companies";
import { CompanyDetailClient } from "./company-detail-client";
import { notFound } from "next/navigation";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const data = await getCompanyWithDevelopers(id);
    return (
      <CompanyDetailClient company={data.company} developers={data.developers} />
    );
  } catch {
    notFound();
  }
}
