import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/v2/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        new URL("/v2/login?error=auth", requestUrl.origin)
      );
    }

    // Send welcome email directly — session is in memory here, so a self-fetch
    // would 401 (cookies for the just-exchanged session aren't on the incoming
    // request). Wrapped in try/catch so an email error never blocks the redirect.
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.id && user?.email) {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const admin = createAdminClient();

        const { data: claimed } = await admin
          .from('user_profiles')
          .update({ welcome_email_sent: true })
          .eq('id', user.id)
          .not('welcome_email_sent', 'is', true)
          .select('id')
          .maybeSingle();

        if (claimed) {
          const { data: profile } = await admin
            .from('user_profiles')
            .select('first_name')
            .eq('id', user.id)
            .single();

          const name =
            (user.user_metadata?.first_name as string) ||
            profile?.first_name ||
            (user.user_metadata?.full_name as string)?.split(' ')[0] ||
            undefined;

          const subscribedNewsletter =
            user.user_metadata?.newsletter_subscribed === true;

          const { sendWelcomeEmail } = await import('@/lib/email');
          await sendWelcomeEmail({
            email: user.email,
            name,
            subscribedNewsletter,
          });
        }
      }
    } catch (welcomeErr) {
      console.error('[v2/auth/callback] welcome email error:', welcomeErr);
    }
  }

  // Always redirect to dashboard after successful auth
  return NextResponse.redirect(new URL("/v2/dashboard", requestUrl.origin));
}
