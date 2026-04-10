// xAI Grok uses OpenAI-compatible API
import OpenAI from "openai";
import { LLMProvider, LLMRequest, LLMResponse } from "./types";

export class GrokProvider implements LLMProvider {
  name = "xai";
  model: string;
  private client: OpenAI;

  constructor(model: string) {
    this.model = model;
    this.client = new OpenAI({
      apiKey: process.env.XAI_API_KEY || "",
      baseURL: "https://api.x.ai/v1",
    });
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    const start = Date.now();

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: request.maxTokens || 4000,
      temperature: request.temperature || 0.3,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userMessage },
      ],
    });

    const text = response.choices[0]?.message?.content || "";

    return {
      text,
      provider: "xai",
      model: this.model,
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      latencyMs: Date.now() - start,
    };
  }
}

// Pre-configured instances
export const grokFast = new GrokProvider("grok-2-latest");
export const grok3 = new GrokProvider("grok-3-latest");
