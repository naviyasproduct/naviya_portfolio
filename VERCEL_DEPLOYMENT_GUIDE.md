# 🚀 Vercel Deployment Guide for Naviya Portfolio

## Prerequisites
- GitHub account with your repository pushed
- Vercel account (free tier is fine)
- All environment variables from `.env.local`

---

## Step 1: Prepare Your Repository

### 1.1 Commit All Changes
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 1.2 Verify `.gitignore` (Already Done ✅)
Your `.gitignore` already excludes:
- `.env*` files (environment variables won't be pushed)
- `/secrets/` folder
- `.vercel` folder

---

## Step 2: Create Vercel Account & Import Project

### 2.1 Sign Up/Login to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Login"
3. **Use "Continue with GitHub"** (recommended for easy integration)

### 2.2 Import Your Repository
1. Click "Add New..." → "Project"
2. Select your repository: `naviyasproduct/naviya_portfolio`
3. Click "Import"

---

## Step 3: Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (leave as default)
- **Build Command**: `next build --turbopack`
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install`

> ⚠️ **Important**: Change the build command to include `--turbopack` to match your `package.json`

---

## Step 4: Add Environment Variables

This is **CRITICAL**. You need to add all variables from your `.env.local` file.

### 4.1 Navigate to Environment Variables
In the Vercel project setup screen:
1. Scroll down to "Environment Variables" section
2. Add each variable one by one

### 4.2 Required Environment Variables

#### **Firebase Client SDK** (Public - for frontend)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

#### **Firebase Admin SDK** (Secret - for backend)
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"...","universe_domain":"..."}
```
> ⚠️ **Copy the entire JSON string as ONE line** from your `.env.local`

#### **EmailJS** (for contact form)
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

#### **Cloudinary** (if you have it configured)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 4.3 Environment Variable Settings
For each variable:
- **Name**: The variable name (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`)
- **Value**: The actual value from your `.env.local`
- **Environments**: Select **Production**, **Preview**, and **Development** (all three)

---

## Step 5: Deploy

1. Click **"Deploy"** button
2. Wait for the build to complete (2-5 minutes)
3. Vercel will show build logs in real-time

### Expected Build Output:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

---

## Step 6: Post-Deployment Configuration

### 6.1 Get Your Deployment URL
After successful deployment:
- Your site will be live at: `https://your-project-name.vercel.app`
- Vercel also provides a shareable preview URL

### 6.2 Update Firebase Security Rules

**IMPORTANT**: Update your Firebase security rules to allow your Vercel domain.

Go to Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /thoughts/{thoughtId} {
      // Allow anyone to read thoughts
      allow read: if true;
      
      // Allow authenticated users to write
      allow write: if request.auth != null;
      
      // Allow anyone to update like count
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
        .hasOnly(['likeCount']);
      
      // Comments subcollection
      match /comments/{commentId} {
        // Anyone can read comments
        allow read: if true;
        
        // Anyone can create comments with validation
        allow create: if request.resource.data.name is string 
                      && request.resource.data.text is string
                      && request.resource.data.name.size() > 0
                      && request.resource.data.name.size() <= 30
                      && request.resource.data.text.size() > 0
                      && request.resource.data.text.size() <= 500
                      && request.resource.data.createdAt is timestamp;
        
        // Prevent direct updates/deletes (only via admin API)
        allow delete, update: if false;
      }
    }
  }
}
```

### 6.3 Update EmailJS Domain (if needed)

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Navigate to your service
3. Add your Vercel domain to allowed origins:
   - `https://your-project-name.vercel.app`
   - `https://*.vercel.app` (for all preview deployments)

---

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain
1. In Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `naviya.com`)
4. Follow DNS configuration instructions

### 7.2 Update DNS Records
Vercel will provide specific DNS records to add:
- **Type**: A or CNAME
- **Name**: @ or www
- **Value**: Provided by Vercel

---

## Step 8: Verify Deployment

### 8.1 Test All Features
- ✅ Homepage loads with 3D animation
- ✅ Theme toggle works (light/dark mode)
- ✅ Thoughts page displays calendar timeline
- ✅ Individual thought pages load with comments/likes
- ✅ Contact form sends emails via EmailJS
- ✅ Cursor animation works on contact page
- ✅ Mobile navigation menu appears on small screens

### 8.2 Test Admin Features
1. Navigate to `/admin` on your deployed site
2. Login with your credentials
3. Test creating a new thought
4. Test uploading images to Cloudinary
5. Test deleting a thought

### 8.3 Mobile Testing
- Test on Android device (your friend's phone)
- Verify glassy effects work or fallback gracefully
- Check navigation hamburger menu
- Test all interactions

---

## Troubleshooting

### Build Fails
**Error**: `Module not found` or dependency issues
**Solution**: 
```bash
# Locally test the build
npm run build

# If successful, push again
git add .
git commit -m "Fix build issues"
git push origin main
```

### Environment Variables Not Working
**Solution**: 
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Verify all variables are set for Production environment
3. **Redeploy** after adding variables (Deployments → ... → Redeploy)

### Firebase Admin Error: "Service account not found"
**Solution**: 
- Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is a single-line JSON string
- No line breaks in the value
- Include the entire JSON object with curly braces

### Images Not Loading (Cloudinary)
**Solution**: 
- Verify `next.config.mjs` has correct `remotePatterns`
- Check Cloudinary credentials in environment variables
- Ensure upload preset is unsigned (or provide signed upload)

### EmailJS Not Sending
**Solution**: 
- Add Vercel domain to EmailJS allowed origins
- Check environment variables are prefixed with `NEXT_PUBLIC_`
- Verify service ID, template ID, and public key

---

## Continuous Deployment

Once set up, **every push to `main` branch** will automatically trigger a new deployment! 🎉

### Workflow:
1. Make changes locally
2. Test with `npm run dev`
3. Commit and push:
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin main
   ```
4. Vercel automatically builds and deploys
5. Get instant preview URL for each deployment

---

## Useful Vercel Commands

### Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### Deploy from CLI
```bash
vercel --prod
```

### Check Deployment Logs
```bash
vercel logs
```

### Pull Environment Variables Locally
```bash
vercel env pull .env.local
```

---

## 🎉 Deployment Checklist

Before clicking "Deploy", ensure:

- [ ] All code committed and pushed to GitHub
- [ ] `.env.local` variables copied (don't push this file!)
- [ ] All environment variables added to Vercel
- [ ] Firebase security rules updated
- [ ] EmailJS domain configured
- [ ] Build command set to `next build --turbopack`
- [ ] Test build locally with `npm run build`

After deployment:
- [ ] Test all pages on production URL
- [ ] Test on mobile devices
- [ ] Verify admin panel works
- [ ] Test contact form sends emails
- [ ] Check comments and likes functionality

---

## Need Help?

### Resources:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Console](https://console.firebase.google.com)

### Common Issues:
- **504 Timeout**: Serverless functions taking too long → Optimize API routes
- **Environment variables undefined**: Redeploy after adding variables
- **Build errors**: Test locally first with `npm run build`

---

**Good luck with your deployment! 🚀**

If you run into any issues, share the error message and I'll help you debug.
