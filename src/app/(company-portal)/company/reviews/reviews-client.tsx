"use client";

import { useState, useTransition } from "react";
import { approveSession, rejectSession, approveAllPending } from "@/actions/reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  User,
  CheckSquare,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, getInitials } from "@/lib/utils";
import type { WorkSession } from "@/lib/types";

interface ReviewsClientProps {
  reviews: WorkSession[];
}

export function ReviewsClient({ reviews }: ReviewsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [isBulkApproving, setIsBulkApproving] = useState(false);

  function handleApprove(sessionId: string) {
    setActionId(sessionId);
    startTransition(async () => {
      const result = await approveSession(sessionId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Session approved! ✓");
      }
      setActionId(null);
    });
  }

  function handleBulkApprove() {
    setIsBulkApproving(true);
    startTransition(async () => {
      const result = await approveAllPending();
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.message);
      }
      setIsBulkApproving(false);
    });
  }

  function handleReject(sessionId: string) {
    if (!rejectNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setActionId(sessionId);
    startTransition(async () => {
      const result = await rejectSession(sessionId, rejectNotes);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Session rejected");
        setRejectingId(null);
        setRejectNotes("");
      }
      setActionId(null);
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pending Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve your developers&apos; work submissions
          </p>
        </div>
        {reviews.length > 0 && (
          <Button
            onClick={handleBulkApprove}
            disabled={isPending || isBulkApproving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap"
          >
            {isPending && isBulkApproving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckSquare className="h-4 w-4 mr-2" />
            )}
            Approve All
          </Button>
        )}
      </div>

      {reviews.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="py-12">
            <EmptyState
              icon={ClipboardCheck}
              title="All caught up!"
              description="No pending reviews at the moment. Check back later."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((session) => (
            <Card
              key={session.id}
              className="border-border/50 bg-card/50 hover:border-border/80 transition-colors"
            >
              <CardContent className="pt-5 pb-5">
                <div className="flex flex-col gap-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-500/10 text-blue-400 text-sm">
                          {getInitials(
                            session.developers?.full_name || "?"
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {session.developers?.full_name || "Unknown Developer"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(session.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-blue-500/15 text-blue-400 border-blue-500/20"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {session.duration_minutes
                          ? `${Math.floor(session.duration_minutes / 60)}h ${session.duration_minutes % 60}m`
                          : "—"}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {session.work_description || "No description provided"}
                    </p>
                  </div>

                  {/* Reject notes input */}
                  {rejectingId === session.id && (
                    <div className="space-y-2">
                      <Textarea
                        value={rejectNotes}
                        onChange={(e) => setRejectNotes(e.target.value)}
                        placeholder="Reason for rejection..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end">
                    {rejectingId === session.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectNotes("");
                          }}
                          disabled={isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleReject(session.id)}
                          disabled={isPending && actionId === session.id}
                        >
                          {isPending && actionId === session.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-1" />
                          )}
                          Confirm Reject
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                          onClick={() => setRejectingId(session.id)}
                          disabled={isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleApprove(session.id)}
                          disabled={isPending && actionId === session.id}
                        >
                          {isPending && actionId === session.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                          )}
                          Approve
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
