import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { firestoreService } from '../services/firestoreService';
import { resumeParser } from '../services/resumeParser';
import { embeddingService } from '../services/embeddings';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createProfileSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  bio: z.string().optional(),
  location: z.string().optional(),
  experience: z.enum(['fresher', '0-2', '2-5', '5-10', '10+']).optional(),
  education: z.array(z.object({
    degree: z.string(),
    field: z.string(),
    institution: z.string(),
    year: z.number().int().min(1950).max(new Date().getFullYear() + 5),
  })).optional(),
  interests: z.array(z.string()).min(1, 'At least one interest is required'),
  skills: z.array(z.object({
    name: z.string(),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    verified: z.boolean().default(false),
  })).optional(),
  resumeUrl: z.string().url().optional(),
});

const updateProfileSchema = createProfileSchema.partial();

// Get user profile
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const profile = await firestoreService.getUserProfile(user.id);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Include user basic info with profile
    const response = {
      ...profile,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ 
      message: 'Failed to get profile',
      error: error.message 
    });
  }
});

// Create user profile (onboarding)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Validate request body
    const validationResult = createProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid profile data',
        errors: validationResult.error.errors 
      });
    }
    
    const profileData = validationResult.data;
    
    let user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      // Create user if doesn't exist
      user = await firestoreService.createUser({
        firebaseUid: req.user.uid,
        email: req.user.email || '',
        name: req.user.name || '',
        profilePicture: req.user.picture,
      });
    }
    
    // Check if profile already exists
    const existingProfile = await firestoreService.getUserProfile(user.id);
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists. Use PUT to update.' });
    }
    
    // Process resume if provided
    let resumeParsedData = null;
    if (profileData.resumeUrl) {
      try {
        resumeParsedData = await resumeParser.parseFromUrl(profileData.resumeUrl);
        
        // Enhance skills with parsed resume data
        const resumeSkills = resumeParsedData.skills.map(skill => ({
          name: skill,
          level: 'intermediate' as const,
          verified: false,
        }));
        
        // Merge with provided skills
        const combinedSkills = [...(profileData.skills || [])];
        resumeSkills.forEach(resumeSkill => {
          if (!combinedSkills.find(s => s.name.toLowerCase() === resumeSkill.name.toLowerCase())) {
            combinedSkills.push(resumeSkill);
          }
        });
        
        profileData.skills = combinedSkills;
      } catch (error) {
        console.error('Resume parsing error:', error);
        // Continue without resume data
      }
    }
    
    // Calculate completion percentage
    const completionPercentage = calculateCompletionPercentage(profileData);
    
    // Create profile
    const profile = await firestoreService.createUserProfile({
      userId: user.id,
      ...profileData,
      resumeParsedData,
      completionPercentage,
    });
    
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ 
      message: 'Failed to create profile',
      error: error.message 
    });
  }
});

// Update user profile
router.put('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Validate request body
    const validationResult = updateProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid profile data',
        errors: validationResult.error.errors 
      });
    }
    
    const profileData = validationResult.data;
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Process resume if URL changed
    let resumeParsedData = undefined;
    if (profileData.resumeUrl) {
      try {
        resumeParsedData = await resumeParser.parseFromUrl(profileData.resumeUrl);
      } catch (error) {
        console.error('Resume parsing error:', error);
      }
    }
    
    if (resumeParsedData) {
      profileData.resumeParsedData = resumeParsedData;
    }
    
    // Calculate updated completion percentage
    const existingProfile = await firestoreService.getUserProfile(user.id);
    const mergedData = { ...existingProfile, ...profileData };
    const completionPercentage = calculateCompletionPercentage(mergedData);
    
    const updatedProfile = await firestoreService.updateUserProfile(user.id, {
      ...profileData,
      completionPercentage,
    });
    
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      message: 'Failed to update profile',
      error: error.message 
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const stats = await firestoreService.getUserStats(user.id);
    res.json(stats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ 
      message: 'Failed to get user statistics',
      error: error.message 
    });
  }
});

// Get user activity
router.get('/activity', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const activities = await firestoreService.getUserActivity(user.id, limit);
    
    res.json(activities);
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({ 
      message: 'Failed to get user activity',
      error: error.message 
    });
  }
});

// Upload and parse resume
router.post('/upload-resume', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { resumeUrl } = req.body;
    if (!resumeUrl) {
      return res.status(400).json({ message: 'Resume URL is required' });
    }
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Parse resume
    const resumeParsedData = await resumeParser.parseFromUrl(resumeUrl);
    
    // Update profile with resume data
    await firestoreService.updateUserProfile(user.id, {
      resumeUrl,
      resumeParsedData,
    });
    
    res.json({
      message: 'Resume processed successfully',
      parsedData: resumeParsedData,
    });
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ 
      message: 'Failed to process resume',
      error: error.message 
    });
  }
});

// Helper function to calculate profile completion percentage
function calculateCompletionPercentage(profileData: any): number {
  const fields = [
    'title',
    'bio',
    'location',
    'experience',
    'education',
    'interests',
    'skills',
  ];
  
  let completedFields = 0;
  const totalFields = fields.length;
  
  fields.forEach(field => {
    const value = profileData[field];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value) && value.length > 0) {
        completedFields++;
      } else if (typeof value === 'string' && value.trim().length > 0) {
        completedFields++;
      } else if (typeof value === 'object' && Object.keys(value).length > 0) {
        completedFields++;
      } else if (typeof value !== 'string' && typeof value !== 'object') {
        completedFields++;
      }
    }
  });
  
  // Add bonus for resume
  if (profileData.resumeUrl) {
    completedFields += 0.5;
  }
  
  return Math.min(100, Math.round((completedFields / totalFields) * 100));
}

export default router;
