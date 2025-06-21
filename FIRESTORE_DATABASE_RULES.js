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
    
    // Authenticated users can read and write their own saved photos
    // Photo owners can also delete any saved photos of their photos
    match /savedPhotos/{saveId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         saveId.matches('^' + request.auth.uid + '_.*'));
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
    
    // Authenticated users can read and write their own likes
    // Photo owners can also delete any likes on their photos
    match /likes/{likeId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         likeId.matches('^' + request.auth.uid + '_.*'));
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
  }
}