export default function DevelopersLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="h-9 w-44 rounded-lg bg-muted/50 border border-border/40" />
          <div className="h-9 w-36 rounded-lg bg-muted/50 border border-border/40" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-muted/50 border border-border/40" />
      </div>
      <div className="h-[400px] rounded-xl bg-muted/50 border border-border/40" />
    </div>
  );
}
