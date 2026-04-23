"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ResumeInputData, WorkExperience, Education } from "@/types";
import { Plus, Trash2, GenerateResumeIcon } from "@/components/Icons";
import toast from "react-hot-toast";

interface ResumeInputFormProps {
  onSubmit: (data: ResumeInputData) => Promise<void>;
  isLoading: boolean;
}

export default function ResumeInputForm({
  onSubmit,
  isLoading,
}: ResumeInputFormProps) {
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
    { title: "", company: "", startDate: "", endDate: "", description: "" },
  ]);
  const [educationList, setEducationList] = useState<Education[]>([
    { degree: "", field: "", institution: "", year: "" },
  ]);
  const [skills, setSkills] = useState("");
  const { register, handleSubmit } = useForm();

  const addWorkExperience = () => {
    setWorkExperiences([
      ...workExperiences,
      { title: "", company: "", startDate: "", endDate: "", description: "" },
    ]);
  };

  const removeWorkExperience = (index: number) => {
    if (workExperiences.length > 1) {
      setWorkExperiences(workExperiences.filter((_, i) => i !== index));
    }
  };

  const updateWorkExperience = (
    index: number,
    field: keyof WorkExperience,
    value: string
  ) => {
    const updated = [...workExperiences];
    updated[index] = { ...updated[index], [field]: value };
    setWorkExperiences(updated);
  };

  const addEducation = () => {
    setEducationList([
      ...educationList,
      { degree: "", field: "", institution: "", year: "" },
    ]);
  };

  const removeEducation = (index: number) => {
    if (educationList.length > 1) {
      setEducationList(educationList.filter((_, i) => i !== index));
    }
  };

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: string
  ) => {
    const updated = [...educationList];
    updated[index] = { ...updated[index], [field]: value };
    setEducationList(updated);
  };

  const onFormSubmit = async (data: Record<string, string>) => {
    const inputData: ResumeInputData = {
      fullName: data.fullName || "",
      email: data.email || "",
      phone: data.phone || "",
      location: data.location || "",
      linkedin: data.linkedin || "",
      summary: data.summary || "",
      targetJobTitle: data.targetJobTitle || "",
      targetIndustry: data.targetIndustry || "",
      workExperience: workExperiences,
      education: educationList,
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    if (!inputData.fullName || !inputData.email) {
      toast.error("Please fill in at least your name and email.");
      return;
    }

    if (inputData.skills.length === 0) {
      toast.error("Please add at least one skill.");
      return;
    }

    await onSubmit(inputData);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6 rounded-2xl border border-border bg-background p-6"
    >
      <div>
        <h2 className="text-xl font-semibold">Personal Information</h2>
        <p className="mt-1 text-sm text-muted">
          Tell us about yourself so we can personalize your resume.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Full Name <span className="text-error">*</span>
          </label>
          <input
            {...register("fullName")}
            type="text"
            placeholder="John Doe"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Email <span className="text-error">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="john@example.com"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Phone</label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="+1 (555) 000-0000"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Location</label>
          <input
            {...register("location")}
            type="text"
            placeholder="San Francisco, CA"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            LinkedIn URL
          </label>
          <input
            {...register("linkedin")}
            type="url"
            placeholder="linkedin.com/in/johndoe"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Target Job Title
          </label>
          <input
            {...register("targetJobTitle")}
            type="text"
            placeholder="Senior Software Engineer"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Target Industry
        </label>
        <input
          {...register("targetIndustry")}
          type="text"
          placeholder="Technology, Finance, Healthcare..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Professional Summary (optional)
        </label>
        <textarea
          {...register("summary")}
          rows={3}
          placeholder="Brief overview of your career goals and key qualifications..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Work Experience</h2>
          <button
            type="button"
            onClick={addWorkExperience}
            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {workExperiences.map((exp, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-muted-bg p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Position {index + 1}
                </span>
                {workExperiences.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWorkExperience(index)}
                    className="text-error hover:text-error/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Job Title"
                  value={exp.title}
                  onChange={(e) =>
                    updateWorkExperience(index, "title", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) =>
                    updateWorkExperience(index, "company", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Start Date (e.g., Jan 2022)"
                  value={exp.startDate}
                  onChange={(e) =>
                    updateWorkExperience(index, "startDate", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="End Date (or 'Present')"
                  value={exp.endDate}
                  onChange={(e) =>
                    updateWorkExperience(index, "endDate", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <textarea
                rows={2}
                placeholder="Describe your responsibilities and achievements..."
                value={exp.description}
                onChange={(e) =>
                  updateWorkExperience(index, "description", e.target.value)
                }
                className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Education</h2>
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {educationList.map((edu, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-muted-bg p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Education {index + 1}
                </span>
                {educationList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-error hover:text-error/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Degree (e.g., B.S.)"
                  value={edu.degree}
                  onChange={(e) =>
                    updateEducation(index, "degree", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Field (e.g., Computer Science)"
                  value={edu.field}
                  onChange={(e) =>
                    updateEducation(index, "field", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Institution"
                  value={edu.institution}
                  onChange={(e) =>
                    updateEducation(index, "institution", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Year (e.g., 2020)"
                  value={edu.year}
                  onChange={(e) =>
                    updateEducation(index, "year", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <label className="mb-1.5 block text-base font-semibold">
          Skills <span className="text-sm text-muted">(comma-separated)</span>{" "}
          <span className="text-error">*</span>
        </label>
        <textarea
          rows={2}
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="JavaScript, React, Node.js, Python, Project Management, Team Leadership..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <GenerateResumeIcon />
            Generate Resume
          </>
        )}
      </button>
    </form>
  );
}