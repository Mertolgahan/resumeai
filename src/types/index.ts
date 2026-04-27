export type PlanType = "free" | "pro" | "lifetime";

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  plan: PlanType;
  resumes_generated: number;
  lemonsqueezy_customer_id: string | null;
  payment_customer_id: string | null; // legacy generic field
  created_at: string;
  updated_at: string;
}

export interface ResumeRecord {
  id: string;
  user_id: string;
  input_data: ResumeInputData;
  generated_content: GeneratedResume;
  cover_letter: string | null;
  template: string;
  created_at: string;
  updated_at: string;
}

export interface ResumeInputData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  targetJobTitle: string;
  targetIndustry: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
}

export interface WorkExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  year: string;
}

export interface GeneratedResume {
  headline: string;
  summary: string;
  experience: GeneratedExperience[];
  education: GeneratedEducation[];
  skills: {
    technical: string[];
    soft: string[];
  };
  certifications: string[];
}

export interface GeneratedExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface GeneratedEducation {
  degree: string;
  field: string;
  institution: string;
  year: string;
  details: string;
}