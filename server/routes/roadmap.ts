import { Router } from 'express';
import { authenticateToken, requireCompleteProfile, AuthenticatedRequest } from '../middleware/auth';
import { firestoreService } from '../services/firestoreService';
import { aiService } from '../services/ai';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createRoadmapSchema = z.object({
  careerId: z.string().min(1, 'Career ID is required'),
  customTitle: z.string().optional(),
  customDescription: z.string().optional(),
});

const updateProgressSchema = z.object({
  milestoneId: z.string().min(1, 'Milestone ID is required'),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  notes: z.string().optional(),
});

// Get user's roadmaps
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const roadmaps = await firestoreService.getUserRoadmaps(user.id);
    
    // Get progress for each roadmap
    const roadmapsWithProgress = await Promise.all(
      roadmaps.map(async (roadmap) => {
        const progress = await firestoreService.getUserProgress(user.id, roadmap.id);
        
        // Calculate overall progress
        const totalMilestones = roadmap.milestones?.length || 0;
        const completedMilestones = progress.filter(p => p.status === 'completed').length;
        const inProgressMilestones = progress.filter(p => p.status === 'in_progress').length;
        
        const totalProgress = totalMilestones > 0 
          ? Math.round(((completedMilestones + (inProgressMilestones * 0.5)) / totalMilestones) * 100)
          : 0;
        
        // Add progress info to milestones
        const milestonesWithProgress = roadmap.milestones?.map(milestone => {
          const milestoneProgress = progress.find(p => p.milestoneId === milestone.id);
          return {
            ...milestone,
            status: milestoneProgress?.status || 'not_started',
            progress: milestoneProgress?.status === 'in_progress' ? 50 : 
                     milestoneProgress?.status === 'completed' ? 100 : 0,
            notes: milestoneProgress?.notes,
            completedAt: milestoneProgress?.completedAt,
          };
        });
        
        return {
          ...roadmap,
          milestones: milestonesWithProgress,
          totalProgress,
        };
      })
    );
    
    res.json(roadmapsWithProgress);
  } catch (error) {
    console.error('Error getting roadmaps:', error);
    res.status(500).json({ 
      message: 'Failed to get roadmaps',
      error: error.message 
    });
  }
});

// Get current/active roadmap
router.get('/current', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const roadmaps = await firestoreService.getUserRoadmaps(user.id);
    
    if (roadmaps.length === 0) {
      return res.json(null);
    }
    
    // Get the most recent roadmap
    const currentRoadmap = roadmaps[0];
    const progress = await firestoreService.getUserProgress(user.id, currentRoadmap.id);
    
    // Calculate progress
    const totalMilestones = currentRoadmap.milestones?.length || 0;
    const completedMilestones = progress.filter(p => p.status === 'completed').length;
    const inProgressMilestones = progress.filter(p => p.status === 'in_progress').length;
    
    const totalProgress = totalMilestones > 0 
      ? Math.round(((completedMilestones + (inProgressMilestones * 0.5)) / totalMilestones) * 100)
      : 0;
    
    // Add progress info to milestones
    const milestonesWithProgress = currentRoadmap.milestones?.map(milestone => {
      const milestoneProgress = progress.find(p => p.milestoneId === milestone.id);
      return {
        ...milestone,
        status: milestoneProgress?.status || 'not_started',
        progress: milestoneProgress?.status === 'in_progress' ? 50 : 
                 milestoneProgress?.status === 'completed' ? 100 : 0,
      };
    });
    
    const result = {
      ...currentRoadmap,
      milestones: milestonesWithProgress,
      totalProgress,
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error getting current roadmap:', error);
    res.status(500).json({ 
      message: 'Failed to get current roadmap',
      error: error.message 
    });
  }
});

// Generate new roadmap
router.post('/', authenticateToken, requireCompleteProfile, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Validate request body
    const validationResult = createRoadmapSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid roadmap data',
        errors: validationResult.error.errors 
      });
    }
    
    const { careerId, customTitle, customDescription } = validationResult.data;
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const profile = await firestoreService.getUserProfile(user.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const career = await firestoreService.getCareerById(careerId);
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    
    // Generate AI roadmap
    const aiRoadmap = await aiService.generateCareerRoadmap(profile, career);
    
    // Create roadmap in database
    const roadmapData = {
      userId: user.id,
      careerId,
      title: customTitle || aiRoadmap.title,
      description: customDescription || aiRoadmap.description,
      milestones: aiRoadmap.milestones.map((milestone: any) => ({
        ...milestone,
        id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })),
      totalEstimatedTime: aiRoadmap.totalEstimatedTime,
      difficulty: aiRoadmap.difficulty,
    };
    
    const roadmap = await firestoreService.createRoadmap(roadmapData);
    
    res.status(201).json({
      message: 'Roadmap generated successfully',
      roadmap: {
        ...roadmap,
        totalProgress: 0,
        milestones: roadmap.milestones?.map(milestone => ({
          ...milestone,
          status: 'not_started',
          progress: 0,
        })),
      },
    });
  } catch (error) {
    console.error('Error generating roadmap:', error);
    res.status(500).json({ 
      message: 'Failed to generate roadmap',
      error: error.message 
    });
  }
});

// Get specific roadmap
router.get('/:roadmapId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { roadmapId } = req.params;
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const roadmap = await firestoreService.getRoadmapById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    
    // Verify ownership
    if (roadmap.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const progress = await firestoreService.getUserProgress(user.id, roadmapId);
    
    // Calculate progress
    const totalMilestones = roadmap.milestones?.length || 0;
    const completedMilestones = progress.filter(p => p.status === 'completed').length;
    const inProgressMilestones = progress.filter(p => p.status === 'in_progress').length;
    
    const totalProgress = totalMilestones > 0 
      ? Math.round(((completedMilestones + (inProgressMilestones * 0.5)) / totalMilestones) * 100)
      : 0;
    
    // Add progress info to milestones
    const milestonesWithProgress = roadmap.milestones?.map(milestone => {
      const milestoneProgress = progress.find(p => p.milestoneId === milestone.id);
      return {
        ...milestone,
        status: milestoneProgress?.status || 'not_started',
        progress: milestoneProgress?.status === 'in_progress' ? 50 : 
                 milestoneProgress?.status === 'completed' ? 100 : 0,
        notes: milestoneProgress?.notes,
        completedAt: milestoneProgress?.completedAt,
      };
    });
    
    const result = {
      ...roadmap,
      milestones: milestonesWithProgress,
      totalProgress,
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error getting roadmap:', error);
    res.status(500).json({ 
      message: 'Failed to get roadmap',
      error: error.message 
    });
  }
});

// Update milestone progress
router.post('/:roadmapId/progress', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Validate request body
    const validationResult = updateProgressSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid progress data',
        errors: validationResult.error.errors 
      });
    }
    
    const { roadmapId } = req.params;
    const { milestoneId, status, notes } = validationResult.data;
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const roadmap = await firestoreService.getRoadmapById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    
    // Verify ownership
    if (roadmap.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Verify milestone exists in roadmap
    const milestone = roadmap.milestones?.find(m => m.id === milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found in roadmap' });
    }
    
    // Check if progress record exists
    const existingProgress = await firestoreService.getUserProgress(user.id, roadmapId);
    const milestoneProgress = existingProgress.find(p => p.milestoneId === milestoneId);
    
    let updatedProgress;
    if (milestoneProgress) {
      // Update existing progress
      updatedProgress = await firestoreService.updateUserProgress(milestoneProgress.id, {
        status,
        notes,
        completedAt: status === 'completed' ? new Date() : null,
      });
    } else {
      // Create new progress record
      updatedProgress = await firestoreService.createUserProgress({
        userId: user.id,
        roadmapId,
        milestoneId,
        status,
        notes,
        completedAt: status === 'completed' ? new Date() : undefined,
      });
    }
    
    res.json({
      message: 'Progress updated successfully',
      progress: updatedProgress,
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ 
      message: 'Failed to update progress',
      error: error.message 
    });
  }
});

// Delete roadmap
router.delete('/:roadmapId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { roadmapId } = req.params;
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const roadmap = await firestoreService.getRoadmapById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    
    // Verify ownership
    if (roadmap.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Soft delete by setting isActive to false
    await firestoreService.updateRoadmap(roadmapId, { isActive: false });
    
    res.json({ message: 'Roadmap deleted successfully' });
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    res.status(500).json({ 
      message: 'Failed to delete roadmap',
      error: error.message 
    });
  }
});

export default router;
