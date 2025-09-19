import { GoogleGenerativeAI } from '@google/generative-ai';

// TODO: Import OpenAI as fallback
// import OpenAI from 'openai';

interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
  generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
}

class GeminiEmbeddingProvider implements EmbeddingProvider {
  private client: GoogleGenerativeAI;
  
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY or GOOGLE_AI_API_KEY environment variable is required');
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Note: Using text-embedding-004 model which is suitable for semantic similarity
      const model = this.client.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      return result.embedding.values || [];
    } catch (error) {
      console.error('Error generating Gemini embedding:', error);
      throw new Error('Failed to generate embedding with Gemini');
    }
  }
  
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    // For batch processing, we'll process them individually for now
    // TODO: Implement actual batch API when available
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      try {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      } catch (error) {
        console.error('Error in batch embedding:', error);
        // Push zero vector as fallback
        embeddings.push(new Array(768).fill(0)); // Default embedding size
      }
    }
    
    return embeddings;
  }
}

class OpenAIEmbeddingProvider implements EmbeddingProvider {
  // private client: OpenAI;
  
  constructor() {
    // TODO: Uncomment when OpenAI is available as fallback
    /*
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.client = new OpenAI({ apiKey });
    */
    throw new Error('OpenAI provider not implemented yet - use as fallback');
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    // TODO: Implement OpenAI embedding generation
    /*
    try {
      const response = await this.client.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating OpenAI embedding:', error);
      throw new Error('Failed to generate embedding with OpenAI');
    }
    */
    throw new Error('OpenAI provider not implemented yet');
  }
  
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    // TODO: Implement OpenAI batch embedding generation
    throw new Error('OpenAI provider not implemented yet');
  }
}

// Embedding service with fallback support
class EmbeddingService {
  private providers: EmbeddingProvider[] = [];
  
  constructor() {
    // Try to initialize providers in order of preference
    try {
      this.providers.push(new GeminiEmbeddingProvider());
      console.log('✅ Gemini embedding provider initialized');
    } catch (error) {
      console.warn('❌ Failed to initialize Gemini embedding provider:', error.message);
    }
    
    try {
      this.providers.push(new OpenAIEmbeddingProvider());
      console.log('✅ OpenAI embedding provider initialized');
    } catch (error) {
      console.warn('❌ Failed to initialize OpenAI embedding provider:', error.message);
    }
    
    if (this.providers.length === 0) {
      console.warn('No embedding providers available. Please configure GEMINI_API_KEY or OPENAI_API_KEY. Some features may be limited.');
    }
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    for (const provider of this.providers) {
      try {
        return await provider.generateEmbedding(text);
      } catch (error) {
        console.warn('Embedding provider failed, trying next:', error.message);
        continue;
      }
    }
    
    throw new Error('All embedding providers failed');
  }
  
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    for (const provider of this.providers) {
      try {
        return await provider.generateBatchEmbeddings(texts);
      } catch (error) {
        console.warn('Batch embedding provider failed, trying next:', error.message);
        continue;
      }
    }
    
    throw new Error('All embedding providers failed for batch processing');
  }
  
  // Utility function to generate embeddings for career text
  async generateCareerEmbedding(career: {
    title: string;
    description: string;
    skills: Array<{ name: string; level: string; category: string }>;
    industry: string;
  }): Promise<number[]> {
    // Combine career information into a comprehensive text for embedding
    const skillsText = career.skills.map(s => `${s.name} (${s.level})`).join(', ');
    const careerText = [
      career.title,
      career.description,
      career.industry,
      `Required skills: ${skillsText}`,
    ].join('. ');
    
    return this.generateEmbedding(careerText);
  }
  
  // Utility function to generate embeddings for user profile
  async generateUserProfileEmbedding(profile: {
    title?: string;
    bio?: string;
    skills: Array<{ name: string; level: string }>;
    interests: string[];
    experience?: string;
  }): Promise<number[]> {
    const skillsText = profile.skills.map(s => `${s.name} (${s.level})`).join(', ');
    const interestsText = profile.interests.join(', ');
    
    const profileText = [
      profile.title || '',
      profile.bio || '',
      `Experience level: ${profile.experience || 'Unknown'}`,
      `Skills: ${skillsText}`,
      `Interests: ${interestsText}`,
    ].filter(Boolean).join('. ');
    
    return this.generateEmbedding(profileText);
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService();

// Utility function for cosine similarity calculation
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}
