import { firestoreService } from './services/firestoreService';
import { 
  type User, 
  type InsertUser, 
  type UserProfile, 
  type InsertUserProfile,
  type Career,
  type InsertCareer,
  type CareerMatch,
  type InsertCareerMatch,
  type Roadmap,
  type InsertRoadmap,
  type UserProgress,
  type InsertUserProgress,
  type LearningResource
} from "@shared/schema";

// Storage interface that integrates with Firestore
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  
  // User Profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
  
  // Career operations
  getCareers(limit?: number): Promise<Career[]>;
  getCareerById(id: string): Promise<Career | undefined>;
  createCareer(career: InsertCareer): Promise<Career>;
  
  // Career Match operations
  getUserCareerMatches(userId: string, limit?: number): Promise<CareerMatch[]>;
  createCareerMatch(match: InsertCareerMatch): Promise<CareerMatch>;
  deleteUserCareerMatches(userId: string): Promise<void>;
  
  // Roadmap operations
  getUserRoadmaps(userId: string): Promise<Roadmap[]>;
  createRoadmap(roadmap: InsertRoadmap): Promise<Roadmap>;
  getRoadmapById(id: string): Promise<Roadmap | undefined>;
  updateRoadmap(id: string, data: Partial<Roadmap>): Promise<Roadmap>;
  
  // User Progress operations
  getUserProgress(userId: string, roadmapId: string): Promise<UserProgress[]>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(id: string, data: Partial<UserProgress>): Promise<UserProgress>;
  
  // Learning Resources operations
  getLearningResources(skills?: string[], limit?: number): Promise<LearningResource[]>;
  
  // Analytics operations
  getUserStats(userId: string): Promise<{
    careerMatches: number;
    roadmapProgress: number;
    skillsAcquired: number;
  }>;
  getUserActivity(userId: string, limit?: number): Promise<any[]>;
}

// Firestore-based storage implementation
export class FirestoreStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const user = await firestoreService.getUserById(id);
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const user = await firestoreService.getUserByFirebaseUid(firebaseUid);
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    return await firestoreService.createUser(user);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return await firestoreService.updateUser(id, data);
  }

  // User Profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const profile = await firestoreService.getUserProfile(userId);
    return profile || undefined;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    return await firestoreService.createUserProfile(profile);
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return await firestoreService.updateUserProfile(userId, data);
  }

  // Career operations
  async getCareers(limit: number = 50): Promise<Career[]> {
    return await firestoreService.getCareers(limit);
  }

  async getCareerById(id: string): Promise<Career | undefined> {
    const career = await firestoreService.getCareerById(id);
    return career || undefined;
  }

  async createCareer(career: InsertCareer): Promise<Career> {
    return await firestoreService.createCareer(career);
  }

  // Career Match operations
  async getUserCareerMatches(userId: string, limit: number = 10): Promise<CareerMatch[]> {
    return await firestoreService.getUserCareerMatches(userId, limit);
  }

  async createCareerMatch(match: InsertCareerMatch): Promise<CareerMatch> {
    return await firestoreService.createCareerMatch(match);
  }

  async deleteUserCareerMatches(userId: string): Promise<void> {
    await firestoreService.deleteUserCareerMatches(userId);
  }

  // Roadmap operations
  async getUserRoadmaps(userId: string): Promise<Roadmap[]> {
    return await firestoreService.getUserRoadmaps(userId);
  }

  async createRoadmap(roadmap: InsertRoadmap): Promise<Roadmap> {
    return await firestoreService.createRoadmap(roadmap);
  }

  async getRoadmapById(id: string): Promise<Roadmap | undefined> {
    const roadmap = await firestoreService.getRoadmapById(id);
    return roadmap || undefined;
  }

  async updateRoadmap(id: string, data: Partial<Roadmap>): Promise<Roadmap> {
    return await firestoreService.updateRoadmap(id, data);
  }

  // User Progress operations
  async getUserProgress(userId: string, roadmapId: string): Promise<UserProgress[]> {
    return await firestoreService.getUserProgress(userId, roadmapId);
  }

  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    return await firestoreService.createUserProgress(progress);
  }

  async updateUserProgress(id: string, data: Partial<UserProgress>): Promise<UserProgress> {
    return await firestoreService.updateUserProgress(id, data);
  }

  // Learning Resources operations
  async getLearningResources(skills: string[] = [], limit: number = 20): Promise<LearningResource[]> {
    return await firestoreService.getLearningResources(skills, limit);
  }

  // Analytics operations
  async getUserStats(userId: string): Promise<{
    careerMatches: number;
    roadmapProgress: number;
    skillsAcquired: number;
  }> {
    return await firestoreService.getUserStats(userId);
  }

  async getUserActivity(userId: string, limit: number = 10): Promise<any[]> {
    return await firestoreService.getUserActivity(userId, limit);
  }
}

// Export the storage instance
export const storage = new FirestoreStorage();

// Legacy MemStorage class (kept for compatibility but not used)
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private profiles: Map<string, UserProfile>;
  private careers: Map<string, Career>;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.careers = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...data, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Implement other methods with similar in-memory logic
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return Array.from(this.profiles.values()).find(profile => profile.userId === userId);
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const id = crypto.randomUUID();
    const newProfile: UserProfile = { 
      ...profile, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.profiles.set(id, newProfile);
    return newProfile;
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const profile = Array.from(this.profiles.values()).find(p => p.userId === userId);
    if (!profile) throw new Error('Profile not found');
    
    const updatedProfile = { ...profile, ...data, updatedAt: new Date() };
    this.profiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  async getCareers(limit: number = 50): Promise<Career[]> {
    return Array.from(this.careers.values()).slice(0, limit);
  }

  async getCareerById(id: string): Promise<Career | undefined> {
    return this.careers.get(id);
  }

  async createCareer(career: InsertCareer): Promise<Career> {
    const id = crypto.randomUUID();
    const newCareer: Career = { 
      ...career, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.careers.set(id, newCareer);
    return newCareer;
  }

  // Stub implementations for other methods (would need full implementation in production)
  async getUserCareerMatches(): Promise<CareerMatch[]> { return []; }
  async createCareerMatch(): Promise<CareerMatch> { throw new Error('Not implemented'); }
  async deleteUserCareerMatches(): Promise<void> { }
  async getUserRoadmaps(): Promise<Roadmap[]> { return []; }
  async createRoadmap(): Promise<Roadmap> { throw new Error('Not implemented'); }
  async getRoadmapById(): Promise<Roadmap | undefined> { return undefined; }
  async updateRoadmap(): Promise<Roadmap> { throw new Error('Not implemented'); }
  async getUserProgress(): Promise<UserProgress[]> { return []; }
  async createUserProgress(): Promise<UserProgress> { throw new Error('Not implemented'); }
  async updateUserProgress(): Promise<UserProgress> { throw new Error('Not implemented'); }
  async getLearningResources(): Promise<LearningResource[]> { return []; }
  async getUserStats(): Promise<{ careerMatches: number; roadmapProgress: number; skillsAcquired: number; }> {
    return { careerMatches: 0, roadmapProgress: 0, skillsAcquired: 0 };
  }
  async getUserActivity(): Promise<any[]> { return []; }
}
