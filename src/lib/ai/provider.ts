import { env } from "../env";
import { AIProvider, GenerateOptions, GenerateResult, StreamCallbacks } from "./types";

class OllamaProvider implements AIProvider {
  name = "ollama";
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.baseUrl = env.OLLAMA_BASE_URL;
    this.defaultModel = env.OLLAMA_DEFAULT_MODEL;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const model = options.model || this.defaultModel;
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: options.systemPrompt
          ? `${options.systemPrompt}\n\n${options.prompt}`
          : options.prompt,
        stream: false,
        options: {
          num_predict: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
        },
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Ollama error: ${res.status} - ${error}`);
    }

    const data = await res.json();
    return {
      text: (data.response as string) || "",
      model,
      provider: this.name,
      tokensInput: data.prompt_eval_count || 0,
      tokensOutput: data.eval_count || 0,
    };
  }

  async generateStream(options: GenerateOptions, callbacks: StreamCallbacks): Promise<void> {
    const model = options.model || this.defaultModel;
    let fullText = "";
    let tokensInput = 0;
    let tokensOutput = 0;

    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: options.systemPrompt
            ? `${options.systemPrompt}\n\n${options.prompt}`
            : options.prompt,
          stream: true,
          options: {
            num_predict: options.maxTokens || 2048,
            temperature: options.temperature || 0.7,
          },
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Ollama error: ${res.status} - ${error}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              fullText += data.response;
              callbacks.onToken(data.response);
            }
            if (data.done) {
              tokensInput = data.prompt_eval_count || 0;
              tokensOutput = data.eval_count || 0;
            }
          } catch {
            // skip malformed JSON lines during streaming
          }
        }
      }

      callbacks.onComplete({
        text: fullText,
        model,
        provider: this.name,
        tokensInput,
        tokensOutput,
      });
    } catch (err) {
      callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}

class OpenRouterProvider implements AIProvider {
  name = "openrouter";
  private apiKey: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = env.OPENROUTER_API_KEY;
    this.defaultModel = env.OPENROUTER_DEFAULT_MODEL;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const model = options.model || this.defaultModel;
    const messages: { role: string; content: string }[] = [];

    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: options.prompt });

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": env.NEXTAUTH_URL,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`OpenRouter error: ${res.status} - ${error}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const usage = data.usage;

    return {
      text: choice?.message?.content || "",
      model: data.model || model,
      provider: this.name,
      tokensInput: usage?.prompt_tokens || 0,
      tokensOutput: usage?.completion_tokens || 0,
    };
  }

  async generateStream(options: GenerateOptions, callbacks: StreamCallbacks): Promise<void> {
    const model = options.model || this.defaultModel;
    const messages: { role: string; content: string }[] = [];

    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: options.prompt });

    let fullText = "";
    let tokensInput = 0;
    let tokensOutput = 0;

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": env.NEXTAUTH_URL,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
          stream: true,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(`OpenRouter error: ${res.status} - ${error}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.trim());

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              callbacks.onToken(delta);
            }
            if (parsed.usage) {
              tokensInput = parsed.usage.prompt_tokens || 0;
              tokensOutput = parsed.usage.completion_tokens || 0;
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      callbacks.onComplete({
        text: fullText,
        model,
        provider: this.name,
        tokensInput,
        tokensOutput,
      });
    } catch (err) {
      callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}

export class AIProviderManager {
  private providers: AIProvider[];

  constructor() {
    this.providers = [new OllamaProvider(), new OpenRouterProvider()];
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    let lastError: Error | null = null;

    for (const provider of this.providers) {
      try {
        const available = await provider.isAvailable();
        if (!available) continue;

        const result = await provider.generate(options);
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`Provider ${provider.name} failed:`, lastError.message);
      }
    }

    throw new Error(
      `All AI providers failed. Last error: ${lastError?.message || "No providers available"}`
    );
  }

  async generateWithProvider(
    providerName: string,
    options: GenerateOptions
  ): Promise<GenerateResult> {
    const provider = this.providers.find((p) => p.name === providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }
    return provider.generate(options);
  }

  async generateStream(
    options: GenerateOptions,
    callbacks: StreamCallbacks
  ): Promise<void> {
    let lastError: Error | null = null;

    for (const provider of this.providers) {
      try {
        const available = await provider.isAvailable();
        if (!available) continue;

        await provider.generateStream(options, callbacks);
        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`Provider ${provider.name} stream failed:`, lastError.message);
      }
    }

    throw new Error(
      `All AI providers failed for streaming. Last error: ${lastError?.message || "No providers available"}`
    );
  }

  async getAvailableProviders(): Promise<{ name: string; available: boolean }[]> {
    const results = await Promise.all(
      this.providers.map(async (p) => ({
        name: p.name,
        available: await p.isAvailable(),
      }))
    );
    return results;
  }
}

export const aiProvider = new AIProviderManager();