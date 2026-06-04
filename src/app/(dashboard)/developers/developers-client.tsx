"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DeveloperForm } from "@/components/developer-form";
import { DeveloperStatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, getInitials } from "@/lib/utils";
import { Users, Plus } from "lucide-react";
import type { Developer, Company } from "@/lib/types";

export function DevelopersClient({
  developers,
  companies,
}: {
  developers: Developer[];
  companies: Company[];
}) {
  const router = useRouter();
  const [companyFilter, setCompanyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredDevelopers = useMemo(() => {
    return developers.filter((dev) => {
      if (companyFilter !== "all" && dev.company_id !== companyFilter)
        return false;
      if (statusFilter !== "all" && dev.status !== statusFilter) return false;
      return true;
    });
  }, [developers, companyFilter, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={companyFilter} onValueChange={(v) => v !== null && setCompanyFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => v !== null && setStatusFilter(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DeveloperForm
          trigger={
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Developer
            </Button>
          }
          onSuccess={() => router.refresh()}
        />
      </div>

      {filteredDevelopers.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent>
            <EmptyState
              icon={Users}
              title={
                developers.length === 0
                  ? "No developers added yet"
                  : "No developers match filters"
              }
              description={
                developers.length === 0
                  ? "Add your first developer to start tracking attendance."
                  : "Try adjusting your filters to see more results."
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">
              Developers ({filteredDevelopers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                      Developer
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 hidden sm:table-cell">
                      Company
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 hidden md:table-cell">
                      Role
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden lg:table-cell">
                      Start Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredDevelopers.map((dev) => (
                    <tr
                      key={dev.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => router.push(`/developers/${dev.id}`)}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
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
                          {dev.companies?.name || "Unassigned"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {dev.role || "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <DeveloperStatusBadge status={dev.status} />
                      </td>
                      <td className="py-3 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(dev.start_date)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
