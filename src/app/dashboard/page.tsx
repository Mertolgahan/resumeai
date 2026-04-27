'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ResumeInputForm from '@/components/ResumeInputForm';
import ResumePreview from '@/components/ResumePreview';
import CoverLetterGenerator from '@/components/CoverLetterGenerator';
import ContentAIGenerator from '@/components/ContentAIGenerator';
import { ResumeInputData, GeneratedResume } from '@/types';
import { FileText, Mail, Sparkles, Loader2 } from 'lucide-react';

type Tab = 'resume' | 'cover-letter' | 'content-ai';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('resume');
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan] = useState<'free' | 'pro' | 'lifetime'>('free');
  const [resumesGenerated, setResumesGenerated] = useState(0);

  const handleGenerateResume = async (inputData: ResumeInputData) => {
    if (plan === 'free' && resumesGenerated >= 1) {
      setError('Free plan allows 1 resume. Upgrade to Pro for unlimited resumes.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate resume');
      }

      const data = await response.json();
      setGeneratedResume(data.resume);
      setResumesGenerated((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted-bg">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-muted">
              {plan === 'free'
                ? `Free plan — ${1 - resumesGenerated} resume${1 - resumesGenerated !== 1 ? 's' : ''} remaining`
                : `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan — Unlimited`}
            </p>
          </div>

          {plan === 'free' && resumesGenerated >= 1 && (
            <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">You've used your free resume</p>
                  <p className="text-sm text-muted">
                    Upgrade to Pro for unlimited resumes, cover letters, and ContentAI.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 flex gap-1 rounded-lg border border-border bg-background p-1">
            {(
              [
                { key: 'resume' as Tab, label: 'Resume Builder', icon: FileText },
                { key: 'cover-letter' as Tab, label: 'Cover Letter', icon: Mail },
                { key: 'content-ai' as Tab, label: 'ContentAI', icon: Sparkles },
              ] as { key: Tab; label: string; icon: React.ElementType }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key ? 'bg-primary text-white' : 'text-muted hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-error/20 bg-error/5 p-4">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <ResumeInputForm onSubmit={handleGenerateResume} isLoading={isLoading} />
              </div>
              <div>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-background p-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-medium">AI is crafting your resume...</p>
                    <p className="mt-1 text-sm text-muted">This usually takes 10-15 seconds</p>
                  </div>
                ) : generatedResume ? (
                  <ResumePreview resume={generatedResume} plan={plan} />
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background p-12">
                    <FileText className="h-16 w-16 text-muted/30" />
                    <p className="mt-4 text-lg font-medium text-muted">Your AI-generated resume will appear here</p>
                    <p className="mt-1 text-sm text-muted/60">Fill in your details and click Generate</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'cover-letter' &&
            (plan === 'pro' || plan === 'lifetime' ? (
              <CoverLetterGenerator plan={plan} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-background p-12">
                <Mail className="h-16 w-16 text-muted/30" />
                <p className="mt-4 text-lg font-medium text-muted">Cover letters are a Pro feature</p>
                <p className="mt-1 text-sm text-muted">Upgrade to generate cover letters alongside your resumes</p>
                <button className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark">
                  Upgrade to Pro — $9/month
                </button>
              </div>
            ))}

          {activeTab === 'content-ai' && (
            <div className="mx-auto max-w-3xl">
              <ContentAIGenerator />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
