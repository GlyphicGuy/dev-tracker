export default function DeveloperProfileLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 rounded-lg bg-muted/50" />
      <div className="h-48 rounded-xl bg-muted/50 border border-border/40" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted/50 border border-border/40" />
        ))}
      </div>
      <div className="h-72 rounded-xl bg-muted/50 border border-border/40" />
    </div>
  );
}
