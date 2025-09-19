import { Router } from 'express';
import { firestoreService } from '../services/firestoreService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get current user info
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    let user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    
    if (!user) {
      // Create user if doesn't exist (first login)
      user = await firestoreService.createUser({
        firebaseUid: req.user.uid,
        email: req.user.email || '',
        name: req.user.name || '',
        profilePicture: req.user.picture,
      });
    }
    
    // Get user profile
    const profile = await firestoreService.getUserProfile(user.id);
    
    res.json({
      user,
      profile,
      hasCompletedOnboarding: !!(profile && profile.title && profile.interests && profile.interests.length > 0)
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({ 
      message: 'Failed to get user information',
      error: error.message 
    });
  }
});

// Update user basic info
router.patch('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { name, profilePicture } = req.body;
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    const updatedUser = await firestoreService.updateUser(user.id, updates);
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      message: 'Failed to update user',
      error: error.message 
    });
  }
});

// Delete user account (soft delete)
router.delete('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // In production, implement soft delete by setting isDeleted flag
    // For now, just return success
    res.json({ message: 'Account deletion requested successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ 
      message: 'Failed to delete account',
      error: error.message 
    });
  }
});

export default router;
