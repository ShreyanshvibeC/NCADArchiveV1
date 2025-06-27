/**
 * Firebase Cloud Function for delayed storage cleanup
 * 
 * This function should be deployed to Firebase Functions and scheduled to run daily.
 * It processes the storageCleanupQueue collection and deletes images from Firebase Storage.
 * 
 * To deploy this function:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Initialize functions: firebase init functions
 * 3. Add this code to functions/index.js
 * 4. Deploy: firebase deploy --only functions
 * 
 * To schedule this function:
 * 1. Go to Firebase Console > Functions
 * 2. Click on the function name
 * 3. Go to "Trigger" tab and add a Cloud Scheduler trigger
 * 4. Set schedule to "0 2 * * *" (runs daily at 2 AM)
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

/**
 * Scheduled function to clean up deleted images from Firebase Storage
 * Runs daily and processes images that have been marked for deletion for more than 24 hours
 */
exports.cleanupDeletedImages = functions.pubsub
  .schedule('0 2 * * *') // Run daily at 2 AM UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('🧹 Starting daily storage cleanup process...');
    
    try {
      // Calculate cutoff time (24 hours ago)
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - 24);
      
      console.log(`🕐 Processing items older than: ${cutoffTime.toISOString()}`);
      
      // Query for items to be cleaned up
      const cleanupQuery = db.collection('storageCleanupQueue')
        .where('processed', '==', false)
        .where('timestamp', '<=', cutoffTime)
        .limit(100); // Process in batches to avoid timeouts
      
      const snapshot = await cleanupQuery.get();
      
      if (snapshot.empty) {
        console.log('✅ No items to clean up');
        return null;
      }
      
      console.log(`📋 Found ${snapshot.docs.length} items to process`);
      
      const batch = db.batch();
      let successCount = 0;
      let errorCount = 0;
      
      // Process each item
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const { photoId, imageURL, userId } = data;
        
        try {
          console.log(`🗑️ Processing deletion for photo ${photoId}`);
          
          // Extract storage path from URL
          const storagePath = extractStoragePathFromURL(imageURL);
          
          if (storagePath) {
            // Delete from Firebase Storage
            const file = storage.bucket().file(storagePath);
            
            try {
              await file.delete();
              console.log(`✅ Successfully deleted: ${storagePath}`);
              successCount++;
            } catch (deleteError) {
              if (deleteError.code === 404) {
                console.log(`⚠️ File not found (already deleted): ${storagePath}`);
                successCount++; // Count as success since file is gone
              } else {
                console.error(`❌ Error deleting file ${storagePath}:`, deleteError);
                errorCount++;
                continue; // Skip marking as processed if deletion failed
              }
            }
          } else {
            console.warn(`⚠️ Could not extract storage path from URL: ${imageURL}`);
            errorCount++;
            continue;
          }
          
          // Mark as processed in Firestore
          batch.update(doc.ref, { 
            processed: true, 
            processedAt: admin.firestore.FieldValue.serverTimestamp() 
          });
          
        } catch (error) {
          console.error(`❌ Error processing item ${doc.id}:`, error);
          errorCount++;
        }
      }
      
      // Commit the batch update
      if (batch._writes.length > 0) {
        await batch.commit();
        console.log(`📝 Updated ${batch._writes.length} cleanup queue items`);
      }
      
      console.log(`🎉 Cleanup completed: ${successCount} successful, ${errorCount} errors`);
      
      // Clean up old processed items (older than 7 days)
      await cleanupOldQueueItems();
      
      return {
        success: true,
        processed: snapshot.docs.length,
        successful: successCount,
        errors: errorCount
      };
      
    } catch (error) {
      console.error('❌ Fatal error in cleanup process:', error);
      throw error;
    }
  });

/**
 * Clean up old processed items from the cleanup queue
 */
async function cleanupOldQueueItems() {
  try {
    console.log('🧹 Cleaning up old queue items...');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const oldItemsQuery = db.collection('storageCleanupQueue')
      .where('processed', '==', true)
      .where('processedAt', '<=', sevenDaysAgo)
      .limit(50);
    
    const snapshot = await oldItemsQuery.get();
    
    if (snapshot.empty) {
      console.log('✅ No old queue items to clean up');
      return;
    }
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`🗑️ Deleted ${snapshot.docs.length} old queue items`);
    
  } catch (error) {
    console.error('❌ Error cleaning up old queue items:', error);
  }
}

/**
 * Extract storage path from Firebase Storage download URL
 */
function extractStoragePathFromURL(downloadURL) {
  try {
    const url = new URL(downloadURL);
    
    if (!url.hostname.includes('firebasestorage.googleapis.com')) {
      return null;
    }
    
    const pathMatch = url.pathname.match(/\/o\/(.+)/);
    if (!pathMatch) {
      return null;
    }
    
    return decodeURIComponent(pathMatch[1]);
  } catch (error) {
    console.error('Error extracting storage path:', error);
    return null;
  }
}

/**
 * HTTP function for manual cleanup trigger (for testing)
 */
exports.manualCleanup = functions.https.onCall(async (data, context) => {
  // Verify the user is authenticated and has admin privileges
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // You can add additional admin checks here
  
  console.log('🔧 Manual cleanup triggered by user:', context.auth.uid);
  
  try {
    // Run the same cleanup logic as the scheduled function
    const result = await cleanupDeletedImages();
    return result;
  } catch (error) {
    console.error('❌ Manual cleanup failed:', error);
    throw new functions.https.HttpsError('internal', 'Cleanup failed');
  }
});