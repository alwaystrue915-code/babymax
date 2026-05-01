# 🚀 Quick Start - Serverless Backend

## ✅ Setup Complete!

### What's Been Created:

1. **Serverless API Routes**
   - `POST /api/auth/register` - Create account
   - `POST /api/auth/login` - Login user

2. **MongoDB Integration**
   - Serverless-optimized connection
   - Password hashing with bcrypt
   - User model with validation

3. **Environment Configuration**
   - `.env.local` - Your MongoDB credentials (NOT committed to git)
   - `.env.example` - Template for reference
   - `.gitignore` - Already excludes .env files

## 🎯 Test It Now:

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Register a User
- Go to: `http://localhost:3000/register`
- Fill the form
- Click "Create Account"
- User saved to MongoDB!

### 3. Login
- Go to: `http://localhost:3000/login`
- Enter email & password
- Click "Sign In"
- Success! 🎉

## 🌐 Deploy to Vercel:

### Quick Deploy:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variable
vercel env add MONGO_URI
# Paste your MongoDB connection string

# Deploy to production
vercel --prod
```

### Or Use Vercel Dashboard:
1. Push code to GitHub
2. Import project on vercel.com
3. Add `MONGO_URI` environment variable
4. Deploy!

## 📁 Important Files:

| File | Purpose |
|------|---------|
| `.env.local` | Your MongoDB password (KEEP SECRET!) |
| `lib/mongodb.js` | Database connection |
| `models/User.js` | User schema |
| `src/app/api/auth/register/route.js` | Registration API |
| `src/app/api/auth/login/route.js` | Login API |

## 🔒 Security:

- ✅ Passwords are encrypted with bcrypt
- ✅ `.env.local` never committed to git
- ✅ Environment variables for sensitive data
- ✅ Email validation & uniqueness check

## 📊 MongoDB Atlas:

Your database: `senci`
Collection: `users`

Check your users at: https://cloud.mongodb.com

---

**Ready to deploy!** 🚀
See `DEPLOYMENT-GUIDE.md` for detailed instructions.
