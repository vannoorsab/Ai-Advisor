import { storage } from './firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a resume file to Firebase Storage
 * @param file - The file to upload
 * @param userId - The user's Firebase UID
 * @returns Promise<string> - The download URL of the uploaded file
 */
export async function uploadResumeFile(file: File, userId: string): Promise<string> {
  try {
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop() || 'pdf';
    const fileName = `resumes/${userId}/${uuidv4()}.${fileExtension}`;
    
    // Get a reference to the Firebase Storage bucket
    const bucket = storage.bucket();
    const fileRef = bucket.file(fileName);
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload the file
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          uploadedBy: userId,
          originalName: file.name,
        },
      },
    });
    
    // Make the file publicly readable
    await fileRef.makePublic();
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading resume file:', error);
    throw new Error('Failed to upload resume file');
  }
}

/**
 * Delete a resume file from Firebase Storage
 * @param fileUrl - The URL of the file to delete
 * @returns Promise<void>
 */
export async function deleteResumeFile(fileUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const bucket = storage.bucket();
    const urlParts = fileUrl.split(`https://storage.googleapis.com/${bucket.name}/`);
    
    if (urlParts.length !== 2) {
      throw new Error('Invalid file URL format');
    }
    
    const filePath = urlParts[1];
    const fileRef = bucket.file(filePath);
    
    // Delete the file
    await fileRef.delete();
  } catch (error) {
    console.error('Error deleting resume file:', error);
    throw new Error('Failed to delete resume file');
  }
}