import * as pdfParse from 'pdf-parse';
import { storage } from './firebaseAdmin';

interface ParsedResumeData {
  text: string;
  skills: string[];
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    year?: number;
  }>;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  extractedInfo: {
    email?: string;
    phone?: string;
    name?: string;
  };
}

// Common technical skills for Indian job market
const SKILL_KEYWORDS = [
  // Programming Languages
  'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'kotlin', 'swift',
  // Web Technologies
  'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
  // Databases
  'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle',
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'linux',
  // Data Science & AI
  'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn', 'matplotlib', 'tableau', 'power bi',
  // Mobile Development
  'android', 'ios', 'react native', 'flutter', 'xamarin',
  // Other Technical Skills
  'html', 'css', 'sass', 'webpack', 'rest api', 'graphql', 'microservices', 'agile', 'scrum'
];

export class ResumeParser {
  async parseFromUrl(resumeUrl: string): Promise<ParsedResumeData> {
    try {
      // Download file from Firebase Storage
      const bucket = storage.bucket();
      const file = bucket.file(this.extractFilePathFromUrl(resumeUrl));
      const [buffer] = await file.download();
      
      return await this.parseBuffer(buffer);
    } catch (error) {
      console.error('Error parsing resume from URL:', error);
      throw new Error('Failed to parse resume');
    }
  }
  
  async parseBuffer(buffer: Buffer): Promise<ParsedResumeData> {
    try {
      const data = await pdfParse(buffer);
      const text = data.text;
      
      return {
        text,
        skills: this.extractSkills(text),
        education: this.extractEducation(text),
        experience: this.extractExperience(text),
        extractedInfo: this.extractPersonalInfo(text),
      };
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF content');
    }
  }
  
  private extractSkills(text: string): string[] {
    const skills: Set<string> = new Set();
    const lowerText = text.toLowerCase();
    
    // Look for skills section
    const skillsSection = this.extractSection(text, ['skills', 'technical skills', 'technologies']);
    const searchText = skillsSection || text;
    
    SKILL_KEYWORDS.forEach(skill => {
      if (searchText.toLowerCase().includes(skill.toLowerCase())) {
        skills.add(skill);
      }
    });
    
    // Look for common patterns like "proficient in", "experience with"
    const skillPatterns = [
      /(?:proficient in|experienced in|skilled in|knowledge of)\s+([^.]+)/gi,
      /(?:languages|technologies|tools):\s*([^.]+)/gi,
    ];
    
    skillPatterns.forEach(pattern => {
      const matches = searchText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          SKILL_KEYWORDS.forEach(skill => {
            if (match.toLowerCase().includes(skill.toLowerCase())) {
              skills.add(skill);
            }
          });
        });
      }
    });
    
    return Array.from(skills);
  }
  
  private extractEducation(text: string): ParsedResumeData['education'] {
    const education: ParsedResumeData['education'] = [];
    const educationSection = this.extractSection(text, ['education', 'academic', 'qualification']);
    const searchText = educationSection || text;
    
    // Common degree patterns
    const degreePatterns = [
      /(?:bachelor|b\.tech|b\.e|btech|be|b\.sc|bsc|b\.com|bcom|b\.a|ba|bachelor's)\s*(?:of|in)?\s*([^,\n]+)/gi,
      /(?:master|m\.tech|m\.e|mtech|me|m\.sc|msc|m\.com|mcom|m\.a|ma|mba|master's)\s*(?:of|in)?\s*([^,\n]+)/gi,
      /(?:phd|ph\.d|doctorate)\s*(?:in)?\s*([^,\n]+)/gi,
    ];
    
    degreePatterns.forEach(pattern => {
      const matches = searchText.matchAll(pattern);
      for (const match of matches) {
        const fullMatch = match[0];
        const field = match[1]?.trim() || 'Unknown';
        
        // Extract year (look for 4-digit years)
        const yearMatch = fullMatch.match(/\b(19|20)\d{2}\b/);
        const year = yearMatch ? parseInt(yearMatch[0]) : undefined;
        
        // Try to extract institution (look for common patterns)
        const institutionPattern = /(?:from|at)\s+([^,\n]+)/i;
        const institutionMatch = fullMatch.match(institutionPattern);
        const institution = institutionMatch?.[1]?.trim() || 'Not specified';
        
        education.push({
          degree: fullMatch.split(/in|of/i)[0]?.trim() || 'Unknown',
          field: field,
          institution: institution,
          year: year,
        });
      }
    });
    
    return education;
  }
  
  private extractExperience(text: string): ParsedResumeData['experience'] {
    const experience: ParsedResumeData['experience'] = [];
    const experienceSection = this.extractSection(text, ['experience', 'work experience', 'employment', 'professional experience']);
    const searchText = experienceSection || text;
    
    // Common job title patterns
    const jobPatterns = [
      /(?:software|senior|junior|lead|principal)?\s*(?:developer|engineer|analyst|manager|consultant|architect)/gi,
    ];
    
    jobPatterns.forEach(pattern => {
      const matches = searchText.matchAll(pattern);
      for (const match of matches) {
        // This is a simplified extraction - in a real implementation,
        // you'd want more sophisticated parsing to extract company names,
        // duration, and descriptions
        experience.push({
          title: match[0].trim(),
          company: 'Not specified', // Would need more advanced parsing
          duration: 'Not specified', // Would need more advanced parsing
          description: 'Not specified', // Would need more advanced parsing
        });
      }
    });
    
    return experience;
  }
  
  private extractPersonalInfo(text: string): ParsedResumeData['extractedInfo'] {
    const info: ParsedResumeData['extractedInfo'] = {};
    
    // Extract email
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = text.match(emailPattern);
    if (emailMatch) {
      info.email = emailMatch[0];
    }
    
    // Extract phone (Indian format)
    const phonePattern = /(?:\+91|91)?[\s-]?[6-9]\d{9}/;
    const phoneMatch = text.match(phonePattern);
    if (phoneMatch) {
      info.phone = phoneMatch[0];
    }
    
    // Extract name (first few lines, common patterns)
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      // Look for lines that could be names (2-3 words, no special chars)
      if (/^[A-Za-z\s]{2,50}$/.test(line) && line.split(' ').length >= 2 && line.split(' ').length <= 4) {
        info.name = line;
        break;
      }
    }
    
    return info;
  }
  
  private extractSection(text: string, sectionHeaders: string[]): string | null {
    const lines = text.split('\n');
    let startIndex = -1;
    let endIndex = -1;
    
    // Find start of section
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase().trim();
      if (sectionHeaders.some(header => line.includes(header.toLowerCase()))) {
        startIndex = i + 1;
        break;
      }
    }
    
    if (startIndex === -1) return null;
    
    // Find end of section (next section header or end of document)
    const commonSections = ['experience', 'education', 'skills', 'projects', 'certifications', 'awards'];
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].toLowerCase().trim();
      if (commonSections.some(section => line.includes(section) && !sectionHeaders.some(header => line.includes(header.toLowerCase())))) {
        endIndex = i;
        break;
      }
    }
    
    if (endIndex === -1) endIndex = lines.length;
    
    return lines.slice(startIndex, endIndex).join('\n');
  }
  
  private extractFilePathFromUrl(url: string): string {
    // Extract file path from Firebase Storage URL
    const match = url.match(/\/o\/(.+?)\?/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    throw new Error('Invalid Firebase Storage URL');
  }
}

export const resumeParser = new ResumeParser();
