import Anthropic from "@anthropic-ai/sdk";
import { LLMProvider, LLMRequest, LLMResponse } from "./types";

export class AnthropicProvider implements LLMProvider {
  name = "anthropic";
  model: string;
  private client: Anthropic;

  constructor(model: string) {
    this.model = model;
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    const start = Date.now();

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: request.maxTokens || 4000,
      temperature: request.temperature || 0.3,
      system: request.systemPrompt,
      messages: [{ role: "user" as const, content: request.userMessage }],
    });

    const text = response.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");

    return {
      text,
      provider: "anthropic",
      model: this.model,
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      latencyMs: Date.now() - start,
    };
  }
}

// Pre-configured instances
export const claudeSonnet = new AnthropicProvider("claude-sonnet-4-6");
export const claudeOpus = new AnthropicProvider("claude-opus-4-6");
