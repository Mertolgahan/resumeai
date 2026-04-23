import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateResumeContent(input: ResumeInput): Promise<ResumeOutput> {
  const prompt = `You are an expert resume writer. Create a professional, ATS-optimized resume based on the following information. Output JSON only.

PERSONAL INFO:
Name: ${input.fullName}
Email: ${input.email}
Phone: ${input.phone || "Not provided"}
Location: ${input.location || "Not provided"}
LinkedIn: ${input.linkedin || "Not provided"}

PROFESSIONAL SUMMARY:
${input.summary || "Generate a compelling professional summary based on the experience below."}

WORK EXPERIENCE:
${input.workExperience.map((exp, i) => `${i + 1}. ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || "Present"})
${exp.description}`).join("\n")}

EDUCATION:
${input.education.map((edu, i) => `${i + 1}. ${edu.degree} in ${edu.field} from ${edu.institution} (${edu.year})`).join("\n")}

SKILLS:
${input.skills.join(", ")}

ADDITIONAL INFO:
Target Job Title: ${input.targetJobTitle || "Not specified"}
Target Industry: ${input.targetIndustry || "Not specified"}

Generate a JSON resume with these fields:
- headline: compelling professional headline (string)
- summary: 2-3 sentence professional summary (string)
- experience: array of {title, company, startDate, endDate, bullets: string[]}
- education: array of {degree, field, institution, year, details: string}
- skills: {technical: string[], soft: string[]}
- certifications: string[] (empty if none mentioned)

Make it ATS-friendly, action-oriented, and impactful. Use strong action verbs and quantifiable results where possible.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content) as ResumeOutput;
}

export async function generateCoverLetterContent(
  input: CoverLetterInput
): Promise<string> {
  const prompt = `You are an expert cover letter writer. Write a compelling, professional cover letter.

APPLICANT INFO:
Name: ${input.fullName}
Target Position: ${input.jobTitle}
Company: ${input.companyName}

WORK EXPERIENCE SUMMARY:
${input.experienceSummary}

KEY SKILLS:
${input.skills.join(", ")}

WHY THIS ROLE:
${input.whyThisRole || "Express genuine enthusiasm for the position and company."}

Write the cover letter in a professional but engaging tone. Keep it to 3 paragraphs maximum. Do not include the applicant's address or date. Start with "Dear Hiring Manager," and end with a professional closing.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "";
}

export interface ResumeInput {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  summary?: string;
  targetJobTitle?: string;
  targetIndustry?: string;
  workExperience: {
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
  }[];
  education: {
    degree: string;
    field: string;
    institution: string;
    year: string;
  }[];
  skills: string[];
}

export interface ResumeOutput {
  headline: string;
  summary: string;
  experience: {
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    field: string;
    institution: string;
    year: string;
    details: string;
  }[];
  skills: {
    technical: string[];
    soft: string[];
  };
  certifications: string[];
}

export interface CoverLetterInput {
  fullName: string;
  jobTitle: string;
  companyName: string;
  experienceSummary: string;
  skills: string[];
  whyThisRole?: string;
}