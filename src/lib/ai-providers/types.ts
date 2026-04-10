export interface LLMRequest {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  text: string;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs: number;
}

export interface LLMProvider {
  name: string;
  model: string;
  call(request: LLMRequest): Promise<LLMResponse>;
}

export type UserTier = "free" | "pro" | "pro_max";

export type Strategy =
  | "rental"
  | "flip"
  | "brrrr"
  | "house-hack"
  | "airbnb"
  | "commercial";

export interface ModelSelection {
  primary: LLMProvider;
  fallback?: LLMProvider;
  tierLabel: string;
  modelLabel: string;
}
