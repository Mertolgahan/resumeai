export interface GenerateOptions {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface GenerateResult {
  text: string;
  model: string;
  provider: string;
  tokensInput: number;
  tokensOutput: number;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (result: GenerateResult) => void;
  onError: (error: Error) => void;
}

export interface AIProvider {
  name: string;
  generate(options: GenerateOptions): Promise<GenerateResult>;
  generateStream(options: GenerateOptions, callbacks: StreamCallbacks): Promise<void>;
  isAvailable(): Promise<boolean>;
}

export type ContentType = "blog_post" | "social_media" | "seo_title" | "seo_description" | "product_description" | "email" | "ad_copy";

export const CONTENT_TYPE_CONFIG: Record<ContentType, { label: string; systemPrompt: string; icon: string }> = {
  blog_post: {
    label: "Blog Post",
    icon: "FileText",
    systemPrompt: "You are a professional content writer. Write engaging, SEO-optimized blog posts. Use clear headings, short paragraphs, and include relevant keywords naturally. Output in markdown format.",
  },
  social_media: {
    label: "Social Media Post",
    icon: "Share2",
    systemPrompt: "You are a social media content creator. Write engaging, shareable social media posts. Include relevant hashtags. Keep it concise and impactful. Output in plain text.",
  },
  seo_title: {
    label: "SEO Title",
    icon: "Search",
    systemPrompt: "You are an SEO expert. Generate compelling, keyword-rich titles that improve click-through rates. Keep titles under 60 characters. Output only the title, nothing else.",
  },
  seo_description: {
    label: "SEO Description",
    icon: "AlignLeft",
    systemPrompt: "You are an SEO expert. Write compelling meta descriptions under 160 characters that include target keywords and drive clicks. Output only the description, nothing else.",
  },
  product_description: {
    label: "Product Description",
    icon: "Package",
    systemPrompt: "You are an experienced e-commerce copywriter. Write persuasive product descriptions that highlight features, benefits, and unique selling points. Output in markdown format.",
  },
  email: {
    label: "Email Campaign",
    icon: "Mail",
    systemPrompt: "You are an email marketing expert. Write compelling email campaigns with strong subject lines, engaging body copy, and clear calls to action. Output in plain text with subject line on the first line prefixed with 'Subject:'.",
  },
  ad_copy: {
    label: "Ad Copy",
    icon: "Megaphone",
    systemPrompt: "You are a digital advertising copywriter. Write high-converting ad copy with attention-grabbing headlines and compelling calls to action. Keep it concise and impactful. Output in plain text.",
  },
};