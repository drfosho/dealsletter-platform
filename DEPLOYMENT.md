# Deployment Guide for Dealsletter Platform

## Vercel Deployment

### Prerequisites
- Vercel account (sign up at vercel.com)
- GitHub repository with your code
- Supabase project set up

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to vercel.com and sign in**

2. **Import your project**:
   - Click "Add New Project"
   - Connect your GitHub account if not already connected
   - Select the `dealsletter-platform` repository
   - Click "Import"

3. **Configure project settings**:
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next` 
   - Install Command: `npm install`
   - Node.js Version: 18.x

4. **Add Environment Variables**:
   Go to the Environment Variables section and add:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xsiflgnnowyvkhxjwmuu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzaWZsZ25ub3d5dmtoeGp3bXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTk1MTksImV4cCI6MjA2ODE3NTUxOX0.FrTbaY2jSqUjbkYSoKSmk_SA8GF5TX3UaxJJu7bL7uc
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
   ```
   
   **Note**: Get the actual `SUPABASE_SERVICE_ROLE_KEY` from your Supabase Dashboard > Settings > API

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at the provided Vercel URL

### Method 2: Deploy via Vercel CLI

1. **Login to Vercel**:
   ```bash
   npx vercel login
   ```

2. **Deploy**:
   ```bash
   npx vercel --prod
   ```

3. **Configure environment variables via CLI**:
   ```bash
   npx vercel env add NEXT_PUBLIC_SUPABASE_URL
   npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   npx vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

## Supabase Configuration

### Required Environment Variables

1. **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anonymous key
3. **SUPABASE_SERVICE_ROLE_KEY**: Your Supabase service role key (for server-side operations)

### Getting Supabase Keys

1. Go to your Supabase dashboard
2. Navigate to Settings > API
3. Copy the required keys:
   - Project URL
   - Anon public key
   - Service role key (keep this secret!)

## Domain Configuration

### Temporary Domain
Your app will be deployed to a Vercel-provided domain like:
`https://dealsletter-platform-username.vercel.app`

### Custom Domain (Optional)
To add a custom domain:
1. Go to your Vercel project dashboard
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication flow
- [ ] Check blog articles display properly
- [ ] Verify dark/light mode switching
- [ ] Test dashboard functionality
- [ ] Confirm Supabase connection works
- [ ] Check that all images load (especially blog article headers)

## Troubleshooting

### Common Issues

1. **Build Failures**: Check for TypeScript/ESLint errors
2. **Environment Variables**: Ensure all required variables are set
3. **Supabase Connection**: Verify URLs and keys are correct
4. **Image Loading**: Check file paths and case sensitivity

### Debug Commands

```bash
# Check build locally
npm run build

# Check for linting issues
npm run lint

# Test production build locally
npm run start
```

## Monitoring

Once deployed, you can monitor your application:
- Vercel Dashboard: Analytics, function logs, performance
- Supabase Dashboard: Database metrics, auth logs
- Real-time error monitoring via Vercel's built-in analytics