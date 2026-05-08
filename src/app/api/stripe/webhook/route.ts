import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';
import {
  sendProWelcomeEmail as sendV2ProWelcomeEmail,
  sendProMaxWelcomeEmail as sendV2ProMaxWelcomeEmail,
  sendV2CancellationEmail,
  sendV2CancellationCompleteEmail,
} from '@/lib/v2-emails';

// Disable body parsing, we need the raw body for webhook signature verification
export const runtime = 'nodejs';

// V2 price ID mapping
const V2_PRICE_TIERS: Record<string, string> = {
  [process.env.STRIPE_PRICE_V2_PRO_MONTHLY!]: 'pro',
  [process.env.STRIPE_PRICE_V2_PRO_YEARLY!]: 'pro',
  [process.env.STRIPE_PRICE_V2_PRO_MAX_MONTHLY!]: 'pro_plus',
  [process.env.STRIPE_PRICE_V2_PRO_MAX_YEARLY!]: 'pro_plus',
};

// Map Stripe tier names to our database tier names
function mapTierName(stripeTier: string): string {
  console.log('[Webhook] mapTierName - Input:', stripeTier);

  const tierMap: Record<string, string> = {
    'STARTER': 'starter',
    'PRO': 'pro',  // Map PRO to pro
    'PROFESSIONAL': 'professional',
    'PRO_PLUS': 'pro-plus',  // New Pro Plus tier
    'PRO-PLUS': 'pro-plus',
    'PROPLUS': 'pro-plus',
    'PREMIUM': 'premium',
    'FREE': 'free'
  };

  const upperTier = stripeTier.toUpperCase().replace('-', '_');
  const result = tierMap[upperTier] || 'free';  // Default to free if not found
  console.log('[Webhook] mapTierName - Normalized:', upperTier, '→', result);
  return result;
}

// CRITICAL: Safely convert Stripe Unix timestamp (seconds) to ISO string
// Stripe timestamps are in SECONDS, JavaScript Date expects MILLISECONDS
function stripeTimestampToISO(timestamp: number | null | undefined): string | null {
  if (timestamp === null || timestamp === undefined) {
    console.log('[Webhook] stripeTimestampToISO - No timestamp provided, returning null');
    return null;
  }

  // Ensure it's a valid number
  if (typeof timestamp !== 'number' || isNaN(timestamp)) {
    console.error('[Webhook] stripeTimestampToISO - Invalid timestamp value:', timestamp, 'type:', typeof timestamp);
    return null;
  }

  // Convert seconds to milliseconds
  const milliseconds = timestamp * 1000;
  const date = new Date(milliseconds);

  // Validate the resulting date
  if (isNaN(date.getTime())) {
    console.error('[Webhook] stripeTimestampToISO - Invalid date from timestamp:', timestamp);
    return null;
  }

  const isoString = date.toISOString();
  console.log('[Webhook] stripeTimestampToISO - Converted:', timestamp, '→', isoString);
  return isoString;
}

// Helper to safely get period dates from subscription (handles different Stripe API versions)
function getSubscriptionPeriodDates(subscription: Stripe.Subscription): { periodStart: Date; periodEnd: Date; periodStartISO: string; periodEndISO: string } {
  console.log('[Webhook] getSubscriptionPeriodDates - Extracting period dates');

  // Try subscription level first (older API versions)
  let periodStartTs = (subscription as any).current_period_start;
  let periodEndTs = (subscription as any).current_period_end;

  console.log('[Webhook] Subscription level timestamps:', { periodStartTs, periodEndTs });

  // Try subscription item level (newer API versions like 2025-05-28.basil)
  if (!periodStartTs && subscription.items?.data?.[0]) {
    const item = subscription.items.data[0] as any;
    periodStartTs = item.current_period_start;
    periodEndTs = item.current_period_end;
    console.log('[Webhook] Item level timestamps:', { periodStartTs, periodEndTs });
  }

  // Fallback to trial dates if available
  if (!periodStartTs && subscription.trial_start) {
    periodStartTs = subscription.trial_start;
    console.log('[Webhook] Using trial_start for period start:', periodStartTs);
  }
  if (!periodEndTs && subscription.trial_end) {
    periodEndTs = subscription.trial_end;
    console.log('[Webhook] Using trial_end for period end:', periodEndTs);
  }

  // Final fallback to now + 30 days
  if (!periodStartTs || typeof periodStartTs !== 'number') {
    periodStartTs = Math.floor(Date.now() / 1000);
    console.log('[Webhook] Warning: Using current time for period start:', periodStartTs);
  }
  if (!periodEndTs || typeof periodEndTs !== 'number') {
    periodEndTs = periodStartTs + (30 * 24 * 60 * 60); // 30 days
    console.log('[Webhook] Warning: Using 30 days from start for period end:', periodEndTs);
  }

  // Convert to Date objects (timestamps are in seconds, need milliseconds)
  const periodStart = new Date(periodStartTs * 1000);
  const periodEnd = new Date(periodEndTs * 1000);

  // Validate dates
  if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
    console.error('[Webhook] CRITICAL: Invalid dates generated!', { periodStartTs, periodEndTs });
    // Return safe defaults
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    return {
      periodStart: now,
      periodEnd: thirtyDaysLater,
      periodStartISO: now.toISOString(),
      periodEndISO: thirtyDaysLater.toISOString()
    };
  }

  return {
    periodStart,
    periodEnd,
    periodStartISO: periodStart.toISOString(),
    periodEndISO: periodEnd.toISOString()
  };
}

async function getRawBody(request: NextRequest): Promise<Buffer> {
  const chunks = [];
  const reader = request.body?.getReader();
  
  if (!reader) {
    throw new Error('No body reader available');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return Buffer.from(result);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[Webhook] ========================================');
  console.log('[Webhook] Incoming webhook request received');
  console.log('[Webhook] Time:', new Date().toISOString());
  
  try {
    const body = await getRawBody(request);
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('[Webhook] ❌ No signature found in request');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }
    console.log('[Webhook] ✓ Signature found');

    // Support both production and local (Stripe CLI) webhook secrets
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const webhookSecretLocal = process.env.STRIPE_WEBHOOK_SECRET_LOCAL;

    if (!webhookSecret && !webhookSecretLocal) {
      console.error('[Webhook] ❌ No webhook secret configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    let event: Stripe.Event;
    let verificationError: Error | null = null;

    // Try production secret first
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log('[Webhook] ✓ Signature verified with production secret');
      } catch (err) {
        verificationError = err as Error;
        console.log('[Webhook] Production secret failed, trying local...');
      }
    }

    // If production failed, try local/CLI secret
    if (!event! && webhookSecretLocal) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecretLocal);
        console.log('[Webhook] ✓ Signature verified with local/CLI secret');
        verificationError = null;
      } catch (err) {
        verificationError = err as Error;
      }
    }

    if (!event! || verificationError) {
      console.error('[Webhook] ❌ Signature verification failed:', verificationError?.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('[Webhook] Event Type:', event.type);
    console.log('[Webhook] Event ID:', event.id);

    const supabase = createAdminClient();

    // Deduplication: try to record the event. If the table exists and the event
    // was already recorded, skip processing. If the table doesn't exist or the
    // insert fails for any reason, PROCEED with processing (never block on dedup failure).
    let isDuplicate = false;
    try {
      const { data: insertResult, error: insertError } = await supabase
        .from('webhook_events')
        .upsert({
          stripe_event_id: event.id,
          type: event.type,
          processed_at: new Date().toISOString()
        }, {
          onConflict: 'stripe_event_id',
          ignoreDuplicates: true
        })
        .select('stripe_event_id')
        .maybeSingle();

      if (insertError) {
        // Table may not exist or have wrong schema — log and proceed.
        // Use a structured payload so non-PostgrestError shapes (e.g., network/fetch
        // failures with no .message/.code fields) still surface something useful.
        const errAny = insertError as unknown as Record<string, unknown>;
        console.warn('[Webhook] ⚠️ Dedup table error (proceeding anyway):', {
          message: errAny.message ?? null,
          code: errAny.code ?? null,
          details: errAny.details ?? null,
          hint: errAny.hint ?? null,
          name: errAny.name ?? null,
          raw: insertError,
        });
      } else if (!insertResult) {
        // No row returned means ignoreDuplicates kicked in — this is a real duplicate
        isDuplicate = true;
      }
    } catch (dedupErr) {
      // Dedup completely failed — proceed with processing
      const errAny = dedupErr as unknown as Record<string, unknown>;
      console.warn('[Webhook] ⚠️ Dedup check failed (proceeding anyway):', {
        message: errAny?.message ?? null,
        name: errAny?.name ?? null,
        stack: (dedupErr as Error)?.stack ?? null,
        raw: dedupErr,
      });
    }

    if (isDuplicate) {
      console.log('[Webhook] ⚠️ Event already processed (duplicate):', event.id);
      console.log('[Webhook] ========================================');
      return NextResponse.json({ received: true });
    }
    console.log('[Webhook] ✓ Processing event...');

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created': {
        console.log('[Webhook] 📋 Processing customer.subscription.created');
        const subscription = event.data.object as Stripe.Subscription;

        // Get user ID from metadata, fall back to lookup by customer email
        let userId = subscription.metadata.supabaseUserId || subscription.metadata.userId;
        console.log('[Webhook] subscription.created - Subscription ID:', subscription.id);
        console.log('[Webhook] subscription.created - User ID from metadata:', userId || 'Not found');

        if (!userId) {
          console.log('[Webhook] subscription.created - Looking up user by customer email');
          const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;

          if (customer.email) {
            // Use admin API to find user by email (auth.users is not queryable via .from())
            const { data: authUsers } = await supabase.auth.admin.listUsers();
            const authUser = authUsers?.users?.find(u => u.email === customer.email);

            if (authUser) {
              userId = authUser.id;
              console.log('[Webhook] subscription.created - Found user by email');
              console.log('[Webhook] subscription.created - Updating Stripe metadata for userId:', userId);
              // Update subscription metadata for future webhooks
              await stripe.subscriptions.update(subscription.id, {
                metadata: { ...subscription.metadata, supabaseUserId: authUser.id }
              });
              console.log('[Webhook] subscription.created - Stripe metadata updated, proceeding to DB update');
            }
          }
        }

        if (userId) {
          // Check V2 price IDs first
          const createdPriceId = subscription.items?.data?.[0]?.price?.id;
          let tierName = V2_PRICE_TIERS[createdPriceId || ''];
          let stripeTierName: string;

          if (tierName) {
            stripeTierName = tierName;
            console.log('[Webhook] subscription.created - V2 price detected:', createdPriceId, '→', tierName);
          } else {
            // Fall back to existing V1 logic
            stripeTierName = subscription.metadata.tierName || subscription.metadata.tier || 'PRO';
            tierName = mapTierName(stripeTierName);
          }
          const { periodEndISO } = getSubscriptionPeriodDates(subscription);

          console.log('[Webhook] subscription.created - 🏷️ SETTING TIER:', stripeTierName, '→', tierName);
          console.log('[Webhook] subscription.created - User ID:', userId);
          console.log('[Webhook] subscription.created - Status:', subscription.status);
          console.log('[Webhook] subscription.created - Period end:', periodEndISO);

          // Detect a genuinely new subscription cycle so we can reset the welcome
          // flag without resetting on Stripe retries of the same subscription.
          // (A naive unconditional reset would re-arm the welcome email on every
          // retry of subscription.created and double-send.)
          console.log('[Webhook] subscription.created - Looking up priorProfile in DB...');
          const { data: priorProfile } = await supabase
            .from('user_profiles')
            .select('stripe_subscription_id')
            .eq('id', userId)
            .single();

          const isNewSubscriptionCycle =
            !priorProfile?.stripe_subscription_id ||
            priorProfile.stripe_subscription_id !== subscription.id;

          console.log('[Webhook] subscription.created - priorProfile result:', {
            found: !!priorProfile,
            stripe_subscription_id: priorProfile?.stripe_subscription_id || null,
            isNewSubscriptionCycle
          });

          // Only set columns we know exist (removed analyses_this_month, trial_start, trial_end).
          // Cancellation email flags and the welcome flag are reset only on a new
          // subscription cycle — resetting them on every subscription.created retry
          // would wipe a cancel claim that has already run.
          const updatePayload: Record<string, unknown> = {
            subscription_tier: tierName,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status as string,
            current_period_end: periodEndISO,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          };

          if (isNewSubscriptionCycle) {
            updatePayload.pro_welcome_email_sent = false;
            updatePayload.cancellation_email_pending_sent = false;
            updatePayload.cancellation_email_final_sent = false;
            console.log('[Webhook] subscription.created - New subscription cycle, resetting welcome and cancellation flags');
          }

          console.log('[Webhook] subscription.created - Update payload:', JSON.stringify(updatePayload));

          const { data: updateResult, error: profileError } = await supabase
            .from('user_profiles')
            .update(updatePayload)
            .eq('id', userId)
            .select('id, subscription_tier')
            .single();

          if (profileError) {
            console.error('[Webhook] subscription.created - ❌ DB Error:', {
              message: profileError.message,
              code: profileError.code,
              details: profileError.details,
              hint: profileError.hint
            });
          } else if (!updateResult) {
            console.error('[Webhook] subscription.created - ⚠️ Update returned no rows — user_profiles row may not exist for userId:', userId);
          } else {
            console.log('[Webhook] subscription.created - ✅ DB Update Result:', {
              id: updateResult.id,
              newTier: updateResult.subscription_tier
            });

            // Send V2 welcome email based on tier
            const newTier = updateResult.subscription_tier;
            try {
              let emailToSend: string | undefined;
              const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
              emailToSend = customer.email || undefined;

              if (emailToSend && newTier) {
                const firstName = subscription.metadata?.firstName || undefined;
                const interval = subscription.items?.data?.[0]?.plan?.interval || 'month';
                const billingPeriod = interval === 'year' ? 'yearly' : 'monthly';

                if (newTier === 'pro_plus' || newTier === 'pro-plus' || newTier === 'premium') {
                  await sendV2ProMaxWelcomeEmail(emailToSend, firstName, billingPeriod);
                  console.log('[Webhook] ✉️ V2 Pro Max welcome email sent');
                } else if (newTier === 'pro') {
                  // Atomic claim — only send Pro welcome once per user
                  const { data: claimed } = await supabase
                    .from('user_profiles')
                    .update({ pro_welcome_email_sent: true })
                    .eq('id', userId)
                    .not('pro_welcome_email_sent', 'is', true)
                    .select('id')
                    .maybeSingle();

                  if (claimed) {
                    await sendV2ProWelcomeEmail(emailToSend, firstName, billingPeriod);
                    console.log('[Webhook] ✉️ V2 Pro welcome email sent');
                  } else {
                    console.log('[Webhook] Pro welcome already sent — skipping');
                  }
                }
              }
            } catch (emailErr) {
              // Never fail webhook due to email error
              console.error('[Webhook] V2 email send failed:', emailErr);
            }
          }
        } else {
          console.error('[Webhook] subscription.created - ❌ Could not find user for subscription:', subscription.id);
        }
        break;
      }

      case 'checkout.session.completed': {
        console.log('[Webhook] 🎉 Processing checkout.session.completed');
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('[Webhook] Session ID:', session.id);
        console.log('[Webhook] Session metadata:', session.metadata);
        console.log('[Webhook] Mode:', session.mode);

        if (session.mode === 'subscription') {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          ) as Stripe.Subscription;

          console.log('[Webhook] Subscription ID:', subscription.id);
          console.log('[Webhook] Subscription metadata:', subscription.metadata);
          console.log('[Webhook] Subscription status:', subscription.status);

          // Get or create customer
          const customerId = session.customer as string;
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;

          // SEC-009: Don't log customer PII - only log that we have valid data
          console.log('[Webhook] Customer found:', !!customerId);
          console.log('[Webhook] Customer has email:', !!customer.email);

          // Get user ID from metadata or email
          let userId =
            subscription.metadata.supabaseUserId ||
            subscription.metadata.userId ||
            session.metadata?.supabaseUserId ||
            session.metadata?.userId;
          console.log('[Webhook] checkout.completed - User ID from metadata:', userId || 'Not found');

          if (!userId && customer.email) {
            // Use admin API to find user by email
            console.log('[Webhook] checkout.completed - Looking up user by customer email');
            const { data: authUsers } = await supabase.auth.admin.listUsers();
            const authUser = authUsers?.users?.find(u => u.email === customer.email);
            userId = authUser?.id;
            if (userId) {
              console.log('[Webhook] checkout.completed - Found user by email');
            }
          }

          if (userId) {
            // Check V2 price IDs first
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            const checkoutPriceId = lineItems.data[0]?.price?.id;
            let tierName = V2_PRICE_TIERS[checkoutPriceId || ''];
            let stripeTierName: string;

            if (tierName) {
              stripeTierName = tierName;
              console.log('[Webhook] checkout.completed - V2 price detected:', checkoutPriceId, '→', tierName);
            } else {
              // Fall back to existing V1 logic
              stripeTierName = subscription.metadata.tierName || subscription.metadata.tier || session.metadata?.tierName || 'PRO';
              tierName = mapTierName(stripeTierName);
            }
            const { periodEndISO } = getSubscriptionPeriodDates(subscription);

            console.log('[Webhook] checkout.completed - 🏷️ SETTING TIER:', stripeTierName, '→', tierName);
            console.log('[Webhook] checkout.completed - User ID:', userId);
            console.log('[Webhook] checkout.completed - Subscription ID:', subscription.id);
            console.log('[Webhook] checkout.completed - Customer ID:', customerId);
            console.log('[Webhook] checkout.completed - Status:', subscription.status);
            console.log('[Webhook] checkout.completed - Period end:', periodEndISO);

            // First verify the user_profiles row exists
            const { data: existingProfile, error: lookupError } = await supabase
              .from('user_profiles')
              .select('id, subscription_tier')
              .eq('id', userId)
              .single();

            console.log('[Webhook] checkout.completed - Profile lookup:', {
              found: !!existingProfile,
              currentTier: existingProfile?.subscription_tier,
              lookupError: lookupError?.message || null
            });

            if (!existingProfile) {
              console.error('[Webhook] checkout.completed - ❌ No user_profiles row found for userId:', userId);
              console.error('[Webhook] checkout.completed - Creating profile row...');
              // Try to create the profile row
              const { error: insertError } = await supabase
                .from('user_profiles')
                .insert({
                  id: userId,
                  subscription_tier: tierName,
                  stripe_customer_id: customerId,
                  stripe_subscription_id: subscription.id,
                  subscription_status: subscription.status as string,
                  current_period_end: periodEndISO,
                  cancel_at_period_end: subscription.cancel_at_period_end,
                  cancellation_email_pending_sent: false,
                  cancellation_email_final_sent: false,
                  updated_at: new Date().toISOString()
                });
              if (insertError) {
                console.error('[Webhook] checkout.completed - ❌ Insert also failed:', insertError);
              } else {
                console.log('[Webhook] checkout.completed - ✅ Created profile with tier:', tierName);

                // Send V2 welcome email based on tier
                if (customer.email) {
                  const billingPeriod = session.metadata?.billingPeriod || 'monthly';
                  try {
                    if (tierName === 'pro_plus' || tierName === 'pro-plus' || tierName === 'premium') {
                      await sendV2ProMaxWelcomeEmail(customer.email, undefined, billingPeriod);
                      console.log('[Webhook] checkout.completed - ✉️ V2 Pro Max welcome email sent');
                    } else if (tierName === 'pro') {
                      // Atomic claim — only send Pro welcome once per user
                      const { data: claimed } = await supabase
                        .from('user_profiles')
                        .update({ pro_welcome_email_sent: true })
                        .eq('id', userId)
                        .not('pro_welcome_email_sent', 'is', true)
                        .select('id')
                        .maybeSingle();

                      if (claimed) {
                        await sendV2ProWelcomeEmail(customer.email, undefined, billingPeriod);
                        console.log('[Webhook] checkout.completed - ✉️ V2 Pro welcome email sent');
                      } else {
                        console.log('[Webhook] checkout.completed - Pro welcome already sent — skipping');
                      }
                    }
                  } catch (emailErr) {
                    console.error('[Webhook] checkout.completed - V2 email error:', emailErr);
                  }
                }
              }
            } else {
              // Update existing profile — only set columns we know exist.
              // Reset cancellation email flags so a fresh resubscribe gets fresh emails.
              // Reset pro_welcome_email_sent so resubscribers get a fresh Pro welcome
              // regardless of what subscription.created sees as isNewSubscriptionCycle.
              const updatePayload = {
                subscription_tier: tierName,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscription.id,
                subscription_status: subscription.status as string,
                current_period_end: periodEndISO,
                cancel_at_period_end: subscription.cancel_at_period_end,
                cancellation_email_pending_sent: false,
                cancellation_email_final_sent: false,
                updated_at: new Date().toISOString()
              };

              console.log('[Webhook] checkout.completed - Update payload:', JSON.stringify(updatePayload));

              const { data: updateResult, error: profileError } = await supabase
                .from('user_profiles')
                .update(updatePayload)
                .eq('id', userId)
                .select('id, subscription_tier')
                .single();

              if (profileError) {
                console.error('[Webhook] checkout.completed - ❌ DB Update Error:', {
                  message: profileError.message,
                  code: profileError.code,
                  details: profileError.details,
                  hint: profileError.hint
                });
              } else {
                console.log('[Webhook] checkout.completed - ✅ DB Update Result:', {
                  id: updateResult?.id,
                  newTier: updateResult?.subscription_tier
                });

                // Send V2 welcome email based on tier
                if (customer.email) {
                  const billingPeriod = session.metadata?.billingPeriod || 'monthly';
                  try {
                    if (tierName === 'pro_plus' || tierName === 'pro-plus' || tierName === 'premium') {
                      await sendV2ProMaxWelcomeEmail(customer.email, undefined, billingPeriod);
                      console.log('[Webhook] checkout.completed - ✉️ V2 Pro Max welcome email sent');
                    } else if (tierName === 'pro') {
                      // Atomic claim — only send Pro welcome once per user
                      const { data: claimed } = await supabase
                        .from('user_profiles')
                        .update({ pro_welcome_email_sent: true })
                        .eq('id', userId)
                        .not('pro_welcome_email_sent', 'is', true)
                        .select('id')
                        .maybeSingle();

                      if (claimed) {
                        await sendV2ProWelcomeEmail(customer.email, undefined, billingPeriod);
                        console.log('[Webhook] checkout.completed - ✉️ V2 Pro welcome email sent');
                      } else {
                        console.log('[Webhook] checkout.completed - Pro welcome already sent — skipping');
                      }
                    }
                  } catch (emailErr) {
                    console.error('[Webhook] checkout.completed - V2 email error:', emailErr);
                  }
                }
              }
            }
          } else {
            console.error('[Webhook] checkout.completed - ❌ Could not find user for session:', session.id);
            console.error('[Webhook] checkout.completed - Metadata:', {
              subscriptionMetadata: subscription.metadata,
              sessionMetadata: session.metadata,
              customerEmail: customer.email
            });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        console.log('[Webhook] 📝 Processing customer.subscription.updated');
        const subscription = event.data.object as Stripe.Subscription;
        let userId = subscription.metadata.supabaseUserId;
        console.log('[Webhook] Subscription ID:', subscription.id);
        console.log('[Webhook] User ID from metadata:', userId || 'Not found');

        // If no userId in metadata, look up by stripe_subscription_id
        if (!userId) {
          console.log('[Webhook] subscription.updated - Looking up user by stripe_subscription_id');
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single();

          if (profile) {
            userId = profile.id;
            console.log('[Webhook] subscription.updated - Found user by subscription ID:', userId);
          } else {
            // Try by customer email as last resort
            const customerId = typeof subscription.customer === 'string' ? subscription.customer : null;
            if (customerId) {
              const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
              if (customer.email) {
                const { data: userByEmail } = await supabase
                  .from('user_profiles')
                  .select('id')
                  .eq('email', customer.email)
                  .single();

                // If not found in user_profiles by email, try auth.users
                if (userByEmail) {
                  userId = userByEmail.id;
                } else {
                  const { data: authUsers } = await supabase.auth.admin.listUsers();
                  const authUser = authUsers?.users?.find(u => u.email === customer.email);
                  if (authUser) {
                    userId = authUser.id;
                  }
                }
                if (userId) {
                  console.log('[Webhook] subscription.updated - Found user by customer email:', userId);
                }
              }
            }
          }
        }

        if (userId) {
          // Check V2 price IDs first
          const updatedPriceId = subscription.items?.data?.[0]?.price?.id;
          let tierName = V2_PRICE_TIERS[updatedPriceId || ''];
          let stripeTierName: string;

          if (tierName) {
            stripeTierName = tierName;
            console.log('[Webhook] subscription.updated - V2 price detected:', updatedPriceId, '→', tierName);
          } else {
            // Fall back to existing V1 logic
            stripeTierName = subscription.metadata.tierName || subscription.metadata.tier || 'PRO';
            tierName = mapTierName(stripeTierName);
          }
          const { periodEndISO } = getSubscriptionPeriodDates(subscription);

          console.log('[Webhook] subscription.updated - 🏷️ SETTING TIER:', stripeTierName, '→', tierName);
          console.log('[Webhook] subscription.updated - Status:', subscription.status);
          console.log('[Webhook] subscription.updated - cancel_at_period_end:', subscription.cancel_at_period_end);

          // Update user_profiles with subscription details (only known columns)
          const updatePayload = {
            subscription_tier: tierName,
            subscription_status: subscription.status as string,
            current_period_end: periodEndISO,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          };

          console.log('[Webhook] subscription.updated - User ID:', userId);
          console.log('[Webhook] subscription.updated - Update payload:', JSON.stringify(updatePayload));

          const { data: updateResult, error: profileError } = await supabase
            .from('user_profiles')
            .update(updatePayload)
            .eq('id', userId)
            .select('id, subscription_tier')
            .single();

          if (profileError) {
            console.error('[Webhook] subscription.updated - ❌ DB Error:', {
              message: profileError.message,
              code: profileError.code,
              details: profileError.details,
              hint: profileError.hint
            });
          } else if (!updateResult) {
            console.error('[Webhook] subscription.updated - ⚠️ Update returned no rows for userId:', userId);
          } else {
            console.log('[Webhook] subscription.updated - ✅ User profile updated');

            // Send upgrade welcome email if tier improved (Pro Max only — Pro welcome only fires on first-time creation)
            const newTier = updateResult.subscription_tier;
            try {
              const isProMaxUpgrade = newTier === 'pro_plus' || newTier === 'pro-plus' || newTier === 'premium';
              const isCancelling = subscription.cancel_at_period_end;

              if (isProMaxUpgrade && !isCancelling) {
                let emailToSend: string | undefined;
                try {
                  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
                  emailToSend = customer.email || undefined;
                } catch {}

                if (emailToSend) {
                  const interval = subscription.items?.data?.[0]?.plan?.interval || 'month';
                  const billingPeriod = interval === 'year' ? 'yearly' : 'monthly';

                  await sendV2ProMaxWelcomeEmail(emailToSend, undefined, billingPeriod);
                  console.log('[Webhook] ✉️ Pro Max upgrade welcome email sent');
                }
              }
            } catch (emailErr) {
              console.error('[Webhook] Upgrade email failed:', emailErr);
            }

            // Pending cancellation email — covers billing-portal cancels that bypass
            // /api/stripe/cancel-subscription. Atomic claim on cancellation_email_pending_sent
            // shares the flag with the in-app endpoint, so exactly one pending email
            // goes out per subscription cycle regardless of cancel path.
            // subscription.updated fires repeatedly during the cancel window (price
            // changes, billing-detail edits, dunning) — the claim catches every retry.
            // The final "your subscription has ended" email is sent separately from
            // customer.subscription.deleted using the cancellation_email_final_sent flag.
            if (subscription.cancel_at_period_end) {
              try {
                const { data: pendingClaimed } = await supabase
                  .from('user_profiles')
                  .update({ cancellation_email_pending_sent: true })
                  .eq('id', userId)
                  .or('cancellation_email_pending_sent.is.null,cancellation_email_pending_sent.eq.false')
                  .select('id')
                  .maybeSingle();

                if (pendingClaimed) {
                  const customerId = typeof subscription.customer === 'string' ? subscription.customer : null;
                  if (customerId) {
                    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
                    if (customer.email) {
                      const accessUntil = new Date(periodEndISO).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                      });
                      await sendV2CancellationEmail(customer.email, undefined, accessUntil);
                      console.log('[Webhook] ✉️ V2 cancellation pending email sent (billing-portal path)');
                    }
                  }
                } else {
                  console.log('[Webhook] subscription.updated - cancellation pending email already sent — skipping');
                }
              } catch (emailErr) {
                console.error('[Webhook] subscription.updated - pending cancel email failed:', emailErr);
              }
            }
          }
        } else {
          console.error('[Webhook] subscription.updated - ❌ Could not find user for subscription:', subscription.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        console.log('[Webhook] 🗑️ Processing customer.subscription.deleted');
        const subscription = event.data.object as Stripe.Subscription;
        let userId = subscription.metadata.supabaseUserId;
        console.log('[Webhook] Subscription ID:', subscription.id);
        console.log('[Webhook] User ID from metadata:', userId || 'Not found');

        // If no userId in metadata, look up by stripe_subscription_id
        if (!userId) {
          console.log('[Webhook] subscription.deleted - Looking up user by stripe_subscription_id');
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single();

          if (profile) {
            userId = profile.id;
            console.log('[Webhook] subscription.deleted - Found user by subscription ID:', userId);
          } else {
            // Try by customer email as last resort
            const customerId = typeof subscription.customer === 'string' ? subscription.customer : null;
            if (customerId) {
              const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
              if (customer.email) {
                const { data: authUsers } = await supabase.auth.admin.listUsers();
                const authUser = authUsers?.users?.find(u => u.email === customer.email);
                if (authUser) {
                  userId = authUser.id;
                  console.log('[Webhook] subscription.deleted - Found user by customer email:', userId);
                }
              }
            }
          }
        }

        if (userId) {
          // Update user_profiles - reset to basic tier
          const { error: profileError } = await supabase
            .from('user_profiles')
            .update({
              subscription_tier: 'basic',
              subscription_status: 'canceled',
              cancel_at_period_end: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (profileError) {
            console.error('[Webhook] subscription.deleted - ❌ DB Error:', profileError);
          } else {
            console.log('[Webhook] subscription.deleted - ✅ User profile reset to basic tier');
          }

          // Send the final "your subscription has ended" email — exactly once per
          // subscription cycle. Atomic claim on cancellation_email_final_sent prevents
          // duplicates even if Stripe retries the deleted event or our dedup falls open.
          try {
            const { data: claimed } = await supabase
              .from('user_profiles')
              .update({ cancellation_email_final_sent: true })
              .eq('id', userId)
              .or('cancellation_email_final_sent.is.null,cancellation_email_final_sent.eq.false')
              .select('id')
              .maybeSingle();

            if (claimed) {
              const customerId = typeof subscription.customer === 'string' ? subscription.customer : null;
              if (customerId) {
                const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
                if (customer.email) {
                  await sendV2CancellationCompleteEmail(customer.email);
                  console.log('[Webhook] ✉️ V2 cancellation complete email sent');
                }
              }
            } else {
              console.log('[Webhook] subscription.deleted - cancellation complete email already sent — skipping');
            }
          } catch (emailErr) {
            console.error('[Webhook] subscription.deleted - email send failed:', emailErr);
          }
        } else {
          console.error('[Webhook] subscription.deleted - ❌ Could not find user for subscription:', subscription.id);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        console.log('[Webhook] 💰 Processing invoice.payment_succeeded');
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[Webhook] Invoice ID:', invoice.id);
        console.log('[Webhook] Amount:', invoice.amount_paid / 100, invoice.currency?.toUpperCase());
        
        if ((invoice as any).subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription as string
          ) as Stripe.Subscription;
          const userId = subscription.metadata.supabaseUserId;

          if (userId) {
            // Record payment in billing history
            await supabase
              .from('billing_history')
              .insert({
                user_id: userId,
                stripe_invoice_id: invoice.id,
                stripe_payment_intent_id: (invoice as any).payment_intent as string,
                amount_paid: invoice.amount_paid,
                currency: invoice.currency,
                status: 'paid',
                invoice_pdf: (invoice as any).invoice_pdf,
                paid_at: new Date().toISOString()
              });

            // Reset usage for new billing period if needed
            const { periodStartISO, periodEndISO } = getSubscriptionPeriodDates(subscription);

            await supabase
              .from('usage_tracking')
              .upsert({
                user_id: userId,
                period_start: periodStartISO,
                period_end: periodEndISO,
                analysis_count: 0
              }, {
                onConflict: 'user_id,period_start'
              });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        console.log('[Webhook] ❌ Processing invoice.payment_failed');
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[Webhook] Invoice ID:', invoice.id);
        console.log('[Webhook] Amount attempted:', invoice.amount_due / 100, invoice.currency?.toUpperCase());
        
        if ((invoice as any).subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription as string
          ) as Stripe.Subscription;
          const userId = subscription.metadata.supabaseUserId;

          if (userId) {
            // Update subscription status to past_due
            await supabase
              .from('subscriptions')
              .update({
                status: 'past_due'
              })
              .eq('stripe_subscription_id', subscription.id);

            // Record failed payment
            await supabase
              .from('billing_history')
              .insert({
                user_id: userId,
                stripe_invoice_id: invoice.id,
                stripe_payment_intent_id: (invoice as any).payment_intent as string,
                amount_paid: 0,
                currency: invoice.currency,
                status: 'failed'
              });
          }
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.supabaseUserId;

        if (userId) {
          // You can send an email notification here
          // SEC-009: Don't log user IDs
          console.log('[Webhook] Trial ending soon for user [REDACTED]');
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await supabase
      .from('webhook_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('stripe_event_id', event.id);

    const processingTime = Date.now() - startTime;
    console.log('[Webhook] ✅ Event processed successfully');
    console.log('[Webhook] Processing time:', processingTime, 'ms');
    console.log('[Webhook] ========================================');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] ❌ CRITICAL ERROR:', error);
    console.error('[Webhook] Stack trace:', (error as Error).stack);
    console.log('[Webhook] ========================================');
    
    // Record error in webhook_events if we have the event ID
    if ((error as any).event?.id) {
      const supabase = createAdminClient();
      await supabase
        .from('webhook_events')
        .update({
          error: (error as Error).message,
          processed: false
        })
        .eq('stripe_event_id', (error as any).event.id);
    }
    
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}