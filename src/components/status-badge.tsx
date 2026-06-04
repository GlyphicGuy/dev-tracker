import { Badge } from "@/components/ui/badge";
import {
  cn,
  getAttendanceStatusColor,
  getAttendanceStatusLabel,
  getDeveloperStatusColor,
  getDeveloperStatusLabel,
} from "@/lib/utils";
import type { AttendanceStatus, DeveloperStatus } from "@/lib/types";

export function AttendanceStatusBadge({
  status,
}: {
  status: AttendanceStatus;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium text-xs", getAttendanceStatusColor(status))}
    >
      {getAttendanceStatusLabel(status)}
    </Badge>
  );
}

export function DeveloperStatusBadge({
  status,
}: {
  status: DeveloperStatus;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium text-xs", getDeveloperStatusColor(status))}
    >
      {getDeveloperStatusLabel(status)}
    </Badge>
  );
}
