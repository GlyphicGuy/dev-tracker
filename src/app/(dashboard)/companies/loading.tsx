export default function CompaniesLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-muted/50" />
        <div className="h-9 w-36 rounded-lg bg-muted/50 border border-border/40" />
      </div>
      <div className="h-[400px] rounded-xl bg-muted/50 border border-border/40" />
    </div>
  );
}
