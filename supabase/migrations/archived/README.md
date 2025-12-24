# Archived Migrations

These migration files have been archived because they contain **outdated tier limits** that conflict with the current pricing structure (December 2024).

## DO NOT RUN THESE FILES

The current authoritative migration for subscription tiers is:
**`../20241224_add_pro_plus_tier.sql`**

## Current Pricing Structure

| Tier | Price | Analyses/Month |
|------|-------|----------------|
| FREE | $0 | 3 |
| PRO | $29 | 50 |
| PRO PLUS | $59 | 200 |
| PREMIUM | Legacy | 50 |

## Archived Files

| File | Reason Archived |
|------|-----------------|
| `20250109_fix_subscription_tiers.sql` | Used starter=12, professional=25 (incorrect) |
| `update_subscription_limits_dec_2024.sql` | Used pro=30 (now 50) |
| `20250115_security_fix_part2_functions.sql` | Used pro=25 (now 50), missing pro-plus tier |

## Date Archived
2024-12-24
