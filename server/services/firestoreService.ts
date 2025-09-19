import { firestore, isFirebaseInitialized } from './firebaseAdmin';
import { 
  User, InsertUser, 
  UserProfile, InsertUserProfile,
  Career, InsertCareer,
  CareerMatch, InsertCareerMatch,
  Roadmap, InsertRoadmap,
  UserProgress, InsertUserProgress,
  LearningResource
} from '@shared/schema';

export class FirestoreService {
  private ensureFirestoreInitialized(): void {
    if (!isFirebaseInitialized || !firestore) {
      throw new Error('Firestore service not available. Please check your Firebase configuration.');
    }
  }
  // User operations
  async createUser(data: InsertUser): Promise<User> {
    this.ensureFirestoreInitialized();
    const docRef = firestore!.collection('users').doc();
    const user: User = {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await docRef.set(user);
    return user;
  }
  
  async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    this.ensureFirestoreInitialized();
    const snapshot = await firestore!.collection('users')
      .where('firebaseUid', '==', firebaseUid)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as User;
  }
  
  async getUserById(id: string): Promise<User | null> {
    this.ensureFirestoreInitialized();
    const doc = await firestore!.collection('users').doc(id).get();
    return doc.exists ? doc.data() as User : null;
  }
  
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    this.ensureFirestoreInitialized();
    const updates = { ...data, updatedAt: new Date() };
    await firestore!.collection('users').doc(id).update(updates);
    
    const updated = await this.getUserById(id);
    if (!updated) throw new Error('User not found after update');
    return updated;
  }
  
  // User Profile operations
  async createUserProfile(data: InsertUserProfile): Promise<UserProfile> {
    this.ensureFirestoreInitialized();
    const docRef = firestore!.collection('userProfiles').doc();
    const profile: UserProfile = {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await docRef.set(profile);
    return profile;
  }
  
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    this.ensureFirestoreInitialized();
    const snapshot = await firestore!.collection('userProfiles')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as UserProfile;
  }
  
  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    this.ensureFirestoreInitialized();
    const snapshot = await firestore!.collection('userProfiles')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (snapshot.empty) throw new Error('Profile not found');
    
    const docId = snapshot.docs[0].id;
    const updates = { ...data, updatedAt: new Date() };
    await firestore.collection('userProfiles').doc(docId).update(updates);
    
    const updated = await this.getUserProfile(userId);
    if (!updated) throw new Error('Profile not found after update');
    return updated;
  }
  
  // Career operations
  async createCareer(data: InsertCareer): Promise<Career> {
    const docRef = firestore.collection('careers').doc();
    const career: Career = {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await docRef.set(career);
    return career;
  }
  
  async getCareers(limit: number = 50): Promise<Career[]> {
    const snapshot = await firestore.collection('careers')
      .where('isActive', '==', true)
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as Career);
  }
  
  async getCareerById(id: string): Promise<Career | null> {
    const doc = await firestore.collection('careers').doc(id).get();
    return doc.exists ? doc.data() as Career : null;
  }
  
  // Career Match operations
  async createCareerMatch(data: InsertCareerMatch): Promise<CareerMatch> {
    const docRef = firestore.collection('careerMatches').doc();
    const match: CareerMatch = {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
    };
    
    await docRef.set(match);
    return match;
  }
  
  async getUserCareerMatches(userId: string, limit: number = 10): Promise<CareerMatch[]> {
    const snapshot = await firestore.collection('careerMatches')
      .where('userId', '==', userId)
      .orderBy('compatibilityScore', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as CareerMatch);
  }
  
  async deleteUserCareerMatches(userId: string): Promise<void> {
    const snapshot = await firestore.collection('careerMatches')
      .where('userId', '==', userId)
      .get();
    
    const batch = firestore.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }
  
  // Roadmap operations
  async createRoadmap(data: InsertRoadmap): Promise<Roadmap> {
    const docRef = firestore.collection('roadmaps').doc();
    const roadmap: Roadmap = {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await docRef.set(roadmap);
    return roadmap;
  }
  
  async getUserRoadmaps(userId: string): Promise<Roadmap[]> {
    const snapshot = await firestore.collection('roadmaps')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => doc.data() as Roadmap);
  }
  
  async getRoadmapById(id: string): Promise<Roadmap | null> {
    const doc = await firestore.collection('roadmaps').doc(id).get();
    return doc.exists ? doc.data() as Roadmap : null;
  }
  
  async updateRoadmap(id: string, data: Partial<Roadmap>): Promise<Roadmap> {
    const updates = { ...data, updatedAt: new Date() };
    await firestore.collection('roadmaps').doc(id).update(updates);
    
    const updated = await this.getRoadmapById(id);
    if (!updated) throw new Error('Roadmap not found after update');
    return updated;
  }
  
  // User Progress operations
  async createUserProgress(data: InsertUserProgress): Promise<UserProgress> {
    const docRef = firestore.collection('userProgress').doc();
    const progress: UserProgress = {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await docRef.set(progress);
    return progress;
  }
  
  async getUserProgress(userId: string, roadmapId: string): Promise<UserProgress[]> {
    const snapshot = await firestore.collection('userProgress')
      .where('userId', '==', userId)
      .where('roadmapId', '==', roadmapId)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as UserProgress);
  }
  
  async updateUserProgress(id: string, data: Partial<UserProgress>): Promise<UserProgress> {
    const updates = { ...data, updatedAt: new Date() };
    await firestore.collection('userProgress').doc(id).update(updates);
    
    const doc = await firestore.collection('userProgress').doc(id).get();
    if (!doc.exists) throw new Error('User progress not found after update');
    return doc.data() as UserProgress;
  }
  
  // Learning Resources operations
  async getLearningResources(skills: string[] = [], limit: number = 20): Promise<LearningResource[]> {
    let query = firestore.collection('learningResources')
      .where('isRecommended', '==', true);
    
    if (skills.length > 0) {
      query = query.where('skills', 'array-contains-any', skills);
    }
    
    const snapshot = await query.limit(limit).get();
    return snapshot.docs.map(doc => doc.data() as LearningResource);
  }
  
  async createLearningResource(data: Partial<LearningResource>): Promise<LearningResource> {
    const docRef = firestore.collection('learningResources').doc();
    const resource: LearningResource = {
      id: docRef.id,
      title: data.title || '',
      type: data.type || 'course',
      url: data.url || '',
      provider: data.provider || '',
      ...data,
      createdAt: new Date(),
    };
    
    await docRef.set(resource);
    return resource;
  }
  
  // Batch operations
  async batchCreateCareers(careers: InsertCareer[]): Promise<Career[]> {
    const batch = firestore.batch();
    const results: Career[] = [];
    
    careers.forEach(careerData => {
      const docRef = firestore.collection('careers').doc();
      const career: Career = {
        id: docRef.id,
        ...careerData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      batch.set(docRef, career);
      results.push(career);
    });
    
    await batch.commit();
    return results;
  }
  
  async batchCreateLearningResources(resources: Partial<LearningResource>[]): Promise<LearningResource[]> {
    const batch = firestore.batch();
    const results: LearningResource[] = [];
    
    resources.forEach(resourceData => {
      const docRef = firestore.collection('learningResources').doc();
      const resource: LearningResource = {
        id: docRef.id,
        title: resourceData.title || '',
        type: resourceData.type || 'course',
        url: resourceData.url || '',
        provider: resourceData.provider || '',
        ...resourceData,
        createdAt: new Date(),
      };
      
      batch.set(docRef, resource);
      results.push(resource);
    });
    
    await batch.commit();
    return results;
  }
  
  // Analytics and stats
  async getUserStats(userId: string): Promise<{
    careerMatches: number;
    roadmapProgress: number;
    skillsAcquired: number;
  }> {
    const [matchesSnapshot, roadmapsSnapshot, progressSnapshot] = await Promise.all([
      firestore.collection('careerMatches').where('userId', '==', userId).get(),
      firestore.collection('roadmaps').where('userId', '==', userId).where('isActive', '==', true).get(),
      firestore.collection('userProgress').where('userId', '==', userId).where('status', '==', 'completed').get(),
    ]);
    
    let totalProgress = 0;
    if (!roadmapsSnapshot.empty) {
      const roadmaps = roadmapsSnapshot.docs.map(doc => doc.data() as Roadmap);
      const completedMilestones = progressSnapshot.size;
      const totalMilestones = roadmaps.reduce((sum, roadmap) => sum + (roadmap.milestones?.length || 0), 0);
      totalProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    }
    
    return {
      careerMatches: matchesSnapshot.size,
      roadmapProgress: totalProgress,
      skillsAcquired: progressSnapshot.size,
    };
  }
  
  async getUserActivity(userId: string, limit: number = 10): Promise<any[]> {
    // This is a simplified version - in production, you'd have a dedicated activity log collection
    const [progressSnapshot, roadmapSnapshot] = await Promise.all([
      firestore.collection('userProgress')
        .where('userId', '==', userId)
        .orderBy('updatedAt', 'desc')
        .limit(limit)
        .get(),
      firestore.collection('roadmaps')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get(),
    ]);
    
    const activities: any[] = [];
    
    progressSnapshot.docs.forEach(doc => {
      const progress = doc.data() as UserProgress;
      if (progress.status === 'completed') {
        activities.push({
          id: doc.id,
          type: 'completion',
          title: `Completed milestone: ${progress.milestoneId}`,
          timestamp: progress.updatedAt?.toISOString() || new Date().toISOString(),
        });
      }
    });
    
    roadmapSnapshot.docs.forEach(doc => {
      const roadmap = doc.data() as Roadmap;
      activities.push({
        id: doc.id,
        type: 'roadmap_start',
        title: `Started roadmap: ${roadmap.title}`,
        timestamp: roadmap.createdAt?.toISOString() || new Date().toISOString(),
      });
    });
    
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export const firestoreService = new FirestoreService();
