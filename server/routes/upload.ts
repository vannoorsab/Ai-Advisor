import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { uploadResumeFile } from '../services/firebase';
import multer from 'multer';
import { resumeParser } from '../services/resumeParser';
import { firestoreService } from '../services/firestoreService';

const router = Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, and DOCX files
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  },
});

// Upload resume file
router.post('/resume', authenticateToken, upload.single('resume'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create a file object from the buffer
    const file = new File([req.file.buffer], req.file.originalname, {
      type: req.file.mimetype,
    });
    
    // Upload to Firebase Storage
    const resumeUrl = await uploadResumeFile(file, user.firebaseUid);
    
    // Parse resume content
    let parsedData = null;
    try {
      parsedData = await resumeParser.parseBuffer(req.file.buffer);
    } catch (parseError) {
      console.error('Resume parsing error:', parseError);
      // Continue without parsed data - file is still uploaded
    }
    
    // Update user profile with resume URL and parsed data
    const profile = await firestoreService.getUserProfile(user.id);
    if (profile) {
      await firestoreService.updateUserProfile(user.id, {
        resumeUrl,
        resumeParsedData: parsedData,
      });
    }
    
    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl,
      parsedData,
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({ 
        message: error.message,
        error: 'INVALID_FILE_TYPE' 
      });
    }
    
    if (error.message.includes('File too large')) {
      return res.status(400).json({ 
        message: 'File size exceeds 10MB limit',
        error: 'FILE_TOO_LARGE' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to upload resume',
      error: error.message 
    });
  }
});

// Get resume parsing status
router.get('/resume/status/:fileName', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { fileName } = req.params;
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const profile = await firestoreService.getUserProfile(user.id);
    if (!profile || !profile.resumeUrl) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Check if the resume URL contains the requested file name
    if (!profile.resumeUrl.includes(fileName)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }
    
    res.json({
      status: profile.resumeParsedData ? 'completed' : 'processing',
      resumeUrl: profile.resumeUrl,
      parsedData: profile.resumeParsedData,
    });
  } catch (error) {
    console.error('Error getting resume status:', error);
    res.status(500).json({ 
      message: 'Failed to get resume status',
      error: error.message 
    });
  }
});

// Re-process existing resume
router.post('/resume/reprocess', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const profile = await firestoreService.getUserProfile(user.id);
    if (!profile || !profile.resumeUrl) {
      return res.status(404).json({ message: 'No resume found to reprocess' });
    }
    
    // Re-parse the existing resume
    const parsedData = await resumeParser.parseFromUrl(profile.resumeUrl);
    
    // Update profile with new parsed data
    await firestoreService.updateUserProfile(user.id, {
      resumeParsedData: parsedData,
    });
    
    res.json({
      message: 'Resume reprocessed successfully',
      parsedData,
    });
  } catch (error) {
    console.error('Error reprocessing resume:', error);
    res.status(500).json({ 
      message: 'Failed to reprocess resume',
      error: error.message 
    });
  }
});

// Error handling middleware for multer
router.use((error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File size exceeds 10MB limit',
        error: 'FILE_TOO_LARGE' 
      });
    }
    
    return res.status(400).json({ 
      message: 'File upload error',
      error: error.code 
    });
  }
  
  next(error);
});

export default router;
