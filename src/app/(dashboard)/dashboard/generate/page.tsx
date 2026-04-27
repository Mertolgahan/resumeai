"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CONTENT_TYPE_CONFIG, ContentType } from "@/lib/ai";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";

const contentTypes = Object.entries(CONTENT_TYPE_CONFIG) as [ContentType, typeof CONTENT_TYPE_CONFIG[ContentType]][];

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedType, setSelectedType] = useState<ContentType>("blog_post");
  const [result, setResult] = useState<string | null>(null);
  const [streamingResult, setStreamingResult] = useState<string>("");
  const [provider, setProvider] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setResult(null);
    setStreamingResult("");

    try {
      const res = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          type: selectedType,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Generation failed");
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("No response body");
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let fullText = "";
      let doneData: { model?: string; provider?: string } = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (!data.trim()) continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === "token" && parsed.content) {
              fullText += parsed.content;
              setStreamingResult(fullText);
            } else if (parsed.type === "done") {
              doneData = parsed;
            } else if (parsed.type === "error") {
              setError(parsed.error);
            }
          } catch {
            // skip
          }
        }
      }

      setResult(fullText);
      setProvider(doneData.provider || null);
      setModel(doneData.model || null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // aborted, no error
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
      setStreamingResult("");
    }
  }

  function handleCopy() {
    const textToCopy = result || streamingResult;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayResult = result || streamingResult;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Content Generator</h1>
        <p className="text-muted-foreground">
          Generate SEO-optimized content with AI
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Type</CardTitle>
              <CardDescription>Select the type of content to generate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {contentTypes.map(([key, config]) => (
                  <Badge
                    key={key}
                    variant={selectedType === key ? "default" : "secondary"}
                    className="cursor-pointer px-3 py-1.5 text-sm"
                    onClick={() => setSelectedType(key)}
                  >
                    {config.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Prompt</CardTitle>
              <CardDescription>
                Describe what you want to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder={`e.g., Write a blog post about sustainable fashion trends in 2025`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  maxLength={10000}
                />
                <p className="text-xs text-muted-foreground">
                  {prompt.length} / 10,000 characters
                </p>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="min-h-[400px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Result</CardTitle>
                {displayResult && (
                  <div className="flex items-center gap-2">
                    {streamingResult && !result && (
                      <Badge variant="outline" className="text-xs animate-pulse">
                        streaming...
                      </Badge>
                    )}
                    {provider && (
                      <Badge variant="outline" className="text-xs">
                        {provider}
                      </Badge>
                    )}
                    {model && (
                      <Badge variant="outline" className="text-xs">
                        {model}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}
              {displayResult ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {displayResult}
                </div>
              ) : !error ? (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <p className="text-center">
                    Generated content will appear here.
                    <br />
                    Select a content type and enter a prompt to get started.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}