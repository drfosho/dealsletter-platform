#\!/bin/bash

# Fix unused variables and parameters

# Fix unused function parameters
sed -i '' 's/export async function GET(request:/export async function GET(_request:/' src/app/api/analysis/usage/route.ts
sed -i '' 's/export async function GET(request:/export async function GET(_request:/' src/app/api/health/route.ts
sed -i '' 's/export async function GET(request:/export async function GET(_request:/' src/app/api/test-rentcast/route.ts
sed -i '' 's/export async function GET(request:/export async function GET(_request:/' src/app/api/test-simple/route.ts

# Fix catch blocks
sed -i '' 's/} catch (error)/} catch (_error)/' src/app/api/analysis/import-to-dashboard/route.ts
sed -i '' 's/} catch (error)/} catch (_error)/' src/app/api/analysis/stats/route.ts
sed -i '' 's/} catch (e)/} catch (_e)/' src/app/api/test-rentcast/route.ts
sed -i '' 's/} catch (e)/} catch (_e)/' src/app/api/test-simple/route.ts
sed -i '' 's/} catch (error)/} catch (_error)/' src/components/SubscriptionManager.tsx

# Fix unused imports
sed -i '' '/^import Image/d' src/app/pricing/page.tsx
sed -i '' 's/import { useEffect, useState/import {/' src/components/LoadingStates.tsx
sed -i '' 's/import { UserAnalysis, CreateAnalysisInput }/import {/' src/app/api/analysis/generate/route.ts

# Fix unused variables
sed -i '' 's/const \[canProceed,/const [_canProceed,/' src/app/analysis/new/page.tsx
sed -i '' 's/const router = useRouter();/const _router = useRouter();/' src/components/SubscriptionManager.tsx
sed -i '' 's/const router = useRouter();/const _router = useRouter();/' src/components/analysis-wizard/Step4Generate.tsx
sed -i '' 's/const \[analysisId,/const [_analysisId,/' src/components/analysis-wizard/Step4Generate.tsx
sed -i '' 's/const isNearLimit/const _isNearLimit/' src/components/SubscriptionManager.tsx
sed -i '' 's/const { addNotification }/const { _addNotification }/' src/components/SubscriptionManager.tsx
sed -i '' 's/const \[errors,/const [_errors,/' src/components/analysis-wizard/Step3Financial.tsx
sed -i '' 's/setCurrentRates/_setCurrentRates/' src/components/analysis-wizard/Step3Financial.tsx
sed -i '' 's/yearlyInterest/_yearlyInterest/' src/components/analysis/InvestmentProjections.tsx
sed -i '' 's/yearlyPrincipal/_yearlyPrincipal/' src/components/analysis/InvestmentProjections.tsx

# Fix map/filter index parameters
sed -i '' 's/\.map((feature, index)/\.map((feature, _index)/' src/app/dashboard/MapView.tsx
sed -i '' 's/\.map((s, index)/\.map((s, _index)/' src/components/analysis/InvestmentProjections.tsx

# Fix function parameters
sed -i '' 's/userId: string)/\_userId: string)/' src/components/MyAnalyzedProperties.tsx
sed -i '' 's/placeId:/\_placeId:/' src/components/property-search/PropertySearch.tsx
sed -i '' 's/onComplete:/\_onComplete:/' src/components/analysis-wizard/Step5Results.tsx

# Fix RentCastError
sed -i '' '/^  RentCastError,/d' src/services/rentcast.ts
sed -i '' 's/, radius:/, _radius:/' src/services/rentcast.ts

echo "Fixed unused variables"
EOF < /dev/null