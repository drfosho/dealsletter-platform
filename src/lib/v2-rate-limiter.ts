import { createServerClient } from "@supabase/ssr";

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number;
  limit?: number;
  remaining?: number;
  resetAt?: Date;
}

export interface RateLimitConfig {
  userId: string | null;
  ipAddress: string;
  tier: "free" | "pro" | "pro_max";
  modelType: "single" | "parallel";
}

const RATE_LIMITS = {
  free: { perHour: 5, perDay: 20 },
  pro: { perHour: 20, perDay: 100 },
  pro_max: {
    perHour: 30,
    perDay: 150,
    parallelPerHour: 10,
    parallelPerDay: 50,
  },
};

export async function checkRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const limits = RATE_LIMITS[config.tier];

    const identifier = config.userId
      ? { column: "user_id" as const, value: config.userId }
      : { column: "ip_address" as const, value: config.ipAddress };

    // Check hourly limit
    const { count: hourlyCount } = await supabase
      .from("v2_analysis_requests")
      .select("*", { count: "exact", head: true })
      .eq(identifier.column, identifier.value)
      .gte("created_at", oneHourAgo.toISOString());

    const hourlyLimit =
      config.modelType === "parallel" && config.tier === "pro_max"
        ? (limits as typeof RATE_LIMITS.pro_max).parallelPerHour
        : limits.perHour;

    if ((hourlyCount || 0) >= hourlyLimit) {
      const resetAt = new Date(oneHourAgo.getTime() + 60 * 60 * 1000);
      return {
        allowed: false,
        reason: `Hourly limit reached. You can run ${hourlyLimit} analyses per hour.`,
        retryAfter: Math.ceil((resetAt.getTime() - now.getTime()) / 1000),
        limit: hourlyLimit,
        remaining: 0,
        resetAt,
      };
    }

    // Check daily limit
    const { count: dailyCount } = await supabase
      .from("v2_analysis_requests")
      .select("*", { count: "exact", head: true })
      .eq(identifier.column, identifier.value)
      .gte("created_at", oneDayAgo.toISOString());

    const dailyLimit =
      config.modelType === "parallel" && config.tier === "pro_max"
        ? (limits as typeof RATE_LIMITS.pro_max).parallelPerDay
        : limits.perDay;

    if ((dailyCount || 0) >= dailyLimit) {
      const resetAt = new Date(oneDayAgo.getTime() + 24 * 60 * 60 * 1000);
      return {
        allowed: false,
        reason: `Daily limit reached. You can run ${dailyLimit} analyses per day.`,
        retryAfter: Math.ceil((resetAt.getTime() - now.getTime()) / 1000),
        limit: dailyLimit,
        remaining: 0,
        resetAt,
      };
    }

    const remaining = Math.min(
      hourlyLimit - (hourlyCount || 0) - 1,
      dailyLimit - (dailyCount || 0) - 1
    );

    return {
      allowed: true,
      limit: hourlyLimit,
      remaining: Math.max(0, remaining),
    };
  } catch (err) {
    // On error, allow the request — never block users due to rate limiter bugs
    console.error("Rate limiter error:", err);
    return { allowed: true };
  }
}

export async function recordAnalysisRequest(
  config: RateLimitConfig & { strategy?: string }
): Promise<void> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );

    await supabase.from("v2_analysis_requests").insert({
      user_id: config.userId || null,
      ip_address: config.ipAddress,
      tier: config.tier,
      model_type: config.modelType,
      strategy: config.strategy || null,
    });
  } catch (err) {
    console.error("Failed to record request:", err);
  }
}

export function getIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return real || "unknown";
}
