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