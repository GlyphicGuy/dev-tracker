"use client";

import { useRouter } from "next/navigation";
import NProgress from "nprogress";
import { deleteCompany } from "@/actions/companies";
import { CompanyForm } from "@/components/company-form";
import { DeveloperStatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate, getInitials } from "@/lib/utils";
import {
  Building2,
  Mail,
  User,
  Briefcase,
  ArrowLeft,
  Pencil,
  Trash2,
  Users,
  Phone,
  Globe,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import type { Company, Developer } from "@/lib/types";

export function CompanyDetailClient({
  company,
  developers,
}: {
  company: Company;
  developers: Developer[];
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this company/client?")) return;
    const result = await deleteCompany(company.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Company/Client deleted");
      router.push("/companies");
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { NProgress.start(); router.push("/companies"); }}
        className="text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Companies
      </Button>

      {/* Company Info Card */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Building2 className="h-7 w-7 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{company.name}</h2>
                <div className="mt-2 space-y-1">
                  {company.contact_person && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span>{company.contact_person}</span>
                    </div>
                  )}
                  {company.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{company.contact_email}</span>
                    </div>
                  )}
                  {company.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{company.contact_phone}</span>
                    </div>
                  )}
                  {company.industry && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{company.industry}</span>
                    </div>
                  )}
                  {company.website_url && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <a
                        href={company.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      >
                        {company.website_url.replace(/^https?:\/\//, "")}
                        <ExternalLink className="h-3 w-3 opacity-50" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <CompanyForm
                company={company}
                trigger={
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </Button>
                }
                onSuccess={() => router.refresh()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="opacity-30" />

      {/* Assigned Developers */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assigned Developers ({developers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {developers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No developers assigned"
              description="No developers are currently assigned to this company."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                      Developer
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 hidden sm:table-cell">
                      Role
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden md:table-cell">
                      Start Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {developers.map((dev) => (
                    <tr
                      key={dev.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => { NProgress.start(); router.push(`/developers/${dev.id}`); }}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(dev.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {dev.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {dev.email || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {dev.role || "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <DeveloperStatusBadge status={dev.status} />
                      </td>
                      <td className="py-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(dev.start_date)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
