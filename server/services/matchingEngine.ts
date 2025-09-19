import { embeddingService, cosineSimilarity } from './embeddings';
import { firestoreService } from './firestoreService';
import { Career, UserProfile, CareerMatch } from '@shared/schema';

interface MatchingResult {
  career: Career;
  compatibilityScore: number;
  matchReasons: string[];
  skillGaps: Array<{
    skill: string;
    currentLevel: string;
    requiredLevel: string;
  }>;
}

export class MatchingEngine {
  async generateCareerMatches(userId: string, userProfile: UserProfile, limit: number = 10): Promise<MatchingResult[]> {
    try {
      // Get all active careers
      const careers = await firestoreService.getCareers(100);
      if (careers.length === 0) {
        throw new Error('No careers available for matching');
      }
      
      // Generate user profile embedding
      const userEmbedding = await embeddingService.generateUserProfileEmbedding({
        title: userProfile.title || '',
        bio: userProfile.bio || '',
        skills: userProfile.skills || [],
        interests: userProfile.interests || [],
        experience: userProfile.experience || '',
      });
      
      // Calculate matches for each career
      const matches: MatchingResult[] = [];
      
      for (const career of careers) {
        try {
          // Generate or use existing career embedding
          let careerEmbedding = career.embedding;
          if (!careerEmbedding || careerEmbedding.length === 0) {
            careerEmbedding = await embeddingService.generateCareerEmbedding({
              title: career.title,
              description: career.description,
              skills: career.skills || [],
              industry: career.industry || '',
            });
            
            // Update career with embedding (optional - for performance)
            // await firestoreService.updateCareer(career.id, { embedding: careerEmbedding });
          }
          
          // Calculate similarity score
          const similarityScore = cosineSimilarity(userEmbedding, careerEmbedding);
          
          // Calculate additional matching factors
          const skillMatch = this.calculateSkillMatch(userProfile.skills || [], career.skills || []);
          const interestMatch = this.calculateInterestMatch(userProfile.interests || [], career);
          const experienceMatch = this.calculateExperienceMatch(userProfile.experience || '', career);
          
          // Combine scores (weighted)
          const compatibilityScore = Math.min(100, Math.round(
            (similarityScore * 0.4 + skillMatch * 0.35 + interestMatch * 0.15 + experienceMatch * 0.1) * 100
          ));
          
          if (compatibilityScore > 30) { // Only include matches above 30%
            const { matchReasons, skillGaps } = this.generateMatchExplanation(
              userProfile,
              career,
              compatibilityScore,
              skillMatch,
              interestMatch
            );
            
            matches.push({
              career,
              compatibilityScore,
              matchReasons,
              skillGaps,
            });
          }
        } catch (error) {
          console.warn(`Error processing career ${career.title}:`, error);
          continue;
        }
      }
      
      // Sort by compatibility score and return top matches
      const sortedMatches = matches
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, limit);
      
      // Save matches to Firestore
      await this.saveCareerMatches(userId, sortedMatches);
      
      return sortedMatches;
    } catch (error) {
      console.error('Error generating career matches:', error);
      throw new Error('Failed to generate career matches');
    }
  }
  
  private calculateSkillMatch(userSkills: any[], careerSkills: any[]): number {
    if (userSkills.length === 0 || careerSkills.length === 0) return 0;
    
    const userSkillNames = userSkills.map(s => s.name.toLowerCase());
    const careerSkillNames = careerSkills.map(s => s.name.toLowerCase());
    
    let totalMatch = 0;
    let totalRequiredSkills = careerSkills.length;
    
    careerSkills.forEach(careerSkill => {
      const userSkill = userSkills.find(us => 
        us.name.toLowerCase() === careerSkill.name.toLowerCase()
      );
      
      if (userSkill) {
        // Calculate level match
        const levelScore = this.calculateLevelMatch(userSkill.level, careerSkill.level);
        totalMatch += levelScore;
      }
    });
    
    return totalRequiredSkills > 0 ? totalMatch / totalRequiredSkills : 0;
  }
  
  private calculateLevelMatch(userLevel: string, requiredLevel: string): number {
    const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    const userLevelNum = levels[userLevel as keyof typeof levels] || 0;
    const requiredLevelNum = levels[requiredLevel as keyof typeof levels] || 1;
    
    if (userLevelNum >= requiredLevelNum) return 1; // Perfect match
    if (userLevelNum === requiredLevelNum - 1) return 0.7; // Close match
    if (userLevelNum === requiredLevelNum - 2) return 0.4; // Partial match
    return 0.1; // Minimal match
  }
  
  private calculateInterestMatch(userInterests: string[], career: Career): number {
    if (userInterests.length === 0) return 0.5; // Neutral
    
    const careerText = `${career.title} ${career.description} ${career.industry}`.toLowerCase();
    let matchCount = 0;
    
    userInterests.forEach(interest => {
      if (careerText.includes(interest.toLowerCase())) {
        matchCount++;
      }
    });
    
    return userInterests.length > 0 ? matchCount / userInterests.length : 0;
  }
  
  private calculateExperienceMatch(userExperience: string, career: Career): number {
    // Simple experience matching - can be enhanced
    const experienceMapping = {
      'fresher': 0,
      '0-2': 1,
      '2-5': 3,
      '5-10': 7,
      '10+': 10
    };
    
    const userExpNum = experienceMapping[userExperience as keyof typeof experienceMapping] || 0;
    
    // Most careers can accommodate various experience levels
    // Give higher scores for entry-level positions for freshers
    if (userExperience === 'fresher') {
      return career.title.toLowerCase().includes('junior') || 
             career.title.toLowerCase().includes('trainee') ? 1 : 0.7;
    }
    
    return 0.8; // Generally good match for experienced professionals
  }
  
  private generateMatchExplanation(
    userProfile: UserProfile,
    career: Career,
    compatibilityScore: number,
    skillMatch: number,
    interestMatch: number
  ): { matchReasons: string[]; skillGaps: any[] } {
    const matchReasons: string[] = [];
    const skillGaps: any[] = [];
    
    // Generate match reasons
    if (skillMatch > 0.7) {
      matchReasons.push('Strong skill alignment with your technical background');
    } else if (skillMatch > 0.4) {
      matchReasons.push('Good foundation with some skill development needed');
    }
    
    if (interestMatch > 0.5) {
      matchReasons.push('Aligns well with your stated interests');
    }
    
    if (compatibilityScore > 80) {
      matchReasons.push('Excellent overall fit based on your profile');
    } else if (compatibilityScore > 60) {
      matchReasons.push('Good career transition opportunity');
    }
    
    // Calculate skill gaps
    const userSkills = userProfile.skills || [];
    const careerSkills = career.skills || [];
    
    careerSkills.forEach(careerSkill => {
      const userSkill = userSkills.find(us => 
        us.name.toLowerCase() === careerSkill.name.toLowerCase()
      );
      
      if (!userSkill) {
        skillGaps.push({
          skill: careerSkill.name,
          currentLevel: 'none',
          requiredLevel: careerSkill.level,
        });
      } else {
        const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
        const userLevelNum = levels[userSkill.level as keyof typeof levels] || 0;
        const requiredLevelNum = levels[careerSkill.level as keyof typeof levels] || 1;
        
        if (userLevelNum < requiredLevelNum) {
          skillGaps.push({
            skill: careerSkill.name,
            currentLevel: userSkill.level,
            requiredLevel: careerSkill.level,
          });
        }
      }
    });
    
    return { matchReasons, skillGaps };
  }
  
  private async saveCareerMatches(userId: string, matches: MatchingResult[]): Promise<void> {
    try {
      // Delete existing matches for the user
      await firestoreService.deleteUserCareerMatches(userId);
      
      // Save new matches
      for (const match of matches) {
        await firestoreService.createCareerMatch({
          userId,
          careerId: match.career.id,
          compatibilityScore: match.compatibilityScore,
          matchReasons: match.matchReasons,
          skillGaps: match.skillGaps,
        });
      }
    } catch (error) {
      console.error('Error saving career matches:', error);
      // Don't throw here - matches can still be returned even if saving fails
    }
  }
  
  async getEnhancedCareerMatches(userId: string): Promise<any[]> {
    const matches = await firestoreService.getUserCareerMatches(userId);
    const enhancedMatches = [];
    
    for (const match of matches) {
      const career = await firestoreService.getCareerById(match.careerId);
      if (career) {
        enhancedMatches.push({
          id: match.id,
          title: career.title,
          description: career.description,
          compatibilityScore: match.compatibilityScore,
          matchReasons: match.matchReasons,
          skillGaps: match.skillGaps,
          salaryRange: career.salaryRange,
          skills: career.skills?.slice(0, 5) || [], // Top 5 skills
          industry: career.industry,
          locations: career.locations,
          growthPath: career.growthPath,
          requirements: career.requirements,
        });
      }
    }
    
    return enhancedMatches;
  }
}

export const matchingEngine = new MatchingEngine();
