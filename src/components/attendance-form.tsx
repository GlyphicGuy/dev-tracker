"use client";

import { useState } from "react";
import { logAttendance } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { todayDateString } from "@/lib/utils";

interface AttendanceFormProps {
  developerId: string;
  developerName: string;
  trigger: React.ReactElement;
  onSuccess?: () => void;
}

export function AttendanceForm({
  developerId,
  developerName,
  trigger,
  onSuccess,
}: AttendanceFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("present");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.set("developer_id", developerId);
    formData.set("status", status);

    try {
      const result = await logAttendance(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Attendance logged successfully");
        setOpen(false);
        onSuccess?.();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Attendance</DialogTitle>
          <DialogDescription>
            Log attendance for{" "}
            <span className="font-medium text-foreground">{developerName}</span>
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={todayDateString()}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Status *</Label>
              <Select
                value={status}
                onValueChange={(v) => v !== null && setStatus(v)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_in_time">Check In</Label>
              <Input
                id="check_in_time"
                name="check_in_time"
                type="time"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_out_time">Check Out</Label>
              <Input
                id="check_out_time"
                name="check_out_time"
                type="time"
                disabled={loading}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="hours_logged">Hours Logged</Label>
              <Input
                id="hours_logged"
                name="hours_logged"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="8"
                disabled={loading}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="work_summary">Work Summary</Label>
              <Textarea
                id="work_summary"
                name="work_summary"
                placeholder="What was worked on today..."
                rows={3}
                disabled={loading}
              />
            </div>
          </div>
          <input type="hidden" name="logged_by" value="Admin" />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging...
                </>
              ) : (
                "Log Attendance"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
