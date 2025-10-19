# Firestore Security Rules for Naviya Portfolio

These rules allow anyone to **read** posts but only allow **server-side Admin SDK** to write.

## How to Apply These Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **naviyaportfolio**
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top
5. Replace the existing rules with the rules below
6. Click **Publish**

## Rules to Copy

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to READ thoughts (for public Thoughts page)
    // Block all client writes (only server Admin SDK can write)
    match /thoughts/{thoughtId} {
      allow read: if true;  // Anyone can read
      allow write: if false; // No client writes (Admin SDK bypasses rules)
    }
    
    // Block all other collections by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## What These Rules Do

- ✅ **Allow reads** - Anyone can view posts on the Thoughts page
- ❌ **Block client writes** - No browser/client can create or delete posts
- ✅ **Admin SDK bypasses rules** - Your server endpoints can still write using Admin SDK

## Why This Works

Your server-side routes (`/api/admin/create` and `/api/admin/delete`) use the Firebase **Admin SDK**, which has full privileges and ignores security rules. This is secure because:

1. Only authenticated admins can call those endpoints (cookie check)
2. The endpoints run on your server, not in the browser
3. Admin SDK credentials are never exposed to clients
