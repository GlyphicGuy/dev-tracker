"use client";

import { useRouter } from "next/navigation";
import { CompanyForm } from "@/components/company-form";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Building2, Plus, Users } from "lucide-react";
import type { Company } from "@/lib/types";

export function CompaniesClient({ companies }: { companies: Company[] }) {
  const router = useRouter();

  if (companies.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div />
          <CompanyForm
            trigger={
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Company/Client
              </Button>
            }
            onSuccess={() => router.refresh()}
          />
        </div>
        <Card className="border-border/50 bg-card/50">
          <CardContent>
            <EmptyState
              icon={Building2}
              title="No companies or clients added yet"
              description="Add your first company or client to start assigning developers."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {companies.length} {companies.length === 1 ? "company" : "companies"}
        </p>
        <CompanyForm
          trigger={
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          }
          onSuccess={() => router.refresh()}
        />
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Companies / Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                    Company/Client
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 hidden md:table-cell">
                    Contact
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 hidden sm:table-cell">
                    Industry
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                    Developers
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden lg:table-cell">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className="group cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => router.push(`/companies/${company.id}`)}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <Building2 className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="text-sm font-medium">
                          {company.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {company.contact_person || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {company.contact_email || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {company.industry || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {company.developer_count}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(company.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
