"use client";

import { useState, useTransition } from "react";
import { getAttendanceLogs } from "@/actions/attendance";
import { AttendanceStatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { CsvExport } from "@/components/csv-export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatTime } from "@/lib/utils";
import { CalendarCheck, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AttendanceLog, Developer, Company, ApprovalStatus } from "@/lib/types";

interface AttendanceData {
  logs: AttendanceLog[];
  total: number;
  page: number;
  totalPages: number;
}

export function AttendanceLogClient({
  initialData,
  developers,
  companies,
}: {
  initialData: AttendanceData;
  developers: Developer[];
  companies: Company[];
}) {
  const [data, setData] = useState(initialData);
  const [developerFilter, setDeveloperFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  function applyFilters() {
    startTransition(async () => {
      const filters: Record<string, string | number> = { limit: 50 };
      if (developerFilter !== "all") filters.developer_id = developerFilter;
      if (companyFilter !== "all") filters.company_id = companyFilter;
      if (statusFilter !== "all") filters.status = statusFilter;
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      if (approvalFilter !== "all") filters.approval_status = approvalFilter;

      const result = await getAttendanceLogs(filters);
      setData(result);
    });
  }

  function clearFilters() {
    setDeveloperFilter("all");
    setCompanyFilter("all");
    setStatusFilter("all");
    setApprovalFilter("all");
    setStartDate("");
    setEndDate("");
    startTransition(async () => {
      const result = await getAttendanceLogs({ limit: 50 });
      setData(result);
    });
  }

  const csvHeaders = {
    "developers.full_name": "Developer",
    "developers.companies.name": "Company",
    date: "Date",
    status: "Status",
    check_in_time: "Check In",
    check_out_time: "Check Out",
    hours_logged: "Hours",
    work_summary: "Work Summary",
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <Select
                value={developerFilter}
                onValueChange={(v) => v !== null && setDeveloperFilter(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Developers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Developers</SelectItem>
                  {developers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={companyFilter} onValueChange={(v) => v !== null && setCompanyFilter(v)}>
                <SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>

              <Select value={approvalFilter} onValueChange={(v) => v !== null && setApprovalFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Approvals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Approvals</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />

              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={applyFilters}
                disabled={isPending}
              >
                <Search className="mr-2 h-4 w-4" />
                {isPending ? "Searching..." : "Apply Filters"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearFilters}
                disabled={isPending}
              >
                Clear
              </Button>
              <div className="ml-auto">
                <CsvExport
                  data={data.logs}
                  headers={csvHeaders}
                  filename="attendance-log"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Attendance Logs</span>
            <span className="text-sm font-normal text-muted-foreground">
              {data.total} {data.total === 1 ? "record" : "records"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.logs.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No attendance records found"
              description="Try adjusting your filters or log some attendance first."
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
                      Company
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                      Date
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 hidden md:table-cell">
                      Hours
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden lg:table-cell">
                      Work Summary
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 hidden md:table-cell">
                      Approval
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {data.logs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 pr-4">
                        <span className="text-sm font-medium">
                          {log.developers?.full_name || "Unknown"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {log.developers?.companies?.name || "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm">{formatDate(log.date)}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <AttendanceStatusBadge status={log.status} />
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {log.hours_logged ? `${log.hours_logged}h` : "—"}
                        </span>
                      </td>
                      <td className="py-3 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                          {log.work_summary || "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className={
                            log.approval_status === "approved"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-xs"
                              : log.approval_status === "rejected"
                                ? "bg-red-500/15 text-red-400 border-red-500/20 text-xs"
                                : "bg-amber-500/15 text-amber-400 border-amber-500/20 text-xs"
                          }
                        >
                          {log.approval_status === "approved"
                            ? "Approved"
                            : log.approval_status === "rejected"
                              ? "Rejected"
                              : "Pending"}
                        </Badge>
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
