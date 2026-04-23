"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface CoverLetterGeneratorProps {
  plan?: "pro" | "lifetime";
}

export default function CoverLetterGenerator(
  _props: CoverLetterGeneratorProps
) {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [whyThisRole, setWhyThisRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!jobTitle || !companyName || !experienceSummary) {
      toast.error("Please fill in the required fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName,
          jobTitle,
          companyName,
          experienceSummary,
          skills: skillsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          whyThisRole,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate cover letter");
      }

      const data = await response.json();
      setCoverLetter(data.coverLetter);
      toast.success("Cover letter generated!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate cover letter"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-border bg-background p-6">
        <h2 className="text-xl font-semibold">
          Cover Letter Generator
        </h2>
        <p className="text-sm text-muted">
          Create tailored cover letters for each job application.
        </p>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Job Title <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Senior Software Engineer"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Company Name <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Google, Meta, Startup Inc..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Experience Summary <span className="text-error">*</span>
          </label>
          <textarea
            rows={4}
            value={experienceSummary}
            onChange={(e) => setExperienceSummary(e.target.value)}
            placeholder="Brief summary of your relevant experience..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Key Skills (comma-separated)
          </label>
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="JavaScript, Leadership, Project Management..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Why This Role? (optional)
          </label>
          <textarea
            rows={2}
            value={whyThisRole}
            onChange={(e) => setWhyThisRole(e.target.value)}
            placeholder="What excites you about this position?"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Cover Letter"
          )}
        </button>
      </div>

      <div>
        {coverLetter ? (
          <div className="rounded-2xl border border-border bg-background overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
              <h3 className="font-semibold">Generated Cover Letter</h3>
              <button
                onClick={handleCopy}
                className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted-bg"
              >
                Copy
              </button>
            </div>
            <div className="p-6">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {coverLetter}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background p-12">
            <p className="text-lg font-medium text-muted">
              Your cover letter will appear here
            </p>
            <p className="mt-1 text-sm text-muted/60">
              Fill in the details and click Generate
            </p>
          </div>
        )}
      </div>
    </div>
  );
}