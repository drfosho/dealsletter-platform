#!/bin/bash

# Fix all ESLint errors

# Fix unused imports and variables
sed -i '' "s/'Image' is defined but never used/// Image import removed/g" src/app/pricing/page.tsx
sed -i '' '/^import Image/d' src/app/pricing/page.tsx

# Fix unused variables by prefixing with underscore
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\(request\)\s*:/(_request):/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/catch\s*(e)/catch (_e)/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/catch\s*(error)/catch (_error)/g'

# Fix React unescaped entities
find src -name "*.tsx" | xargs sed -i '' "s/you're/you\&apos;re/g"
find src -name "*.tsx" | xargs sed -i '' "s/You're/You\&apos;re/g"
find src -name "*.tsx" | xargs sed -i '' "s/\"\([^\"]*\)\"/\&quot;\1\&quot;/g"

echo "ESLint fixes applied"