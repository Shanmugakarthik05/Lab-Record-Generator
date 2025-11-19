# Deployment Setup for Vercel

## Important: Supabase Configuration for Production

To ensure email confirmations redirect to your production site (`https://sec-record-generator.vercel.app/`) instead of localhost, you need to configure your Supabase project settings.

### Steps to Configure Supabase for Production:

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "URL Configuration"

3. **Configure Site URL**
   - Set **Site URL** to: `https://sec-record-generator.vercel.app`
   - This is the main URL users will be redirected to after email confirmation

4. **Configure Redirect URLs**
   - Add the following to **Redirect URLs** (one per line):
     ```
     https://sec-record-generator.vercel.app/**
     https://sec-record-generator.vercel.app/dashboard
     http://localhost:3000/**
     http://localhost:3000/dashboard
     ```
   - The `**` wildcard allows all paths under your domain
   - Keep localhost URLs for local development

5. **Save Changes**
   - Click "Save" at the bottom of the page

### For Google OAuth (if using):

1. **Update Google Cloud Console**
   - Go to: https://console.cloud.google.com
   - Select your project
   - Navigate to "APIs & Services" → "Credentials"
   - Edit your OAuth 2.0 Client ID

2. **Add Production URLs**
   - Under "Authorized JavaScript origins", add:
     ```
     https://sec-record-generator.vercel.app
     ```
   - Under "Authorized redirect URIs", add:
     ```
     https://<your-project-id>.supabase.co/auth/v1/callback
     ```
   - Keep your localhost URLs for development

3. **Save Changes**

### Email Templates Configuration (Optional but Recommended):

1. In Supabase Dashboard → Authentication → Email Templates
2. Update the confirmation email template if needed
3. The default template uses `{{ .ConfirmationURL }}` which will automatically use your configured Site URL

## Verification:

After deployment to Vercel:

1. **Test Email Confirmation Flow**
   - Sign up with a new email
   - Check the confirmation email
   - Click the confirmation link
   - Verify it redirects to `https://sec-record-generator.vercel.app/dashboard` (not localhost)

2. **Test Password Reset Flow**
   - Click "Forgot Password?"
   - Enter your email
   - Check the reset email
   - Click the reset link
   - Verify it redirects to your production site

3. **Test Google OAuth** (if configured)
   - Click "Continue with Google"
   - Verify it redirects back to your production site after authentication

## Environment Variables on Vercel:

Make sure you have set these environment variables in your Vercel project settings:

- `VITE_SUPABASE_URL` (if you're using Vite environment variables)
- `VITE_SUPABASE_ANON_KEY` (if you're using Vite environment variables)

**Note:** The current implementation uses hardcoded values in `/utils/supabase/info.tsx`, so environment variables are not required unless you want to make them configurable.

## Troubleshooting:

### Issue: Email confirmation still redirects to localhost
**Solution:** 
- Double-check Site URL in Supabase is set to production URL
- Clear browser cache and cookies
- Check that the email was sent AFTER updating the Supabase settings

### Issue: "Invalid Redirect URL" error
**Solution:**
- Verify the redirect URL is added to the allowed list in Supabase
- Make sure there are no typos in the URLs
- Check that the URL includes the protocol (https://)

### Issue: Google OAuth not working
**Solution:**
- Verify Google Cloud Console has production URLs configured
- Check that the OAuth callback URL matches your Supabase project
- Ensure Google OAuth is enabled in Supabase Authentication → Providers

## Notes:

- The app code already uses `window.location.origin` for redirects, which means it automatically adapts to the current domain
- No code changes are needed - only Supabase dashboard configuration
- You can keep localhost URLs in the redirect list for local development
- Changes to Supabase URL configuration take effect immediately
