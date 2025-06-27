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