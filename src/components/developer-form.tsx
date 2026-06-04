"use client";

import { useState, useEffect } from "react";
import { createDeveloper, updateDeveloper } from "@/actions/developers";
import { getCompanies } from "@/actions/companies";
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
import type { Developer, Company } from "@/lib/types";

interface DeveloperFormProps {
  developer?: Developer;
  trigger: React.ReactElement;
  onSuccess?: () => void;
}

export function DeveloperForm({
  developer,
  trigger,
  onSuccess,
}: DeveloperFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [status, setStatus] = useState(developer?.status || "active");
  const [companyId, setCompanyId] = useState(developer?.company_id || "");
  const isEdit = !!developer;

  useEffect(() => {
    if (open) {
      getCompanies().then(setCompanies).catch(console.error);
    }
  }, [open]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    // Add the select values that aren't natively in formData
    formData.set("status", status);
    formData.set("company_id", companyId);

    try {
      const result = isEdit
        ? await updateDeveloper(developer!.id, formData)
        : await createDeveloper(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(
          isEdit
            ? "Developer updated successfully"
            : "Developer added successfully"
        );
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Developer" : "Add Developer"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the developer profile details."
              : "Fill in the details to add a new developer to the platform."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={developer?.full_name || ""}
                placeholder="Jane Doe"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={developer?.email || ""}
                placeholder="jane@email.com"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={developer?.phone || ""}
                placeholder="+1 234 567 890"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                defaultValue={developer?.role || ""}
                placeholder="React Developer"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tech_stack">Tech Stack</Label>
              <Input
                id="tech_stack"
                name="tech_stack"
                defaultValue={developer?.tech_stack || ""}
                placeholder="React, Node.js, Python"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Select
                value={companyId}
                onValueChange={(v) => v !== null && setCompanyId(v)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No company</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => v !== null && setStatus(v)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={developer?.start_date || ""}
                disabled={loading}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={developer?.notes || ""}
                placeholder="Additional notes about this developer..."
                rows={3}
                disabled={loading}
              />
            </div>
          </div>
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
                  {isEdit ? "Updating..." : "Adding..."}
                </>
              ) : isEdit ? (
                "Update Developer"
              ) : (
                "Add Developer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
