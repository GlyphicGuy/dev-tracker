"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Papa from "papaparse";

interface CsvExportProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  filename?: string;
  headers?: Record<string, string>;
}

export function CsvExport({
  data,
  filename = "attendance-export",
  headers,
}: CsvExportProps) {
  function handleExport() {
    if (data.length === 0) return;

    // Transform data using headers mapping if provided
    const exportData = headers
      ? data.map((row) => {
          const mapped: Record<string, string | number> = {};
          Object.entries(headers).forEach(([key, label]) => {
            // Support nested keys like "developers.full_name"
            const value = key.split(".").reduce((obj, k) => obj?.[k], row);
            mapped[label] = value ?? "";
          });
          return mapped;
        })
      : data;

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={data.length === 0}
    >
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
