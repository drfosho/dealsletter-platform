# Fix Google Places API Blocking on Vercel

## Issue
The error `Requests from referer https://dealsletter-platform-6h8i-6tpkkfdbr-drfoshos-projects.vercel.app/ are blocked` indicates that your Google API key restrictions are blocking requests from Vercel preview deployments.

## Solution

### 1. Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your API key

### 2. Update Application Restrictions
Under **Application restrictions**, select **HTTP referrers (websites)** and add these patterns:

```
https://dealsletter-platform.vercel.app/*
https://dealsletter-platform-*.vercel.app/*
https://*.vercel.app/*
https://dealsletter.com/*
https://www.dealsletter.com/*
http://localhost:3000/*
http://localhost:3001/*
```

### 3. Important Patterns Explained
- `https://dealsletter-platform.vercel.app/*` - Your main Vercel deployment
- `https://dealsletter-platform-*.vercel.app/*` - Covers ALL preview deployments
- `https://*.vercel.app/*` - Backup pattern for any Vercel domain
- Your custom domain (if you have one)

### 4. Alternative: Temporary Testing
If you need to test immediately, you can temporarily:
1. Set **Application restrictions** to **None**
2. Test your deployment
3. Then re-enable restrictions with the correct patterns

### 5. API Services to Enable
Ensure these APIs are enabled in your project:
- **Maps JavaScript API**
- **Places API**
- **Geocoding API** (if using geocoding features)

### 6. Save and Wait
After adding the referrers:
1. Click **Save**
2. Wait 1-5 minutes for changes to propagate
3. Refresh your Vercel deployment

## Vercel-Specific Notes

Vercel creates unique URLs for each deployment:
- Production: `your-app.vercel.app`
- Preview: `your-app-[unique-hash]-[username].vercel.app`
- Branch: `your-app-[branch]-[username].vercel.app`

The pattern `https://dealsletter-platform-*.vercel.app/*` with wildcard (*) covers all these variations.

## Verification Steps
1. After updating restrictions, check the browser console
2. You should see successful API calls without blocking errors
3. The autocomplete suggestions should appear when typing

## Security Best Practice
Only add the domains you actually use. Remove `http://localhost:*` patterns before going to production if security is a concern.