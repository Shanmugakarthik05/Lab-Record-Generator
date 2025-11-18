# Google Authentication Setup Guide

## 🔐 Overview
This Lab Record Generator now requires Google Account authentication before users can generate or download any records.

## 📋 Features Implemented

✅ **Secure Login**: Users must sign in with Google before accessing the generator
✅ **User Profile Display**: Shows user's name, email, and profile picture in top-right corner
✅ **Session Management**: Maintains login session across page refreshes
✅ **Logout Functionality**: Users can securely logout with confirmation dialog
✅ **Auto-save Integration**: User info is preserved and linked to their records
✅ **Access Control**: All record generation and download features are locked behind authentication

## 🚀 Quick Start (Demo Mode)

The application is currently configured with a **demo Google Client ID** for testing purposes. 

**Note**: The demo Client ID may have limited functionality or may not work in production. You should replace it with your own Client ID.

## 🔧 Setting Up Your Own Google OAuth Client ID

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Identity Services API**

### Step 2: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (or Internal if using Google Workspace)
3. Fill in required information:
   - App name: `Lab Record Generator`
   - User support email: Your email
   - Developer contact email: Your email
4. Add scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
5. Save and continue

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: Lab Record Generator
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for local development)
     - `https://yourdomain.com` (your production domain)
   - **Authorized redirect URIs**: (Usually not needed for Google Identity Services)
5. Click **Create**
6. Copy your **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)

### Step 4: Update Your Application

Replace the demo Client ID in `/components/GoogleLogin.tsx`:

```typescript
const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
```

Or set it as an environment variable:

```bash
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

### Step 5: Test Your Implementation

1. Start your application
2. You should see the Google Sign-In screen
3. Click "Sign in with Google"
4. Authorize the application
5. You should be redirected to the Lab Record Generator

## 🔒 Security Features

- **JWT Token Validation**: User credentials are decoded from Google's secure JWT token
- **Local Session Storage**: User authentication state is stored securely in localStorage
- **Protected Routes**: All record generation features require authentication
- **Logout Confirmation**: Prevents accidental logouts
- **Session Persistence**: User remains logged in across page refreshes

## 🎯 User Flow

```
┌─────────────────────┐
│   User Visits App   │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Authenticated?│
    └──────┬───────┘
           │
    ┌──────┴──────┐
    │             │
   No            Yes
    │             │
    ▼             ▼
┌─────────┐   ┌──────────────────┐
│ Google  │   │  Lab Record      │
│ Sign-In │   │  Generator       │
│ Screen  │   │  (Full Access)   │
└────┬────┘   └──────────────────┘
     │
     ▼
   Login
     │
     ▼
┌──────────────────┐
│  Lab Record      │
│  Generator       │
│  (Full Access)   │
└──────────────────┘
```

## 📊 User Data Stored

After successful login, the following data is stored:

```json
{
  "login_status": "success",
  "user_name": "John Doe",
  "email": "john.doe@example.com",
  "user_id": "google_uid_123456789",
  "profile_image": "https://lh3.googleusercontent.com/..."
}
```

## 🛡️ Access Control

**Blocked Without Authentication:**
- ❌ Record Type Selection
- ❌ Course Information Form
- ❌ Experiment/Session Entry
- ❌ Document Preview
- ❌ Print / Save as PDF
- ❌ History View

**Allowed Without Authentication:**
- ✅ Login Screen Only

## 🔄 Logout Process

1. User clicks on their profile picture (top-right)
2. Selects "Logout" from dropdown menu
3. Confirmation dialog appears
4. Upon confirmation:
   - Session is cleared from localStorage
   - User is redirected to login screen
   - All app state is reset

## 📱 Responsive Design

The authentication system is fully responsive:
- **Desktop**: Full profile display with name and email
- **Mobile**: Profile picture only, full details in dropdown

## 🆘 Troubleshooting

### Issue: "Google Sign-in failed"
- **Solution**: Check your Client ID is correct
- Verify your domain is in Authorized JavaScript origins
- Check browser console for detailed error messages

### Issue: Sign-in button not appearing
- **Solution**: Check your internet connection
- Verify Google Identity Services script is loading
- Clear browser cache and try again

### Issue: "Client ID not valid"
- **Solution**: Make sure you've replaced the demo Client ID with your own
- Verify the Client ID is from a Web application type credential

## 📞 Support

For issues related to Google OAuth setup, refer to:
- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

---

**Developed by SHANMUGAKARTHIK G**  
B. TECH - INFORMATION TECHNOLOGY  
SAVEETHA ENGINEERING COLLEGE  
© 2025 SK TECH
