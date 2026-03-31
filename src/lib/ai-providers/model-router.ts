import {
  LLMProvider,
  LLMRequest,
  LLMResponse,
  ModelSelection,
  UserTier,
  Strategy,
} from "./types";
import { claudeSonnet, claudeOpus } from "./anthropic-provider";
import { gpt4oMini, gpt41, gpt4o } from "./openai-provider";
import { grokFast, grok3 } from "./grok-provider";

// Strategy → model mapping for Pro tier auto-routing
// Claude Sonnet: BRRRR, Buy & Hold (deep contextual reasoning)
// GPT-4.1: Fix & Flip, House Hack (clean financial prose)
const PRO_AUTO_ROUTING: Record<Strategy, LLMProvider> = {
  brrrr: claudeSonnet,
  rental: claudeSonnet,
  flip: gpt41,
  "house-hack": gpt41,
  airbnb: claudeSonnet,
  commercial: claudeSonnet,
};

const PRO_AUTO_LABELS: Record<Strategy, string> = {
  brrrr: "Claude Sonnet (Auto)",
  rental: "Claude Sonnet (Auto)",
  flip: "GPT-4.1 (Auto)",
  "house-hack": "GPT-4.1 (Auto)",
  airbnb: "Claude Sonnet (Auto)",
  commercial: "Claude Sonnet (Auto)",
};

export function selectModel(
  tier: UserTier,
  strategy: Strategy,
  modelOverride?: string
): ModelSelection {
  // If a specific model is requested (Pro Max parallel calls), use it directly
  if (modelOverride) {
    switch (modelOverride) {
      case "claude-opus-4-6":
        return {
          primary: claudeOpus,
          fallback: claudeSonnet,
          tierLabel: "Max IQ",
          modelLabel: "Claude Opus 4.6",
        };
      case "gpt-4o":
        return {
          primary: gpt4o,
          fallback: gpt41,
          tierLabel: "Max IQ",
          modelLabel: "GPT-4o",
        };
      case "grok-3":
      case "grok-3-latest":
        return {
          primary: grok3,
          fallback: grokFast,
          tierLabel: "Max IQ",
          modelLabel: "Grok 3",
        };
      default:
        break;
    }
  }

  switch (tier) {
    case "free":
      return {
        primary: gpt4oMini,
        fallback: grokFast,
        tierLabel: "Speed",
        modelLabel: "GPT-4o-mini",
      };

    case "pro": {
      const provider = PRO_AUTO_ROUTING[strategy] || claudeSonnet;
      const label = PRO_AUTO_LABELS[strategy] || "Claude Sonnet (Auto)";
      return {
        primary: provider,
        fallback: claudeSonnet,
        tierLabel: "Balanced",
        modelLabel: label,
      };
    }

    case "pro_max":
      return {
        primary: claudeOpus,
        fallback: claudeSonnet,
        tierLabel: "Max IQ",
        modelLabel: "Claude Opus (Max IQ)",
      };

    default:
      return {
        primary: gpt4oMini,
        fallback: grokFast,
        tierLabel: "Speed",
        modelLabel: "GPT-4o-mini",
      };
  }
}

export async function callWithFallback(
  selection: ModelSelection,
  request: LLMRequest
): Promise<LLMResponse & { usedFallback: boolean }> {
  try {
    const result = await selection.primary.call(request);
    return { ...result, usedFallback: false };
  } catch (primaryError: any) {
    console.error(
      `Primary model ${selection.primary.model} failed:`,
      primaryError.message
    );

    if (selection.fallback) {
      try {
        console.log(`Falling back to ${selection.fallback.model}`);
        const result = await selection.fallback.call(request);
        return { ...result, usedFallback: true };
      } catch (fallbackError: any) {
        console.error(
          `Fallback model ${selection.fallback.model} failed:`,
          fallbackError.message
        );
        throw new Error(
          `Both primary and fallback models failed. ` +
            `Primary: ${primaryError.message}. ` +
            `Fallback: ${fallbackError.message}`
        );
      }
    }

    throw primaryError;
  }
}
