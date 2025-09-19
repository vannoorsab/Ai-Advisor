import { GoogleGenerativeAI } from '@google/generative-ai';
// TODO: Uncomment when OpenAI is used as fallback
// import OpenAI from 'openai';

interface AIProvider {
  generateRoadmap(prompt: string): Promise<any>;
  generateText(prompt: string): Promise<string>;
}

class GeminiAIProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY or GOOGLE_AI_API_KEY environment variable is required');
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }
  
  async generateRoadmap(prompt: string): Promise<any> {
    try {
      // Use gemini-2.5-pro for complex structured output
      const model = this.client.getGenerativeModel({ 
        model: 'gemini-2.5-pro',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              totalEstimatedTime: { type: 'string' },
              difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
              milestones: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    skills: { type: 'array', items: { type: 'string' } },
                    estimatedTime: { type: 'string' },
                    order: { type: 'number' },
                    resources: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: { type: 'string' },
                          type: { type: 'string', enum: ['course', 'article', 'project', 'certification'] },
                          url: { type: 'string' },
                          provider: { type: 'string' }
                        },
                        required: ['title', 'type', 'url', 'provider']
                      }
                    }
                  },
                  required: ['id', 'title', 'description', 'skills', 'estimatedTime', 'order', 'resources']
                }
              }
            },
            required: ['title', 'description', 'totalEstimatedTime', 'difficulty', 'milestones']
          }
        }
      });
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Error generating roadmap with Gemini:', error);
      throw new Error('Failed to generate roadmap');
    }
  }
  
  async generateText(prompt: string): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating text with Gemini:', error);
      throw new Error('Failed to generate text');
    }
  }
}

class OpenAIProvider implements AIProvider {
  // private client: OpenAI;
  
  constructor() {
    // TODO: Uncomment when OpenAI is available as fallback
    /*
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    this.client = new OpenAI({ apiKey });
    */
    throw new Error('OpenAI provider not implemented yet - use as fallback');
  }
  
  async generateRoadmap(prompt: string): Promise<any> {
    /*
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages: [
          {
            role: "system",
            content: "You are an expert career advisor. Generate a structured learning roadmap in JSON format."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });
      
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error generating roadmap with OpenAI:', error);
      throw new Error('Failed to generate roadmap');
    }
    */
    throw new Error('OpenAI provider not implemented yet');
  }
  
  async generateText(prompt: string): Promise<string> {
    throw new Error('OpenAI provider not implemented yet');
  }
}

class AIService {
  private providers: AIProvider[] = [];
  
  constructor() {
    // Try to initialize providers in order of preference
    try {
      this.providers.push(new GeminiAIProvider());
      console.log('✅ Gemini AI provider initialized');
    } catch (error) {
      console.warn('❌ Failed to initialize Gemini AI provider:', error.message);
    }
    
    try {
      this.providers.push(new OpenAIProvider());
      console.log('✅ OpenAI provider initialized');
    } catch (error) {
      console.warn('❌ Failed to initialize OpenAI provider:', error.message);
    }
    
    if (this.providers.length === 0) {
      console.warn('No AI providers available. Please configure GEMINI_API_KEY or OPENAI_API_KEY. Some features may be limited.');
    }
  }
  
  async generateCareerRoadmap(userProfile: any, targetCareer: any): Promise<any> {
    const prompt = this.buildRoadmapPrompt(userProfile, targetCareer);
    
    for (const provider of this.providers) {
      try {
        return await provider.generateRoadmap(prompt);
      } catch (error) {
        console.warn('AI provider failed for roadmap generation, trying next:', error.message);
        continue;
      }
    }
    
    throw new Error('All AI providers failed for roadmap generation');
  }
  
  private buildRoadmapPrompt(userProfile: any, targetCareer: any): string {
    const currentSkills = userProfile.skills?.map((s: any) => `${s.name} (${s.level})`).join(', ') || 'None specified';
    const interests = userProfile.interests?.join(', ') || 'None specified';
    const experience = userProfile.experience || 'fresher';
    
    return `
Create a personalized career roadmap for transitioning to a ${targetCareer.title} role in the Indian job market.

User Profile:
- Current Experience: ${experience}
- Current Skills: ${currentSkills}
- Interests: ${interests}
- Education: ${userProfile.education?.map((e: any) => `${e.degree} in ${e.field}`).join(', ') || 'Not specified'}

Target Career:
- Role: ${targetCareer.title}
- Industry: ${targetCareer.industry}
- Required Skills: ${targetCareer.skills?.map((s: any) => `${s.name} (${s.level})`).join(', ')}
- Salary Range: ₹${targetCareer.salaryRange?.min}-${targetCareer.salaryRange?.max} LPA

Generate a comprehensive 6-month learning roadmap with:
1. 4-6 major milestones ordered by priority
2. Each milestone should include specific skills to learn
3. Realistic time estimates (weeks/months)
4. Mix of free and paid learning resources from Indian platforms (Unacademy, BYJU'S, Coursera, Udemy, YouTube)
5. Practical projects to build portfolio
6. Relevant certifications for the Indian job market

Focus on:
- Skills gap analysis between current and required skills
- Indian job market requirements and trends
- Practical, hands-on learning approach
- Building a portfolio that appeals to Indian employers
- Networking and community engagement opportunities

The roadmap should be progressive, building from foundational concepts to advanced skills.
`;
  }
  
  async generateText(prompt: string): Promise<string> {
    for (const provider of this.providers) {
      try {
        return await provider.generateText(prompt);
      } catch (error) {
        console.warn('AI provider failed for text generation, trying next:', error.message);
        continue;
      }
    }
    
    throw new Error('All AI providers failed for text generation');
  }
}

export const aiService = new AIService();
