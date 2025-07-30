#!/bin/bash

echo "Fixing all ESLint errors for Vercel deployment..."

# Fix unused variables by prefixing with underscore
echo "Fixing unused variables..."

# Fix simple unused parameters in API routes
sed -i '' 's/export async function GET(request: NextRequest)/export async function GET(_request: NextRequest)/g' src/app/api/analysis/usage/route.ts
sed -i '' 's/export async function GET(request: NextRequest)/export async function GET(_request: NextRequest)/g' src/app/api/health/route.ts
sed -i '' 's/export async function GET(request: NextRequest)/export async function GET(_request: NextRequest)/g' src/app/api/test-rentcast/route.ts
sed -i '' 's/export async function GET(request: NextRequest)/export async function GET(_request: NextRequest)/g' src/app/api/test-simple/route.ts

# Fix catch block errors
sed -i '' 's/} catch (error) {/} catch {/g' src/app/api/analysis/import-to-dashboard/route.ts
sed -i '' 's/} catch (error) {/} catch {/g' src/app/api/analysis/stats/route.ts
sed -i '' 's/} catch (e) {/} catch {/g' src/app/api/test-rentcast/route.ts
sed -i '' 's/} catch (e) {/} catch {/g' src/app/api/test-simple/route.ts
sed -i '' 's/} catch (error) {/} catch {/g' src/components/SubscriptionManager.tsx

# Fix other unused variables
sed -i '' 's/const now = new Date();/const _now = new Date();/g' src/app/analysis/history/page.tsx
sed -i '' 's/const canProceed =/const _canProceed =/g' src/app/analysis/new/page.tsx
sed -i '' 's/const router = useRouter();/const _router = useRouter();/g' src/components/SubscriptionManager.tsx
sed -i '' 's/const router = useRouter();/const _router = useRouter();/g' src/components/analysis-wizard/Step4Generate.tsx
sed -i '' 's/const \[analysisId, setAnalysisId\]/const [_analysisId, setAnalysisId]/g' src/components/analysis-wizard/Step4Generate.tsx
sed -i '' 's/export default function MyAnalyzedProperties({ userId }/export default function MyAnalyzedProperties({ userId: _userId }/g' src/components/MyAnalyzedProperties.tsx
sed -i '' 's/.map((deal, index) =>/.map((deal) =>/g' src/app/dashboard/MapView.tsx
sed -i '' 's/.map((data, index) =>/.map((data) =>/g' src/components/analysis/InvestmentProjections.tsx
sed -i '' 's/const yearlyInterest =/const _yearlyInterest =/g' src/components/analysis/InvestmentProjections.tsx
sed -i '' 's/const yearlyPrincipal =/const _yearlyPrincipal =/g' src/components/analysis/InvestmentProjections.tsx
sed -i '' 's/const { addNotification } = useNotifications();//' src/components/SubscriptionManager.tsx
sed -i '' 's/const isNearLimit =/const _isNearLimit =/g' src/components/SubscriptionManager.tsx
sed -i '' 's/import { useEffect, useState } from/import { useState } from/g' src/components/LoadingStates.tsx
sed -i '' 's/const \[errors, setErrors\]/const [_errors, setErrors]/g' src/components/analysis-wizard/Step3Financial.tsx
sed -i '' 's/const \[currentRates, setCurrentRates\]/const [_currentRates, _setCurrentRates]/g' src/components/analysis-wizard/Step3Financial.tsx
sed -i '' 's/{ data, onComplete }/{ data }/g' src/components/analysis-wizard/Step5Results.tsx
sed -i '' 's/const handleAddressSelect = async (address: string, placeId: string)/const handleAddressSelect = async (address: string, _placeId: string)/g' src/components/property-search/PropertySearch.tsx
sed -i '' 's/import Image from/import/g' src/app/pricing/page.tsx
sed -i '' 's/, radius = 10/, _radius = 10/g' src/services/rentcast.ts

# Remove unused import line from Step5Results
sed -i '' 's/  _onComplete: () => void;//' src/components/analysis-wizard/Step5Results.tsx

# Fix RentCastError unused type
sed -i '' '/RentCastError,/d' src/services/rentcast.ts

# Fix React unescaped entities
echo "Fixing React unescaped entities..."
sed -i '' "s/You're /You\&apos;re /g" src/components/SubscriptionManager.tsx
sed -i '' "s/You've /You\&apos;ve /g" src/components/analysis/UsageStats.tsx
sed -i '' "s/Let's /Let\&apos;s /g" src/components/analysis-wizard/Step5Results.tsx
sed -i '' 's/"Compare"/\&ldquo;Compare\&rdquo;/g' src/components/analysis/ComparisonModal.tsx

echo "Script completed!"