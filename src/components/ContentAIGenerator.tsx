'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Send, Copy, Check } from 'lucide-react';
import { CONTENT_TYPE_CONFIG, type ContentType } from '@/lib/content-ai';

type TabType = 'resume' | 'content-ai';

export default function ContentAIGenerator() {
  const [activeTab, setActiveTab] = useState<TabType>('content-ai');
  const [selectedType, setSelectedType] = useState<ContentType>('blog_post');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/content-ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), type: selectedType }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate content');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setPrompt('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">ContentAI Generator</h2>
        <p className="mt-1 text-sm text-muted">
          Generate SEO-optimized blog posts, social media content, product descriptions, and
          more with AI.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {(Object.entries(CONTENT_TYPE_CONFIG) as [ContentType, { label: string }][]).map(
          ([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                selectedType === key
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              {config.label}
            </button>
          )
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="prompt" className="block text-sm font-medium text-foreground">
          What do you want to generate?
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe the ${CONTENT_TYPE_CONFIG[selectedType].label.toLowerCase()} you want to create...`}
          rows={5}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">
            {prompt.length}/10,000 characters
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Clear
            </button>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error/20 bg-error/5 p-4">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Generated Result</h3>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <pre className="whitespace-pre-wrap text-sm text-foreground">{result}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
