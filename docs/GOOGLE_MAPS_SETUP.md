# Google Maps API Setup

## Prerequisites

To use the location autocomplete feature, you need to set up a Google Maps API key with the Places API enabled.

## Steps to Get Your API Key

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project (if needed)**
   - Click on the project dropdown in the top navigation
   - Click "New Project"
   - Enter a project name and click "Create"

3. **Enable the Places API**
   - In the sidebar, navigate to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click on "Places API" and then click "Enable"

4. **Create API Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Your API key will be generated

5. **Restrict Your API Key (Recommended)**
   - Click on your newly created API key
   - Under "Application restrictions":
     - For development: Select "HTTP referrers"
     - Add `http://localhost:3000/*` and `http://localhost:*`
     - For production: Add your production domain
   - Under "API restrictions":
     - Select "Restrict key"
     - Select "Places API" from the list
   - Click "Save"

## Configure Your Application

1. **Add the API Key to Your Environment**
   - Open `.env.local` in your project root
   - Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
   ```

2. **Restart Your Development Server**
   ```bash
   npm run dev
   ```

## Testing the Integration

1. Navigate to the dashboard page
2. Click on the location search input
3. Start typing a city name (e.g., "San Francisco")
4. You should see autocomplete suggestions appear

## Troubleshooting

### "Google Maps not loaded" Error
- Ensure your API key is correctly set in `.env.local`
- Check that the Places API is enabled in Google Cloud Console
- Verify there are no restrictions blocking your domain

### No Suggestions Appearing
- Check the browser console for any API errors
- Ensure you're typing city names (the component is configured for city search)
- Verify your API key has proper permissions

### Billing
- Google provides $200 free credit monthly
- The Places API Autocomplete costs $2.83 per 1000 requests
- Monitor usage in Google Cloud Console to avoid unexpected charges

## Security Notes

- Never commit your API key to version control
- Always use environment variables for API keys
- Restrict your API key to specific domains in production
- Consider implementing request limiting on your backend