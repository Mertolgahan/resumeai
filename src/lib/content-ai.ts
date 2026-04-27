import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://resumeai.vercel.app",
    "X-Title": "ResumeAI + ContentAI",
  },
});

export type ContentType =
  | "blog_post"
  | "social_media"
  | "seo_title"
  | "seo_description"
  | "product_description"
  | "email"
  | "ad_copy";

export const CONTENT_TYPE_CONFIG: Record<
  ContentType,
  { label: string; systemPrompt: string }
> = {
  blog_post: {
    label: "Blog Post",
    systemPrompt:
      "You are a professional content writer. Write engaging, SEO-optimized blog posts. Use clear headings, short paragraphs, and include relevant keywords naturally. Output in markdown format.",
  },
  social_media: {
    label: "Social Media Post",
    systemPrompt:
      "You are a social media content creator. Write engaging, shareable social media posts. Include relevant hashtags. Keep it concise and impactful. Output in plain text.",
  },
  seo_title: {
    label: "SEO Title",
    systemPrompt:
      "You are an SEO expert. Generate compelling, keyword-rich titles that improve click-through rates. Keep titles under 60 characters. Output only the title, nothing else.",
  },
  seo_description: {
    label: "SEO Description",
    systemPrompt:
      "You are an SEO expert. Write compelling meta descriptions under 160 characters that include target keywords and drive clicks. Output only the description, nothing else.",
  },
  product_description: {
    label: "Product Description",
    systemPrompt:
      "You are an experienced e-commerce copywriter. Write persuasive product descriptions that highlight features, benefits, and unique selling points. Output in markdown format.",
  },
  email: {
    label: "Email Campaign",
    systemPrompt:
      "You are an email marketing expert. Write compelling email campaigns with strong subject lines, engaging body copy, and clear calls to action. Output in plain text with subject line on the first line prefixed with 'Subject:'.",
  },
  ad_copy: {
    label: "Ad Copy",
    systemPrompt:
      "You are a digital advertising copywriter. Write high-converting ad copy with attention-grabbing headlines and compelling calls to action. Keep it concise and impactful. Output in plain text.",
  },
};

export interface GenerateContentOptions {
  prompt: string;
  type: ContentType;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateContentResult {
  text: string;
  model: string;
  provider: string;
  tokensInput: number;
  tokensOutput: number;
}

export async function generateContent(
  options: GenerateContentOptions
): Promise<GenerateContentResult> {
  const typeConfig = CONTENT_TYPE_CONFIG[options.type];
  if (!typeConfig) {
    throw new Error(`Invalid content type: ${options.type}`);
  }

  const model = options.model || "openai/gpt-4o-mini";
  const systemPrompt = options.systemPrompt || typeConfig.systemPrompt;

  const messages: { role: "system" | "user"; content: string }[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: options.prompt },
  ];

  const response = await openai.chat.completions.create({
    model,
    messages,
    max_tokens: options.maxTokens || 2048,
    temperature: options.temperature || 0.7,
  });

  const choice = response.choices?.[0];
  const usage = response.usage;

  return {
    text: choice?.message?.content || "",
    model: response.model || model,
    provider: "openrouter",
    tokensInput: usage?.prompt_tokens || 0,
    tokensOutput: usage?.completion_tokens || 0,
  };
}
