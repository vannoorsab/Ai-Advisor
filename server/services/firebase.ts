import { storage } from './firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

/**
 * Check if Firebase services are initialized
 * @returns boolean - Whether Firebase is initialized
 */
export function isFirebaseInitialized(): boolean {
  return storage !== null;
}

/**
 * Upload a resume file to Firebase Storage
 * @param buffer - The file buffer to upload
 * @param contentType - The MIME type of the file
 * @param originalName - The original filename
 * @param userId - The user's Firebase UID
 * @returns Promise<string> - The signed URL of the uploaded file
 */
export async function uploadResumeFile(buffer: Buffer, contentType: string, originalName: string, userId: string): Promise<string> {
  try {
    if (!isFirebaseInitialized()) {
      console.warn('Firebase not initialized. Cannot upload resume file.');
      throw new Error('File upload service not available. Please try again later.');
    }
    
    // Generate a unique filename
    const fileExtension = originalName.split('.').pop() || 'pdf';
    const fileName = `resumes/${userId}/${uuidv4()}.${fileExtension}`;
    
    // Get a reference to the Firebase Storage bucket
    const bucket = storage!.bucket();
    const fileRef = bucket.file(fileName);
    
    // Upload the file
    await fileRef.save(buffer, {
      metadata: {
        contentType: contentType,
        metadata: {
          uploadedBy: userId,
          originalName: originalName,
        },
      },
    });
    
    // Generate a signed URL for secure access (expires in 1 year)
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
    });
    
    return signedUrl;
  } catch (error) {
    console.error('Error uploading resume file:', error);
    throw new Error('Failed to upload resume file');
  }
}

/**
 * Delete a resume file from Firebase Storage
 * @param fileUrl - The URL of the file to delete (either signed URL or file path)
 * @returns Promise<void>
 */
export async function deleteResumeFile(fileUrl: string): Promise<void> {
  try {
    if (!isFirebaseInitialized()) {
      console.warn('Firebase not initialized. Cannot delete resume file.');
      throw new Error('File delete service not available. Please try again later.');
    }
    
    const bucket = storage!.bucket();
    let filePath: string;
    
    // Handle both signed URLs and direct file paths
    if (fileUrl.includes('storage.googleapis.com')) {
      const urlParts = fileUrl.split(`https://storage.googleapis.com/${bucket.name}/`);
      if (urlParts.length !== 2) {
        throw new Error('Invalid file URL format');
      }
      filePath = urlParts[1].split('?')[0]; // Remove query parameters
    } else {
      filePath = fileUrl; // Assume it's already a file path
    }
    
    const fileRef = bucket.file(filePath);
    
    // Delete the file
    await fileRef.delete();
  } catch (error) {
    console.error('Error deleting resume file:', error);
    throw new Error('Failed to delete resume file');
  }
}