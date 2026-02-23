# User Profile & Community Features

## Overview

The Waelio API now includes full user profile management with MongoDB integration, enabling community features and personalized user experiences.

## Features

### 1. **User Authentication with Profiles**

When users log in via OTP, a user profile is automatically created in MongoDB with:

- Email (unique identifier)
- Auto-generated username
- First name & last name (optional)
- Role (default: "user")
- Verification status
- Timestamps (created/updated)

### 2. **Profile Management**

#### Get Current User

```bash
GET /auth/me

# Returns:
{
  "ok": true,
  "user": {
    "email": "user@example.com",
    "username": "user_abc123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "verified": true,
    "createdAt": "2026-02-23T...",
    "updatedAt": "2026-02-23T..."
  }
}
```

#### Update Profile

```bash
PUT /auth/profile
Content-Type: application/json

{
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe"
}

# Returns updated user profile
```

**Username Requirements:**

- 3-30 characters
- Letters, numbers, underscore, and dash only
- Must be unique across all users

### 3. **Database Setup**

#### Environment Variable

```bash
MONGODB_URI='mongodb://localhost:27017/waelio'
# Or for MongoDB Atlas:
# MONGODB_URI='mongodb+srv://user:pass@cluster.mongodb.net/waelio'
```

#### User Schema

```typescript
{
  email: string (required, unique)
  username: string (required, unique)
  password: string (for OTP auth: "OTP_AUTH")
  first_name?: string
  last_name?: string
  role: string (default: "user")
  verified: boolean (default: false)
  createdAt: Date
  updatedAt: Date
}
```

## API Endpoints

### Authentication

- `POST /auth/request-otp` - Request OTP code
- `POST /auth/verify-otp` - Verify OTP and create session **+ user profile**
- `GET /auth/me` - Get current user profile (from database)
- `POST /auth/logout` - Clear session

### Profile Management

- `PUT /auth/profile` - Update username, first_name, last_name

## Community Interaction Ready

With user profiles stored in the database, you can now build:

1. **User-to-user messaging**
2. **Comments and discussions** (associate with username)
3. **Bookmarks and favorites** (per-user data)
4. **Tasbeeh counters** (personal tracking)
5. **Community features** (following, sharing, etc.)

## Development Setup

1. **Install MongoDB locally**:

   ```bash
   # macOS
   brew install mongodb-community
   brew services start mongodb-community
   ```

2. **Update .env**:

   ```bash
   MONGODB_URI='mongodb://localhost:27017/waelio'
   ```

3. **Install dependencies**:

   ```bash
   pnpm install
   ```

4. **Test the endpoints**:

   ```bash
   # Request OTP
   curl -X POST http://localhost:3000/auth/request-otp \
     -H "Origin: https://peace2074.com" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'

   # Verify OTP (creates user profile)
   curl -X POST http://localhost:3000/auth/verify-otp \
     -H "Origin: https://peace2074.com" \
     -H "Content-Type: application/json" \
     --cookie-jar cookies.txt \
     -d '{"email":"test@example.com","code":"123456"}'

   # Get profile
   curl http://localhost:3000/auth/me \
     -H "Origin: https://peace2074.com" \
     --cookie cookies.txt

   # Update profile
   curl -X PUT http://localhost:3000/auth/profile \
     -H "Origin: https://peace2074.com" \
     -H "Content-Type: application/json" \
     --cookie cookies.txt \
     -d '{"username":"mycoolusername","first_name":"John"}'
   ```

## Production Deployment

### Netlify Environment Variables

Add to Netlify dashboard:

```
MONGODB_URI=mongodb+srv://your-atlas-connection-string
AUTH_SECRET=your-production-secret
DEEPSEEK_API_KEY=your-deepseek-key
```

### MongoDB Atlas Setup

1. Create cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist Netlify IP or use `0.0.0.0/0` for development
4. Copy connection string to `MONGODB_URI`

## Next Steps for Community Building

Now that users have persistent profiles, consider adding:

- **User-generated content** (saved verses, notes)
- **Social features** (share insights, follow users)
- **Gamification** (badges, streaks for daily reading)
- **Group features** (study circles, community discussions)
- **Personalized recommendations** (based on reading history)

## File Structure

```
routes/auth/
├── me.get.ts              # Get user profile (enhanced)
├── profile.options.ts     # CORS for profile updates
├── profile.put.ts         # Update user profile
├── verify-otp.post.ts     # Login + create user (enhanced)
└── ...

server/
├── auth.ts                # Session management
└── db.ts                  # MongoDB connection (new)

models/
└── user.ts                # User schema (existing, now used)
```

Happy building! 🚀
