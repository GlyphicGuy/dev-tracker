"use client";

import { useState } from "react";
import { createCompany, updateCompany } from "@/actions/companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { Company } from "@/lib/types";

interface CompanyFormProps {
  company?: Company;
  trigger: React.ReactElement;
  onSuccess?: () => void;
}

export function CompanyForm({ company, trigger, onSuccess }: CompanyFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enableLogin, setEnableLogin] = useState(false);
  const isEdit = !!company;
  const hasExistingLogin = !!company?.auth_user_id;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = isEdit
        ? await updateCompany(company!.id, formData)
        : await createCompany(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(
          isEdit
            ? "Company/Client updated successfully"
            : "Company/Client added successfully"
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Company/Client" : "Add Company/Client"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the company or client details below."
              : "Fill in the details to add a new company or client."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company/Client Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={company?.name || ""}
              placeholder="Acme Corp"
              required
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                name="contact_person"
                defaultValue={company?.contact_person || ""}
                placeholder="John Smith"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                defaultValue={company?.contact_email || ""}
                placeholder="john@acme.com"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Number</Label>
              <Input
                id="contact_phone"
                name="contact_phone"
                defaultValue={company?.contact_phone || ""}
                placeholder="+1 234 567 890"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                name="industry"
                defaultValue={company?.industry || ""}
                placeholder="Technology, Finance, etc."
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website_url">Website</Label>
            <Input
              id="website_url"
              name="website_url"
              type="url"
              defaultValue={company?.website_url || ""}
              placeholder="https://acme.com"
              disabled={loading}
            />
          </div>

          {/* ── Portal Login Credentials ── */}
          {hasExistingLogin ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">
                Portal login account is active
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enable_company_login"
                  checked={enableLogin}
                  onChange={(e) => setEnableLogin(e.target.checked)}
                  className="rounded border-border"
                  disabled={loading}
                />
                <Label htmlFor="enable_company_login" className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                  Create portal login account
                </Label>
              </div>
              {enableLogin && (
                <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label htmlFor="login_email">Login Email *</Label>
                    <Input
                      id="login_email"
                      name="login_email"
                      type="email"
                      placeholder="company@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login_password">Password *</Label>
                    <Input
                      id="login_password"
                      name="login_password"
                      type="password"
                      placeholder="Min 6 characters"
                      minLength={6}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

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
                "Update Company/Client"
              ) : (
                "Add Company/Client"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
