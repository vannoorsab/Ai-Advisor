import { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from '../services/firebaseAdmin';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    emailVerified: boolean;
    name?: string;
    picture?: string;
  };
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access token required',
        error: 'MISSING_TOKEN' 
      });
    }
    
    try {
      const decodedToken = await verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
        name: decodedToken.name,
        picture: decodedToken.picture,
      };
      
      next();
    } catch (tokenError) {
      return res.status(401).json({ 
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN' 
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      message: 'Authentication service error',
      error: 'AUTH_SERVICE_ERROR' 
    });
  }
}

// Optional auth middleware - doesn't fail if no token provided
export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decodedToken = await verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
        name: decodedToken.name,
        picture: decodedToken.picture,
      };
    } catch (error) {
      // Ignore token errors in optional auth
      console.warn('Optional auth token verification failed:', error);
    }
  }
  
  next();
}

// Middleware to check if user has completed profile
export async function requireCompleteProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      error: 'NOT_AUTHENTICATED' 
    });
  }
  
  try {
    // Import here to avoid circular dependency
    const { firestoreService } = await import('../services/firestoreService');
    const user = await firestoreService.getUserByFirebaseUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User profile not found',
        error: 'PROFILE_NOT_FOUND' 
      });
    }
    
    const profile = await firestoreService.getUserProfile(user.id);
    
    if (!profile || !profile.title || !profile.interests || profile.interests.length === 0) {
      return res.status(400).json({ 
        message: 'Profile incomplete. Please complete onboarding first.',
        error: 'INCOMPLETE_PROFILE',
        redirectTo: '/onboarding'
      });
    }
    
    next();
  } catch (error) {
    console.error('Profile verification error:', error);
    return res.status(500).json({ 
      message: 'Profile verification failed',
      error: 'PROFILE_VERIFICATION_ERROR' 
    });
  }
}
