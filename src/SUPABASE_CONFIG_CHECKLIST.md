# 🚀 Supabase Configuration Checklist

## ✅ What's Been Done:
- ✅ Production URL hardcoded in code: `https://sec-record-generator.vercel.app`
- ✅ All auth redirects point to production URL
- ✅ Email confirmations will redirect to production
- ✅ Password resets will redirect to production
- ✅ Google OAuth will redirect to production

## ⚙️ What You Need to Do in Supabase Dashboard:

### 1️⃣ Supabase Dashboard Configuration (REQUIRED)

Go to: https://supabase.com/dashboard → Your Project → **Authentication** → **URL Configuration**

#### Set Site URL:
```
https://sec-record-generator.vercel.app
```

#### Add Redirect URLs (add each line):
```
https://sec-record-generator.vercel.app/**
https://sec-record-generator.vercel.app/dashboard
http://localhost:3000/**
http://localhost:3000/dashboard
```

**Click SAVE!**

---

### 2️⃣ Google Cloud Console (if using Google OAuth)

Go to: https://console.cloud.google.com → Your Project → **APIs & Services** → **Credentials** → Edit OAuth Client

#### Authorized JavaScript origins:
```
https://sec-record-generator.vercel.app
http://localhost:3000
```

#### Authorized redirect URIs:
```
https://rhyrjleewslkxhrzhtty.supabase.co/auth/v1/callback
http://localhost:3000
```

**Click SAVE!**

---

## 🧪 Testing Checklist:

After configuring Supabase:

1. **Test Google OAuth:**
   - [ ] Click "Continue with Google" locally
   - [ ] Verify it redirects to `https://sec-record-generator.vercel.app/dashboard`
   - [ ] Not to `http://localhost:3000/dashboard`

2. **Test Email Signup:**
   - [ ] Sign up with new email
   - [ ] Check confirmation email
   - [ ] Click link in email
   - [ ] Verify redirect to production site

3. **Test Password Reset:**
   - [ ] Click "Forgot Password?"
   - [ ] Enter email and send
   - [ ] Check reset email
   - [ ] Click link in email
   - [ ] Verify redirect to production site

---

## 🔍 Quick Verification:

**Before Supabase Config:** OAuth redirects to localhost ❌
**After Supabase Config:** OAuth redirects to production ✅

---

## ⚡ Important Notes:

1. **You MUST configure Supabase redirect URLs** - the code change alone is not enough
2. Keep localhost URLs for local development
3. Changes take effect immediately (no deployment needed)
4. If you see "Invalid Redirect URL" error, double-check the URLs in Supabase

---

## 🎯 Current Status:

- [x] Code updated with production URL
- [ ] Supabase Site URL configured
- [ ] Supabase Redirect URLs configured
- [ ] Google Cloud Console configured (if using OAuth)
- [ ] Tested and verified

---

**Your Project ID:** `rhyrjleewslkxhrzhtty`
**Production URL:** `https://sec-record-generator.vercel.app`
**Callback URL:** `https://rhyrjleewslkxhrzhtty.supabase.co/auth/v1/callback`
