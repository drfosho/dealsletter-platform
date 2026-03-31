"use client";

import { useState, useCallback } from "react";

export interface ProMaxModelResult {
  modelId: string;
  modelLabel: string;
  provider: string;
  role: string;
  status: "pending" | "loading" | "complete" | "error";
  progressSteps: Array<{
    step: string;
    detail: string;
    timestamp: number;
  }>;
  parsedResult: any | null;
  serverCalculations: any | null;
  error: string | null;
  latencyMs: number | null;
}

export const PRO_MAX_MODELS = [
  {
    id: "claude-opus-4-6",
    label: "Claude Opus 4.6",
    provider: "anthropic",
    role: "risk",
    roleLabel: "Risk Analysis",
    roleDescription:
      "Conservative downside case \u2014 stress tests assumptions, identifies what can go wrong",
    color: "#7F77DD",
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    provider: "openai",
    role: "narrative",
    roleLabel: "Investment Memo",
    roleDescription:
      "Deal sponsor perspective \u2014 investment thesis, upside case, decisive recommendation",
    color: "#1D9E75",
  },
  {
    id: "grok-3-latest",
    label: "Grok 3",
    provider: "xai",
    role: "numbers",
    roleLabel: "Quantitative Model",
    roleDescription:
      "Pure math \u2014 verifies calculations, sensitivity analysis, benchmark comparisons",
    color: "#EF9F27",
  },
];

function makeDefaultResults(): ProMaxModelResult[] {
  return PRO_MAX_MODELS.map((m) => ({
    modelId: m.id,
    modelLabel: m.label,
    provider: m.provider,
    role: m.role,
    status: "pending" as const,
    progressSteps: [],
    parsedResult: null,
    serverCalculations: null,
    error: null,
    latencyMs: null,
  }));
}

export function useProMaxAnalysis() {
  const [modelResults, setModelResults] =
    useState<ProMaxModelResult[]>(makeDefaultResults);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const resetResults = useCallback(() => {
    setModelResults(makeDefaultResults());
    setCompletedCount(0);
    setIsRunning(false);
  }, []);

  const runParallelAnalysis = useCallback(
    async (
      fetchBody: Record<string, any>,
      parseAnalysisStream: (raw: string) => any,
      normalizeResult: (raw: any) => any
    ) => {
      setIsRunning(true);
      setCompletedCount(0);

      // Reset all to loading
      setModelResults(
        PRO_MAX_MODELS.map((m) => ({
          modelId: m.id,
          modelLabel: m.label,
          provider: m.provider,
          role: m.role,
          status: "loading" as const,
          progressSteps: [],
          parsedResult: null,
          serverCalculations: null,
          error: null,
          latencyMs: null,
        }))
      );

      // Fire all three in parallel
      const promises = PRO_MAX_MODELS.map(async (model) => {
        const startTime = Date.now();

        try {
          const response = await fetch("/api/analysis/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...fetchBody,
              modelOverride: model.id,
            }),
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Analysis failed");
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          if (!reader) throw new Error("No stream");

          let rawBuffer = "";
          let lineBuffer = "";

          // Collect progress events locally for clean state updates
          const localProgress: Array<{
            step: string;
            detail: string;
            timestamp: number;
          }> = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            rawBuffer += chunk;
            lineBuffer += chunk;

            // Process progress lines in real time
            const lines = lineBuffer.split("\n");
            lineBuffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("PROGRESS:")) {
                try {
                  const event = JSON.parse(line.slice(9));
                  if (event.type === "progress") {
                    localProgress.push({
                      step: event.step,
                      detail: event.detail,
                      timestamp: Date.now(),
                    });
                    // Update state with full accumulated array
                    const snapshot = [...localProgress];
                    setModelResults((prev) =>
                      prev.map((r) =>
                        r.modelId === model.id
                          ? { ...r, progressSteps: snapshot }
                          : r
                      )
                    );
                  }
                } catch {}
              }
            }
          }

          // Parse complete buffer
          let fullResultJson = "";
          let calculations = null;

          const allLines = rawBuffer.split("\n");
          for (const line of allLines) {
            if (line.startsWith("CALCULATIONS:")) {
              try {
                calculations = JSON.parse(line.slice(13));
              } catch {}
            } else if (line.startsWith("RESULT:")) {
              fullResultJson = line.slice(7);
            } else if (
              fullResultJson &&
              line.trim() &&
              !line.startsWith("PROGRESS:") &&
              !line.startsWith("MODEL:") &&
              !line.startsWith("CALCULATIONS:") &&
              !line.startsWith("ERROR:")
            ) {
              fullResultJson += line;
            }
          }

          // Last resort extraction
          if (!fullResultJson || fullResultJson.length < 10) {
            const marker = rawBuffer.indexOf("RESULT:");
            if (marker !== -1) {
              const after = rawBuffer.slice(marker + 7);
              const last = after.lastIndexOf("}");
              if (last !== -1) {
                fullResultJson = after.slice(0, last + 1);
              }
            }
          }

          const parsed = parseAnalysisStream(fullResultJson);
          const normalized = parsed ? normalizeResult(parsed) : null;
          const latencyMs = Date.now() - startTime;

          setModelResults((prev) =>
            prev.map((r) =>
              r.modelId === model.id
                ? {
                    ...r,
                    status: normalized ? ("complete" as const) : ("error" as const),
                    parsedResult: normalized,
                    serverCalculations: calculations,
                    error: normalized ? null : "Failed to parse response",
                    latencyMs,
                  }
                : r
            )
          );

          setCompletedCount((prev) => prev + 1);
        } catch (err: any) {
          const latencyMs = Date.now() - startTime;
          setModelResults((prev) =>
            prev.map((r) =>
              r.modelId === model.id
                ? {
                    ...r,
                    status: "error" as const,
                    error: err.message || "Analysis failed",
                    latencyMs,
                  }
                : r
            )
          );
          setCompletedCount((prev) => prev + 1);
        }
      });

      await Promise.allSettled(promises);
      setIsRunning(false);
    },
    []
  );

  return {
    modelResults,
    isRunning,
    completedCount,
    totalModels: PRO_MAX_MODELS.length,
    resetResults,
    runParallelAnalysis,
    PRO_MAX_MODELS,
  };
}
