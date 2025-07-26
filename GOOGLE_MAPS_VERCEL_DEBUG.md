# Google Maps API Vercel Deployment Debug Guide

## Issue
Google Places API works locally but not on Vercel deployment - search bar shows spinning wheel with no errors.

## Debug Steps Added

### 1. Enhanced Console Logging
We've added comprehensive logging to help debug the issue in production:

- API key presence and length logging
- Script load status tracking
- Google Maps object availability checks
- Autocomplete service response logging

### 2. Check Browser Console on Vercel
Visit your deployed site and open the browser console (F12) to see:
- `[Google Maps]` prefixed logs showing loading status
- `[LocationSearch]` prefixed logs showing component behavior
- Any error messages related to API key or script loading

## Vercel Configuration Checklist

### Environment Variables
1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Verify you have added**:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
   ```
3. **Important**: Make sure there are NO quotes around the value
4. **Redeploy** after adding/updating environment variables

### Google Cloud Console Configuration
1. **API Key Restrictions**:
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Click on your API key
   - Under "Application restrictions":
     - Select "HTTP referrers (websites)"
     - Add these referrers:
       ```
       https://your-app.vercel.app/*
       https://*.vercel.app/*
       http://localhost:3000/*
       ```
   - Replace `your-app` with your actual Vercel subdomain

2. **Enabled APIs**:
   - Ensure these APIs are enabled:
     - Maps JavaScript API
     - Places API
     - Geocoding API (if needed)

### Debugging Steps

1. **Check if API key is loaded**:
   - Open browser console on Vercel deployment
   - Look for: `[Google Maps] API Key present: true`
   - If false, the environment variable isn't set correctly

2. **Check for API errors**:
   - Look for any 403 or 401 errors in Network tab
   - These indicate API key or restriction issues

3. **Verify script loading**:
   - Look for: `[Google Maps] Script loaded successfully`
   - Check if Google objects are available

4. **Test with unrestricted key** (temporarily):
   - Remove all restrictions from your API key
   - Redeploy and test
   - If it works, the issue is with restrictions

## Common Issues and Solutions

### Issue: Environment variable not loading
**Solution**: 
- Ensure variable name is exactly `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Redeploy after adding variable
- Check build logs for any warnings

### Issue: API key restrictions blocking requests
**Solution**:
- Add all possible Vercel domains to allowed referrers
- Include preview deployments: `https://*.vercel.app/*`

### Issue: CORS or Content Security Policy
**Solution**:
- Check browser console for CSP violations
- Ensure no browser extensions are blocking scripts

## Next Steps

1. Deploy with the new logging code
2. Visit the Vercel deployment and open browser console
3. Copy all `[Google Maps]` and `[LocationSearch]` logs
4. Check Network tab for any failed requests to googleapis.com

The logs will tell us exactly where the issue is occurring.