import { Router } from 'express';
import { authenticateToken, requireCompleteProfile, AuthenticatedRequest } from '../middleware/auth';
import { firestoreService } from '../services/firestoreService';
import { matchingEngine } from '../services/matchingEngine';

const router = Router();

// Get career matches for user
router.get('/', authenticateToken, requireCompleteProfile, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get enhanced career matches (includes career details)
    const matches = await matchingEngine.getEnhancedCareerMatches(user.id);
    
    res.json(matches);
  } catch (error) {
    console.error('Error getting career matches:', error);
    res.status(500).json({ 
      message: 'Failed to get career matches',
      error: error.message 
    });
  }
});

// Generate new career matches
router.post('/generate', authenticateToken, requireCompleteProfile, async (req: AuthenticatedRequest, res) => {
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
    
    const limit = Math.min(parseInt(req.body.limit || '10'), 20);
    
    // Generate new matches
    const matches = await matchingEngine.generateCareerMatches(user.id, profile, limit);
    
    // Return enhanced matches with career details
    const enhancedMatches = matches.map(match => ({
      id: match.career.id,
      title: match.career.title,
      description: match.career.description,
      compatibilityScore: match.compatibilityScore,
      matchReasons: match.matchReasons,
      skillGaps: match.skillGaps,
      salaryRange: match.career.salaryRange,
      skills: match.career.skills?.slice(0, 5) || [],
      industry: match.career.industry,
      locations: match.career.locations,
      growthPath: match.career.growthPath,
      requirements: match.career.requirements,
    }));
    
    res.json({
      message: 'Career matches generated successfully',
      matches: enhancedMatches,
    });
  } catch (error) {
    console.error('Error generating career matches:', error);
    res.status(500).json({ 
      message: 'Failed to generate career matches',
      error: error.message 
    });
  }
});

// Get detailed career information
router.get('/career/:careerId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { careerId } = req.params;
    
    const career = await firestoreService.getCareerById(careerId);
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    
    // If user is authenticated, get their match score for this career
    let matchScore = null;
    if (req.user) {
      const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
      if (user) {
        const matches = await firestoreService.getUserCareerMatches(user.id);
        const userMatch = matches.find(match => match.careerId === careerId);
        if (userMatch) {
          matchScore = {
            compatibilityScore: userMatch.compatibilityScore,
            matchReasons: userMatch.matchReasons,
            skillGaps: userMatch.skillGaps,
          };
        }
      }
    }
    
    res.json({
      ...career,
      matchScore,
    });
  } catch (error) {
    console.error('Error getting career details:', error);
    res.status(500).json({ 
      message: 'Failed to get career details',
      error: error.message 
    });
  }
});

// Get all available careers (for browsing)
router.get('/careers', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    
    const careers = await firestoreService.getCareers(limit + offset);
    const paginatedCareers = careers.slice(offset, offset + limit);
    
    // Remove embeddings from public API response
    const publicCareers = paginatedCareers.map(career => {
      const { embedding, ...publicCareer } = career;
      return publicCareer;
    });
    
    res.json({
      careers: publicCareers,
      total: careers.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error getting careers:', error);
    res.status(500).json({ 
      message: 'Failed to get careers',
      error: error.message 
    });
  }
});

// Search careers
router.get('/careers/search', async (req, res) => {
  try {
    const { q, industry, skills } = req.query;
    
    if (!q && !industry && !skills) {
      return res.status(400).json({ message: 'Search query, industry, or skills required' });
    }
    
    // This is a basic implementation - in production, you'd use more sophisticated search
    const allCareers = await firestoreService.getCareers(100);
    let filteredCareers = allCareers;
    
    // Filter by text search
    if (q) {
      const searchTerm = (q as string).toLowerCase();
      filteredCareers = filteredCareers.filter(career => 
        career.title.toLowerCase().includes(searchTerm) ||
        career.description.toLowerCase().includes(searchTerm) ||
        career.industry?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by industry
    if (industry) {
      filteredCareers = filteredCareers.filter(career => 
        career.industry?.toLowerCase() === (industry as string).toLowerCase()
      );
    }
    
    // Filter by skills
    if (skills) {
      const skillArray = (skills as string).split(',').map(s => s.trim().toLowerCase());
      filteredCareers = filteredCareers.filter(career => 
        career.skills?.some(skill => 
          skillArray.some(searchSkill => 
            skill.name.toLowerCase().includes(searchSkill)
          )
        )
      );
    }
    
    // Remove embeddings from public API response
    const publicCareers = filteredCareers.map(career => {
      const { embedding, ...publicCareer } = career;
      return publicCareer;
    });
    
    res.json({
      careers: publicCareers.slice(0, 20), // Limit results
      total: publicCareers.length,
    });
  } catch (error) {
    console.error('Error searching careers:', error);
    res.status(500).json({ 
      message: 'Failed to search careers',
      error: error.message 
    });
  }
});

export default router;
