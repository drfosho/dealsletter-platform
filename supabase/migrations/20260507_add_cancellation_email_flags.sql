-- Atomic-claim flags so cancellation emails are sent exactly once per subscription cycle.
-- cancellation_email_pending_sent: set when /cancel-subscription sends the immediate
--   "we received your cancellation, access until X" email.
-- cancellation_email_final_sent: set when the customer.subscription.deleted webhook
--   sends the "your subscription has ended" email at period end.
-- Both flags are reset to false on customer.subscription.created / checkout.session.completed
-- so a resubscribe-then-cancel cycle gets fresh emails.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS cancellation_email_pending_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cancellation_email_final_sent BOOLEAN DEFAULT FALSE;
