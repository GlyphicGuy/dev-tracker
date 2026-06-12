import { getReviewHistory } from "@/actions/reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { History, CheckCircle2, XCircle } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";

export default async function ReviewHistoryPage() {
  const history = await getReviewHistory(30);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Past approved and rejected submissions
        </p>
      </div>

      {history.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="py-12">
            <EmptyState
              icon={History}
              title="No review history yet"
              description="Approved and rejected submissions will appear here."
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              All Reviews
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {history.length} records
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-3 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(
                          session.developers?.full_name || "?"
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {session.developers?.full_name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                        {session.work_description || "No description"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(session.date)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {session.duration_minutes
                        ? `${Math.round((session.duration_minutes / 60) * 10) / 10}h`
                        : "—"}
                    </span>
                    {session.status === "approved" ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-xs"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-500/15 text-red-400 border-red-500/20 text-xs"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
