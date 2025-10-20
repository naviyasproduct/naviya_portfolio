# Environment Variables for Vercel Deployment

## Copy these to Vercel → Project Settings → Environment Variables

### Firebase Client SDK (Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Firebase Admin SDK (Secret - Server Only)
```
FIREBASE_SERVICE_ACCOUNT_KEY=
```
⚠️ **Important**: This must be the entire JSON object as a single line!

### EmailJS (Public)
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
```

### Cloudinary (Public)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

---

## Instructions:

1. Open your `.env.local` file
2. Copy each value from there
3. Paste into Vercel's Environment Variables section
4. For each variable, select: **Production, Preview, Development** (all three)
5. Click "Add" after each variable

## Important Notes:

- ✅ All variables starting with `NEXT_PUBLIC_` are safe to expose (they're public)
- 🔒 `FIREBASE_SERVICE_ACCOUNT_KEY` is SECRET - never share this!
- 📝 Make sure `FIREBASE_SERVICE_ACCOUNT_KEY` is ONE continuous line (no line breaks)
- 🌍 Select all three environments (Production, Preview, Development) for each variable
