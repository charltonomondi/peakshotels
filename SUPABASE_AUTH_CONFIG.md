# Supabase Authentication Configuration

## Required Settings for Loyalty Program

To fix "Invalid credentials" errors during login, configure these settings in your Supabase dashboard:

### 1. Disable Email Confirmation (Recommended for Development)

**Path:** `Authentication → Providers → Email`

- **Enable email confirmations:** ❌ **Disable this**
- This allows users to login immediately after signup without confirming email

**Why?** The signup flow currently redirects to `/loyalty/dashboard` immediately, expecting the user to be logged in. If email confirmation is required, users get logged out and then can't login until they confirm.

### 2. Alternative: Enable Auto-Confirm (Better for Production)

If you want to keep email validation but allow immediate login:

**Path:** `Authentication → Providers → Email`

- **Confirm email:** Enable
- **Enable email confirmations:** ✅ Enable
- **Secure email change:** Enable

Then update the signup code to handle the confirmation flow properly.

### 3. Check Email Templates

**Path:** `Authentication → Email Templates`

Make sure these templates are configured:
- Confirmation email (if enabled)
- Magic Link
- Change Email Address
- Reset Password

### 4. Verify Site URL

**Path:** `Authentication → URL Configuration`

- **Site URL:** `http://localhost:8080` (dev) or `https://yourdomain.com` (prod)
- **Redirect URLs:** Add:
  - `http://localhost:8080/loyalty/dashboard`
  - `http://localhost:8080/loyalty/login`
  - `https://yourdomain.com/loyalty/dashboard`
  - `https://yourdomain.com/loyalty/login`

### 5. Current Issue Diagnosis

If login says "Invalid credentials":

1. **User doesn't exist** — Check if signup actually succeeded:
   - Go to Supabase Dashboard → Authentication → Users
   - Look for the email address
   - Check if status is "Confirmed" or "Unconfirmed"

2. **Wrong password** — User is typing incorrect password

3. **Email unconfirmed** — If email confirmation is ON, user must click link in email first

4. **Supabase project issue** — Check that:
   - Frontend `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Keys match the Supabase project

### Quick Fix (Immediate)

Run this SQL in Supabase SQL Editor to check if user exists:

```sql
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'user@example.com';
```

If `email_confirmed_at` is NULL and email confirmation is enabled, that's the issue.

To manually confirm a user:

```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'user@example.com';
```

### Recommended Production Setup

1. Enable email confirmation
2. Add a "Resend confirmation email" button on login page
3. Show clear message: "Please confirm your email before signing in"
4. Add email templates with hotel branding
