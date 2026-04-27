"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CONTENT_TYPE_CONFIG, ContentType } from "@/lib/ai";
import { Clock, Copy, Check, Trash2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

interface Generation {
  id: string;
  type: ContentType;
  prompt: string;
  result: string;
  model: string;
  provider: string;
  tokens_input: number;
  tokens_output: number;
  created_at: string;
}

interface HistoryResponse {
  generations: Generation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const contentTypeLabels: Record<string, string> = Object.fromEntries(
  Object.entries(CONTENT_TYPE_CONFIG).map(([k, v]) => [k, v.label])
);

function useHistoryFetcher() {
  const [history, setHistory] = useState<Generation[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async (p: number, type?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "10" });
      if (type && type !== "all") params.set("type", type);
      const res = await fetch(`/api/ai/history?${params}`);
      if (res.ok) {
        const data: HistoryResponse = await res.json();
        setHistory(data.generations);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  function removeGeneration(id: string) {
    setHistory((prev) => prev.filter((g) => g.id !== id));
    setTotal((prev) => prev - 1);
  }

  return { history, total, totalPages, loading, fetchHistory, removeGeneration };
}

export default function HistoryPage() {
  const { history, total, totalPages, loading, fetchHistory, removeGeneration } = useHistoryFetcher();
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const initialFetchRef = useRef(false);

  useEffect(() => {
    if (!initialFetchRef.current) {
      initialFetchRef.current = true;
      fetchHistory(page, filterType);
    }
  }, [fetchHistory, page, filterType]);

  function handlePageChange(newPage: number) {
    setPage(newPage);
    fetchHistory(newPage, filterType);
  }

  function handleFilterChange(type: string) {
    setFilterType(type);
    setPage(1);
    fetchHistory(1, type);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/ai/history?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        removeGeneration(id);
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(null);
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Generation History</h1>
          <p className="text-muted-foreground">
            {total} generation{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchHistory(page, filterType)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={filterType === "all" ? "default" : "secondary"}
          className="cursor-pointer px-3 py-1.5 text-sm"
          onClick={() => handleFilterChange("all")}
        >
          All
        </Badge>
        {Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => (
          <Badge
            key={key}
            variant={filterType === key ? "default" : "secondary"}
            className="cursor-pointer px-3 py-1.5 text-sm"
            onClick={() => handleFilterChange(key)}
          >
            {config.label}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading history...</div>
        </div>
      ) : history.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">No generations yet</p>
              <p className="text-sm mt-1">Start creating content to see your history here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((gen) => (
            <Card key={gen.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{contentTypeLabels[gen.type] || gen.type}</CardTitle>
                    <Badge variant="outline" className="text-xs">{gen.provider}</Badge>
                    <Badge variant="outline" className="text-xs">{gen.model}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(gen.created_at)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(gen.result, gen.id)}
                    >
                      {copied === gen.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(gen.id)}
                      disabled={deleting === gen.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">{gen.prompt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed line-clamp-6">
                  {gen.result}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{gen.tokens_input} input tokens</span>
                  <span>{gen.tokens_output} output tokens</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}