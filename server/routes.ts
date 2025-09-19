import type { Express } from "express";
import { createServer, type Server } from "http";

// Import route modules
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import matchingRoutes from './routes/matching';
import roadmapRoutes from './routes/roadmap';
import uploadRoutes from './routes/upload';

// Import services and middleware
import { authenticateToken } from './middleware/auth';
import { firestoreService } from './services/firestoreService';

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'AI Career Advisor API'
    });
  });

  // API Routes - prefix all routes with /api
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/match', matchingRoutes);
  app.use('/api/roadmap', roadmapRoutes);
  app.use('/api/upload', uploadRoutes);

  // Learning resources endpoint
  app.get('/api/learning-resources', async (req, res) => {
    try {
      const skills = req.query.skills as string;
      const skillsArray = skills ? skills.split(',').map(s => s.trim()) : [];
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      
      const resources = await firestoreService.getLearningResources(skillsArray, limit);
      res.json(resources);
    } catch (error) {
      console.error('Error fetching learning resources:', error);
      res.status(500).json({ 
        message: 'Failed to fetch learning resources',
        error: error.message 
      });
    }
  });

  // Global error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('API Error:', {
      path: req.path,
      method: req.method,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Handle specific error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: err.errors
      });
    }

    if (err.name === 'UnauthorizedError' || err.status === 401) {
      return res.status(401).json({
        message: 'Unauthorized access',
        error: 'UNAUTHORIZED'
      });
    }

    if (err.name === 'ForbiddenError' || err.status === 403) {
      return res.status(403).json({
        message: 'Access forbidden',
        error: 'FORBIDDEN'
      });
    }

    // Default error response
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
      message,
      error: process.env.NODE_ENV === 'development' ? err.stack : 'INTERNAL_ERROR'
    });
  });

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      message: 'API endpoint not found',
      error: 'NOT_FOUND',
      path: req.path
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
