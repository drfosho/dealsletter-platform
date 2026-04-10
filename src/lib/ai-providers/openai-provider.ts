import OpenAI from "openai";
import { LLMProvider, LLMRequest, LLMResponse } from "./types";

export class OpenAIProvider implements LLMProvider {
  name = "openai";
  model: string;
  private client: OpenAI;

  constructor(model: string) {
    this.model = model;
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
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
      provider: "openai",
      model: this.model,
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      latencyMs: Date.now() - start,
    };
  }
}

// Pre-configured instances
export const gpt4oMini = new OpenAIProvider("gpt-4o-mini");
export const gpt41 = new OpenAIProvider("gpt-4.1");
export const gpt4o = new OpenAIProvider("gpt-4o");
