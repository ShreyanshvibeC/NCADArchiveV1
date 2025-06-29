# Firebase Configuration Guide for NCAD Archive

This guide contains all the Firebase configuration code you need to set up your project.

## 1. Firestore Database Security Rules

Go to Firebase Console → Firestore Database → Rules and paste this code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read user profiles, but only authenticated users can write their own
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read photos, but only authenticated users can create them
    // Photo owners can update and delete their own photos
    // Anyone can increment the visits count or update the likes count
    match /photos/{photoId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if (request.auth != null && request.auth.uid == resource.data.userId) ||
                       (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['visits'])) ||
                       (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes']));
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Enhanced rules for saved photos - allow photo owners to read all saved photos of their photos
    match /savedPhotos/{saveId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         saveId.matches('^' + request.auth.uid + '_.*') ||
         (resource.data.photoId is string &&
          exists(/databases/$(database)/documents/photos/$(resource.data.photoId)) &&
          get(/databases/$(database)/documents/photos/$(resource.data.photoId)).data.userId == request.auth.uid));
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         saveId.matches('^' + request.auth.uid + '_.*'));
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow delete: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         saveId.matches('^' + request.auth.uid + '_.*') ||
         (resource.data.photoId is string &&
          exists(/databases/$(database)/documents/photos/$(resource.data.photoId)) &&
          get(/databases/$(database)/documents/photos/$(resource.data.photoId)).data.userId == request.auth.uid));
    }
    
    // Enhanced rules for likes - allow photo owners to read all likes on their photos
    match /likes/{likeId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         likeId.matches('^' + request.auth.uid + '_.*') ||
         (resource.data.photoId is string &&
          exists(/databases/$(database)/documents/photos/$(resource.data.photoId)) &&
          get(/databases/$(database)/documents/photos/$(resource.data.photoId)).data.userId == request.auth.uid));
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         likeId.matches('^' + request.auth.uid + '_.*'));
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow delete: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         likeId.matches('^' + request.auth.uid + '_.*') ||
         (resource.data.photoId is string &&
          exists(/databases/$(database)/documents/photos/$(resource.data.photoId)) &&
          get(/databases/$(database)/documents/photos/$(resource.data.photoId)).data.userId == request.auth.uid));
    }
    
    // New collection for storage cleanup queue - only authenticated users can create entries
    // Only system/admin can read and delete (for Cloud Function cleanup)
    match /storageCleanupQueue/{queueId} {
      allow read: if false; // Only Cloud Functions should read this
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow delete: if false; // Only Cloud Functions should delete this
    }
  }
}
```

## 2. Firebase Storage Security Rules

Go to Firebase Console → Storage → Rules and paste this code:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
      // Note: Individual file deletion is now handled by Cloud Functions
      // Client-side deletion is disabled to implement soft delete mechanism
      allow delete: if false;
    }
  }
}
```

## 3. Firebase Authentication Configuration

### Email/Password Authentication
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Disable "Email link (passwordless sign-in)" unless you specifically need it

### Authorized Domains
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `your-app.netlify.app`)

## 4. Firebase Storage CORS Configuration

Create a file called `firebase-cors.json` with this content:

```json
{
  "origin": ["*"],
  "method": ["GET"],
  "maxAgeSeconds": 3600
}
```

Then run this command (replace `your-project-id.appspot.com` with your actual bucket name):

```bash
gsutil cors set firebase-cors.json gs://your-project-id.appspot.com
```

## 5. Environment Variables (.env file)

Create a `.env` file in your project root with these variables:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

You can find these values in Firebase Console → Project Settings → General → Your apps → Web app → Config.

## 6. Required Firestore Indexes

You may need to create these composite indexes in Firestore:

### Index 1: Photos by User and Timestamp
- Collection: `photos`
- Fields: 
  - `userId` (Ascending)
  - `timestamp` (Descending)

### Index 2: Saved Photos by User
- Collection: `savedPhotos`
- Fields:
  - `userId` (Ascending)
  - `timestamp` (Descending)

### Index 3: Likes by User
- Collection: `likes`
- Fields:
  - `userId` (Ascending)
  - `timestamp` (Descending)

Firebase will automatically prompt you to create these indexes when you first run queries that need them.

## 7. Optional: Cloud Functions for Storage Cleanup

If you want to implement the storage cleanup functionality, deploy this Cloud Function:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

exports.cleanupDeletedImages = functions.pubsub
  .schedule('0 2 * * *') // Run daily at 2 AM UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('🧹 Starting daily storage cleanup process...');
    
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - 24);
      
      const cleanupQuery = db.collection('storageCleanupQueue')
        .where('processed', '==', false)
        .where('timestamp', '<=', cutoffTime)
        .limit(100);
      
      const snapshot = await cleanupQuery.get();
      
      if (snapshot.empty) {
        console.log('✅ No items to clean up');
        return null;
      }
      
      const batch = db.batch();
      let successCount = 0;
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const { imageURL } = data;
        
        try {
          const storagePath = extractStoragePathFromURL(imageURL);
          
          if (storagePath) {
            const file = storage.bucket().file(storagePath);
            await file.delete();
            console.log(`✅ Successfully deleted: ${storagePath}`);
            successCount++;
          }
          
          batch.update(doc.ref, { 
            processed: true, 
            processedAt: admin.firestore.FieldValue.serverTimestamp() 
          });
        } catch (error) {
          console.error(`❌ Error processing item ${doc.id}:`, error);
        }
      }
      
      await batch.commit();
      console.log(`🎉 Cleanup completed: ${successCount} successful`);
      
      return { success: true, processed: successCount };
    } catch (error) {
      console.error('❌ Fatal error in cleanup process:', error);
      throw error;
    }
  });

function extractStoragePathFromURL(downloadURL) {
  try {
    const url = new URL(downloadURL);
    const pathMatch = url.pathname.match(/\/o\/(.+)/);
    return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
  } catch (error) {
    return null;
  }
}
```

## Setup Steps Summary

1. **Create Firebase Project**: Go to Firebase Console and create a new project
2. **Enable Services**: Enable Authentication, Firestore Database, and Storage
3. **Configure Authentication**: Enable Email/Password and add authorized domains
4. **Set Security Rules**: Copy and paste the Firestore and Storage rules above
5. **Configure CORS**: Set up CORS for Storage (optional, for image sharing)
6. **Set Environment Variables**: Add your Firebase config to `.env` file
7. **Deploy**: Your app should now work with Firebase!

## Troubleshooting

- **Permission Denied**: Check that security rules are correctly set
- **CORS Errors**: Make sure CORS is configured for Storage
- **Index Errors**: Create the required composite indexes in Firestore
- **Auth Errors**: Verify that your domain is in the authorized domains list

Your Firebase project should now be fully configured for the NCAD Archive application!