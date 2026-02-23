# Email & OTP Testing Guide

## Quick Setup

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update `.env`**:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM="Waelio <noreply@waelio.com>"
```

### Option 2: SendGrid (Production Ready)

1. **Sign up** at https://sendgrid.com (free tier: 100 emails/day)
2. **Create API Key**: Settings → API Keys → Create API Key
3. **Update `.env`**:

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM="Waelio <noreply@waelio.com>"
```

### Option 3: Mailtrap (Development/Testing)

1. **Sign up** at https://mailtrap.io (free)
2. **Get credentials** from inbox settings
3. **Update `.env`**:

```bash
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
SMTP_FROM="Waelio <noreply@waelio.com>"
```

## Testing

### 1. Start the Dev Server

```bash
pnpm dev
```

### 2. Request OTP via API

```bash
curl -X POST http://localhost:3000/auth/request-otp \
  -H "Origin: https://peace2074.com" \
  -H "Content-Type: application/json" \
  -d '{"email":"your-actual-email@gmail.com"}' | jq .
```

**Expected Response (Development Mode):**

```json
{
  "ok": true,
  "devCode": "123456",
  "ttlSeconds": 600,
  "emailSent": true,
  "emailConfigured": true
}
```

**If email is configured:** Check your inbox for the OTP email!

**If email is NOT configured:**

```json
{
  "ok": true,
  "devCode": "123456",
  "ttlSeconds": 600,
  "emailSent": false,
  "emailConfigured": false
}
```

### 3. Verify the Code

```bash
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Origin: https://peace2074.com" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  -d '{"email":"your-actual-email@gmail.com","code":"123456","rememberMe":true}' | jq .
```

## Email Template Preview

The OTP email includes:

- ✅ **Beautiful HTML design** with gradient header
- ✅ **Large, centered OTP code** (easy to read)
- ✅ **Expiration notice** (10 minutes)
- ✅ **Security notice** (safe to ignore if not requested)
- ✅ **Plain text fallback** for email clients that don't support HTML

## Troubleshooting

### Email not sending?

**Check logs:**

```bash
# Look for error messages
tail -f .output/nitro.log
```

**Common issues:**

1. **Gmail "Less secure app" error**
   - ✅ Solution: Use App Password (not your regular password)

2. **SendGrid "Sender not verified"**
   - ✅ Solution: Verify your sender email in SendGrid dashboard

3. **Port blocked**
   - ✅ Try port 465 (SSL) instead of 587 (TLS)

   ```bash
   SMTP_PORT=465
   ```

4. **Wrong credentials**
   - ✅ Double-check SMTP_USER and SMTP_PASS in .env
   - ✅ Remove quotes if using special characters

### Test SMTP Connection

Create a test script:

```bash
node -e "
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transport.verify().then(() => console.log('✓ SMTP OK')).catch(err => console.error('✗ SMTP Error:', err));
"
```

## Production Checklist

- [ ] Use production SMTP service (SendGrid, AWS SES, Mailgun)
- [ ] Verify sender domain (SPF, DKIM records)
- [ ] Set `NODE_ENV=production` to hide OTP codes in responses
- [ ] Monitor email delivery rates
- [ ] Set up bounce/complaint handling
- [ ] Add rate limiting for OTP requests

## Frontend Integration

```javascript
// Request OTP
const response = await fetch("https://api.waelio.com/auth/request-otp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: "https://peace2074.com",
  },
  body: JSON.stringify({ email: userEmail }),
});

const data = await response.json();
if (data.ok) {
  alert("Check your email for the verification code!");
  // In development, you might see: data.devCode
}
```

## Need Help?

- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833
- **SendGrid Docs**: https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api
- **Nodemailer Docs**: https://nodemailer.com/about/

Happy testing! 📧✨
