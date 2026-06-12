"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { startSession, stopSession } from "@/actions/work-sessions";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn, LogOut, Clock } from "lucide-react";
import { toast } from "sonner";
import type { WorkSession } from "@/lib/types";

interface TimerWidgetProps {
  session: WorkSession | null;
}

export function TimerWidget({ session }: TimerWidgetProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isPending, startTransition] = useTransition();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isRunning = session?.status === "running";
  const isStopped = session?.status === "stopped";
  const isSubmitted =
    session?.status === "submitted" || session?.status === "approved";

  useEffect(() => {
    if (isRunning && session?.start_time) {
      const startTime = new Date(session.start_time).getTime();

      const updateElapsed = () => {
        const now = Date.now();
        setElapsed(Math.floor((now - startTime) / 1000));
      };

      updateElapsed();
      intervalRef.current = setInterval(updateElapsed, 1000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else if (isStopped && session?.duration_minutes) {
      setElapsed(session.duration_minutes * 60);
    } else {
      setElapsed(0);
    }
  }, [isRunning, isStopped, session?.start_time, session?.duration_minutes]);

  function formatElapsed(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    }
    return `${m}m ${s}s`;
  }

  function handleStart() {
    startTransition(async () => {
      const result = await startSession();
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Checked in successfully! Have a great day 👋");
      }
    });
  }

  function handleStop() {
    startTransition(async () => {
      const result = await stopSession();
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Checked out successfully. Don't forget to submit your work!");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Friendly Status & Subtle Time */}
      <div className="text-center space-y-2">
        {isRunning && (
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              You are checked in
            </div>
            <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
              <Clock className="h-4 w-4" />
              <span>{formatElapsed(elapsed)} elapsed</span>
            </div>
          </div>
        )}
        
        {isStopped && (
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-medium">
              You are checked out
            </div>
            <div className="text-muted-foreground text-sm">
              Total time: <span className="font-mono">{formatElapsed(elapsed)}</span>
            </div>
          </div>
        )}
        
        {isSubmitted && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium">
            ✓ Work submitted for today
          </div>
        )}
        
        {!session && (
          <p className="text-muted-foreground text-sm">
            Ready to start your day? Click below to check in.
          </p>
        )}
      </div>

      {/* Primary Action Controls */}
      <div className="flex gap-4">
        {!session || session.status === "rejected" ? (
          <Button
            onClick={handleStart}
            disabled={isPending}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 hover:scale-[1.02]"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-5 w-5" />
            )}
            Check In
          </Button>
        ) : isRunning ? (
          <Button
            onClick={handleStop}
            disabled={isPending}
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:scale-[1.02]"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-5 w-5" />
            )}
            Check Out
          </Button>
        ) : null}
      </div>
    </div>
  );
}

