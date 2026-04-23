"use client";

import { GeneratedResume } from "@/types";
import { Download, Copy } from "@/components/Icons";
import toast from "react-hot-toast";

interface ResumePreviewProps {
  resume: GeneratedResume;
  plan: "free" | "pro" | "lifetime";
}

export default function ResumePreview({ resume, plan }: ResumePreviewProps) {
  const handleCopy = () => {
    const text = formatResumeAsText(resume);
    navigator.clipboard.writeText(text);
    toast.success("Resume copied to clipboard!");
  };

  const handleDownloadPDF = () => {
    const text = formatResumeAsText(resume);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Resume downloaded!");
  };

  return (
    <div className="rounded-2xl border border-border bg-background overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <h3 className="font-semibold">Generated Resume</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted-bg"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      <div className="p-6">
        {plan === "free" && (
          <div className="mb-4 rounded-lg border border-warning/20 bg-warning/5 p-3 text-sm text-warning">
            Free plan — resumes include a watermark. Upgrade to Pro for clean
            PDFs.
          </div>
        )}

        <div className="prose prose-sm max-w-none">
          <div className="mb-6 border-b border-border pb-4">
            <h1 className="text-2xl font-bold text-foreground">
              {resume.headline}
            </h1>
            <p className="mt-2 text-muted">{resume.summary}</p>
          </div>

          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Experience
            </h2>
            {resume.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {exp.title}
                    </h3>
                    <p className="text-sm text-muted">{exp.company}</p>
                  </div>
                  <span className="text-sm text-muted">
                    {exp.startDate} — {exp.endDate}
                  </span>
                </div>
                <ul className="mt-2 space-y-1">
                  {exp.bullets.map((bullet, bi) => (
                    <li
                      key={bi}
                      className="text-sm text-muted"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Education
            </h2>
            {resume.education.map((edu, index) => (
              <div key={index} className="mb-2">
                <h3 className="font-semibold text-foreground">
                  {edu.degree} in {edu.field}
                </h3>
                <p className="text-sm text-muted">
                  {edu.institution} — {edu.year}
                </p>
                {edu.details && (
                  <p className="text-sm text-muted">{edu.details}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.technical.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {skill}
                </span>
              ))}
              {resume.skills.soft.map((skill, index) => (
                <span
                  key={`soft-${index}`}
                  className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {resume.certifications && resume.certifications.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                Certifications
              </h2>
              <ul className="space-y-1">
                {resume.certifications.map((cert, index) => (
                  <li key={index} className="text-sm text-muted">
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {plan === "free" && (
          <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-sm font-medium text-primary">
              Want unlimited resumes, cover letters, and ATS optimization?
            </p>
            <button className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
              Upgrade to Pro — $9/month
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatResumeAsText(resume: GeneratedResume): string {
  let text = `${resume.headline}\n\n`;
  text += `SUMMARY\n${resume.summary}\n\n`;

  text += `EXPERIENCE\n`;
  resume.experience.forEach((exp) => {
    text += `\n${exp.title} — ${exp.company}\n`;
    text += `${exp.startDate} — ${exp.endDate}\n`;
    exp.bullets.forEach((b) => (text += `  • ${b}\n`));
  });

  text += `\nEDUCATION\n`;
  resume.education.forEach((edu) => {
    text += `${edu.degree} in ${edu.field} — ${edu.institution}, ${edu.year}\n`;
  });

  text += `\nSKILLS\n`;
  text += `Technical: ${resume.skills.technical.join(", ")}\n`;
  text += `Soft: ${resume.skills.soft.join(", ")}\n`;

  if (resume.certifications?.length) {
    text += `\nCERTIFICATIONS\n`;
    resume.certifications.forEach((c) => (text += `• ${c}\n`));
  }

  return text;
}