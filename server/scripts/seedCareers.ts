import { firestoreService } from '../services/firestoreService';
import { embeddingService } from '../services/embeddings';
import { InsertCareer } from '@shared/schema';

// Sample career data for the Indian job market
const INDIAN_CAREERS: Omit<InsertCareer, 'embedding'>[] = [
  {
    title: 'Full Stack Developer',
    description: 'Build end-to-end web applications using modern technologies like React, Node.js, and cloud platforms. Work with both frontend and backend systems to create scalable solutions.',
    requirements: [
      'Develop responsive web applications using React, Angular, or Vue.js',
      'Build RESTful APIs and microservices using Node.js, Python, or Java',
      'Design and implement database schemas and queries',
      'Deploy applications on cloud platforms like AWS, Azure, or GCP',
      'Collaborate with UI/UX designers and product managers',
      'Write clean, maintainable, and well-documented code'
    ],
    skills: [
      { name: 'React', level: 'advanced', category: 'technical' },
      { name: 'Node.js', level: 'advanced', category: 'technical' },
      { name: 'JavaScript', level: 'expert', category: 'technical' },
      { name: 'TypeScript', level: 'intermediate', category: 'technical' },
      { name: 'MongoDB', level: 'intermediate', category: 'technical' },
      { name: 'Express.js', level: 'advanced', category: 'technical' },
      { name: 'Git', level: 'advanced', category: 'technical' },
      { name: 'Problem Solving', level: 'advanced', category: 'soft' },
      { name: 'Communication', level: 'intermediate', category: 'soft' }
    ],
    salaryRange: { min: 8, max: 15, currency: 'INR_LPA' },
    locations: ['Mumbai', 'Bangalore', 'Hyderabad', 'Delhi', 'Pune', 'Chennai'],
    industry: 'Technology',
    growthPath: [
      { level: 'Junior', title: 'Junior Full Stack Developer', salaryRange: { min: 4, max: 8 }, experience: '0-2 years' },
      { level: 'Mid', title: 'Full Stack Developer', salaryRange: { min: 8, max: 15 }, experience: '2-5 years' },
      { level: 'Senior', title: 'Senior Full Stack Developer', salaryRange: { min: 15, max: 25 }, experience: '5-8 years' },
      { level: 'Lead', title: 'Tech Lead', salaryRange: { min: 25, max: 40 }, experience: '8+ years' }
    ],
    isActive: true
  },
  {
    title: 'Data Scientist',
    description: 'Analyze large datasets to extract meaningful insights and build predictive models. Use statistical methods and machine learning to solve complex business problems.',
    requirements: [
      'Collect, clean, and analyze large datasets from various sources',
      'Build machine learning models for prediction and classification',
      'Create data visualizations and dashboards for stakeholders',
      'Conduct A/B testing and statistical analysis',
      'Collaborate with engineering teams to deploy ML models',
      'Communicate findings to non-technical stakeholders'
    ],
    skills: [
      { name: 'Python', level: 'expert', category: 'technical' },
      { name: 'R', level: 'advanced', category: 'technical' },
      { name: 'SQL', level: 'advanced', category: 'technical' },
      { name: 'Machine Learning', level: 'advanced', category: 'technical' },
      { name: 'Pandas', level: 'expert', category: 'technical' },
      { name: 'NumPy', level: 'advanced', category: 'technical' },
      { name: 'Scikit-learn', level: 'advanced', category: 'technical' },
      { name: 'Tableau', level: 'intermediate', category: 'technical' },
      { name: 'Statistics', level: 'advanced', category: 'domain' },
      { name: 'Critical Thinking', level: 'advanced', category: 'soft' }
    ],
    salaryRange: { min: 12, max: 25, currency: 'INR_LPA' },
    locations: ['Bangalore', 'Mumbai', 'Hyderabad', 'Delhi', 'Pune'],
    industry: 'Technology',
    growthPath: [
      { level: 'Junior', title: 'Junior Data Scientist', salaryRange: { min: 6, max: 12 }, experience: '0-2 years' },
      { level: 'Mid', title: 'Data Scientist', salaryRange: { min: 12, max: 25 }, experience: '2-5 years' },
      { level: 'Senior', title: 'Senior Data Scientist', salaryRange: { min: 25, max: 40 }, experience: '5-8 years' },
      { level: 'Lead', title: 'Principal Data Scientist', salaryRange: { min: 40, max: 60 }, experience: '8+ years' }
    ],
    isActive: true
  },
  {
    title: 'Digital Marketing Manager',
    description: 'Develop and execute digital marketing strategies across multiple channels including social media, search engines, and email marketing to drive brand awareness and customer acquisition.',
    requirements: [
      'Plan and execute digital marketing campaigns across platforms',
      'Manage social media presence and content strategy',
      'Optimize website and content for search engines (SEO)',
      'Run and optimize paid advertising campaigns (Google Ads, Facebook Ads)',
      'Analyze campaign performance and ROI metrics',
      'Collaborate with creative teams for campaign assets'
    ],
    skills: [
      { name: 'Google Analytics', level: 'advanced', category: 'technical' },
      { name: 'Social Media Marketing', level: 'expert', category: 'domain' },
      { name: 'SEO', level: 'advanced', category: 'domain' },
      { name: 'SEM', level: 'advanced', category: 'domain' },
      { name: 'Content Marketing', level: 'advanced', category: 'domain' },
      { name: 'Email Marketing', level: 'intermediate', category: 'domain' },
      { name: 'Adobe Creative Suite', level: 'intermediate', category: 'technical' },
      { name: 'Leadership', level: 'advanced', category: 'soft' },
      { name: 'Creativity', level: 'advanced', category: 'soft' }
    ],
    salaryRange: { min: 10, max: 20, currency: 'INR_LPA' },
    locations: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad'],
    industry: 'Marketing',
    growthPath: [
      { level: 'Associate', title: 'Digital Marketing Associate', salaryRange: { min: 4, max: 8 }, experience: '0-2 years' },
      { level: 'Executive', title: 'Digital Marketing Executive', salaryRange: { min: 6, max: 12 }, experience: '1-3 years' },
      { level: 'Manager', title: 'Digital Marketing Manager', salaryRange: { min: 10, max: 20 }, experience: '3-6 years' },
      { level: 'Head', title: 'Head of Digital Marketing', salaryRange: { min: 20, max: 35 }, experience: '6+ years' }
    ],
    isActive: true
  },
  {
    title: 'Product Manager',
    description: 'Drive product strategy and development from conception to launch. Work closely with engineering, design, and business teams to deliver products that meet customer needs and business objectives.',
    requirements: [
      'Define product roadmap and prioritize features based on user needs',
      'Conduct market research and competitive analysis',
      'Work with engineering teams to plan and execute product development',
      'Gather and analyze user feedback and product metrics',
      'Coordinate product launches and go-to-market strategies',
      'Communicate product vision to stakeholders and leadership'
    ],
    skills: [
      { name: 'Product Strategy', level: 'expert', category: 'domain' },
      { name: 'User Research', level: 'advanced', category: 'domain' },
      { name: 'Agile Methodologies', level: 'advanced', category: 'domain' },
      { name: 'Data Analysis', level: 'advanced', category: 'technical' },
      { name: 'SQL', level: 'intermediate', category: 'technical' },
      { name: 'Wireframing', level: 'intermediate', category: 'technical' },
      { name: 'Leadership', level: 'expert', category: 'soft' },
      { name: 'Communication', level: 'expert', category: 'soft' },
      { name: 'Strategic Thinking', level: 'advanced', category: 'soft' }
    ],
    salaryRange: { min: 15, max: 30, currency: 'INR_LPA' },
    locations: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune'],
    industry: 'Technology',
    growthPath: [
      { level: 'Associate', title: 'Associate Product Manager', salaryRange: { min: 8, max: 15 }, experience: '0-2 years' },
      { level: 'Manager', title: 'Product Manager', salaryRange: { min: 15, max: 30 }, experience: '2-5 years' },
      { level: 'Senior', title: 'Senior Product Manager', salaryRange: { min: 25, max: 45 }, experience: '5-8 years' },
      { level: 'Director', title: 'Director of Product', salaryRange: { min: 40, max: 70 }, experience: '8+ years' }
    ],
    isActive: true
  },
  {
    title: 'UI/UX Designer',
    description: 'Create intuitive and visually appealing user interfaces and experiences for web and mobile applications. Conduct user research and testing to inform design decisions.',
    requirements: [
      'Design user interfaces for web and mobile applications',
      'Conduct user research and usability testing',
      'Create wireframes, prototypes, and design systems',
      'Collaborate with developers to implement designs',
      'Ensure designs meet accessibility standards',
      'Stay updated with design trends and best practices'
    ],
    skills: [
      { name: 'Figma', level: 'expert', category: 'technical' },
      { name: 'Adobe XD', level: 'advanced', category: 'technical' },
      { name: 'Sketch', level: 'advanced', category: 'technical' },
      { name: 'User Research', level: 'advanced', category: 'domain' },
      { name: 'Prototyping', level: 'expert', category: 'domain' },
      { name: 'Design Systems', level: 'advanced', category: 'domain' },
      { name: 'HTML/CSS', level: 'intermediate', category: 'technical' },
      { name: 'Creativity', level: 'expert', category: 'soft' },
      { name: 'Empathy', level: 'advanced', category: 'soft' }
    ],
    salaryRange: { min: 8, max: 18, currency: 'INR_LPA' },
    locations: ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'],
    industry: 'Design',
    growthPath: [
      { level: 'Junior', title: 'Junior UI/UX Designer', salaryRange: { min: 4, max: 8 }, experience: '0-2 years' },
      { level: 'Mid', title: 'UI/UX Designer', salaryRange: { min: 8, max: 18 }, experience: '2-5 years' },
      { level: 'Senior', title: 'Senior UI/UX Designer', salaryRange: { min: 15, max: 28 }, experience: '5-8 years' },
      { level: 'Lead', title: 'Design Lead', salaryRange: { min: 25, max: 45 }, experience: '8+ years' }
    ],
    isActive: true
  },
  {
    title: 'DevOps Engineer',
    description: 'Automate and optimize software deployment, infrastructure management, and continuous integration/continuous deployment (CI/CD) processes to ensure reliable and scalable systems.',
    requirements: [
      'Design and maintain CI/CD pipelines for automated deployments',
      'Manage cloud infrastructure on AWS, Azure, or Google Cloud',
      'Implement monitoring and alerting systems',
      'Automate infrastructure provisioning using Infrastructure as Code',
      'Ensure system security and compliance',
      'Troubleshoot and resolve production issues'
    ],
    skills: [
      { name: 'AWS', level: 'advanced', category: 'technical' },
      { name: 'Docker', level: 'advanced', category: 'technical' },
      { name: 'Kubernetes', level: 'advanced', category: 'technical' },
      { name: 'Jenkins', level: 'advanced', category: 'technical' },
      { name: 'Terraform', level: 'advanced', category: 'technical' },
      { name: 'Linux', level: 'expert', category: 'technical' },
      { name: 'Python', level: 'intermediate', category: 'technical' },
      { name: 'Bash Scripting', level: 'advanced', category: 'technical' },
      { name: 'Problem Solving', level: 'expert', category: 'soft' }
    ],
    salaryRange: { min: 12, max: 22, currency: 'INR_LPA' },
    locations: ['Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune'],
    industry: 'Technology',
    growthPath: [
      { level: 'Junior', title: 'Junior DevOps Engineer', salaryRange: { min: 6, max: 12 }, experience: '0-2 years' },
      { level: 'Mid', title: 'DevOps Engineer', salaryRange: { min: 12, max: 22 }, experience: '2-5 years' },
      { level: 'Senior', title: 'Senior DevOps Engineer', salaryRange: { min: 20, max: 35 }, experience: '5-8 years' },
      { level: 'Architect', title: 'DevOps Architect', salaryRange: { min: 30, max: 50 }, experience: '8+ years' }
    ],
    isActive: true
  },
  {
    title: 'Business Analyst',
    description: 'Analyze business processes and requirements to identify opportunities for improvement. Bridge the gap between business stakeholders and technical teams to deliver effective solutions.',
    requirements: [
      'Gather and analyze business requirements from stakeholders',
      'Document business processes and create process flow diagrams',
      'Identify opportunities for process improvement and automation',
      'Create functional specifications for development teams',
      'Conduct user acceptance testing and training',
      'Prepare reports and presentations for management'
    ],
    skills: [
      { name: 'Business Process Analysis', level: 'expert', category: 'domain' },
      { name: 'Requirements Gathering', level: 'expert', category: 'domain' },
      { name: 'SQL', level: 'advanced', category: 'technical' },
      { name: 'Excel', level: 'expert', category: 'technical' },
      { name: 'Power BI', level: 'advanced', category: 'technical' },
      { name: 'Visio', level: 'intermediate', category: 'technical' },
      { name: 'Agile Methodologies', level: 'advanced', category: 'domain' },
      { name: 'Communication', level: 'expert', category: 'soft' },
      { name: 'Analytical Thinking', level: 'expert', category: 'soft' }
    ],
    salaryRange: { min: 8, max: 16, currency: 'INR_LPA' },
    locations: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai'],
    industry: 'Consulting',
    growthPath: [
      { level: 'Associate', title: 'Associate Business Analyst', salaryRange: { min: 4, max: 8 }, experience: '0-2 years' },
      { level: 'Analyst', title: 'Business Analyst', salaryRange: { min: 8, max: 16 }, experience: '2-5 years' },
      { level: 'Senior', title: 'Senior Business Analyst', salaryRange: { min: 14, max: 25 }, experience: '5-8 years' },
      { level: 'Manager', title: 'Business Analysis Manager', salaryRange: { min: 22, max: 40 }, experience: '8+ years' }
    ],
    isActive: true
  },
  {
    title: 'Content Writer',
    description: 'Create engaging and informative content for various platforms including websites, blogs, social media, and marketing materials. Adapt writing style to different audiences and brand voices.',
    requirements: [
      'Write compelling content for websites, blogs, and marketing materials',
      'Conduct research on industry topics and trends',
      'Optimize content for search engines (SEO)',
      'Collaborate with marketing teams on content strategy',
      'Proofread and edit content for accuracy and consistency',
      'Maintain brand voice and style across all content'
    ],
    skills: [
      { name: 'Content Writing', level: 'expert', category: 'domain' },
      { name: 'SEO Writing', level: 'advanced', category: 'domain' },
      { name: 'Research Skills', level: 'advanced', category: 'domain' },
      { name: 'WordPress', level: 'intermediate', category: 'technical' },
      { name: 'Google Analytics', level: 'intermediate', category: 'technical' },
      { name: 'Social Media', level: 'advanced', category: 'domain' },
      { name: 'Creativity', level: 'expert', category: 'soft' },
      { name: 'Attention to Detail', level: 'expert', category: 'soft' },
      { name: 'Time Management', level: 'advanced', category: 'soft' }
    ],
    salaryRange: { min: 4, max: 10, currency: 'INR_LPA' },
    locations: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad'],
    industry: 'Media',
    growthPath: [
      { level: 'Junior', title: 'Junior Content Writer', salaryRange: { min: 2, max: 4 }, experience: '0-1 years' },
      { level: 'Mid', title: 'Content Writer', salaryRange: { min: 4, max: 10 }, experience: '1-4 years' },
      { level: 'Senior', title: 'Senior Content Writer', salaryRange: { min: 8, max: 15 }, experience: '4-7 years' },
      { level: 'Lead', title: 'Content Manager', salaryRange: { min: 12, max: 22 }, experience: '7+ years' }
    ],
    isActive: true
  },
  {
    title: 'Cybersecurity Analyst',
    description: 'Protect organizational systems and data from cyber threats. Monitor security incidents, implement security measures, and respond to security breaches and vulnerabilities.',
    requirements: [
      'Monitor security systems and identify potential threats',
      'Investigate security incidents and breaches',
      'Implement security policies and procedures',
      'Conduct vulnerability assessments and penetration testing',
      'Maintain security tools and systems',
      'Provide security training and awareness to employees'
    ],
    skills: [
      { name: 'Network Security', level: 'advanced', category: 'technical' },
      { name: 'Ethical Hacking', level: 'advanced', category: 'technical' },
      { name: 'SIEM Tools', level: 'advanced', category: 'technical' },
      { name: 'Incident Response', level: 'advanced', category: 'domain' },
      { name: 'Risk Assessment', level: 'advanced', category: 'domain' },
      { name: 'Compliance', level: 'intermediate', category: 'domain' },
      { name: 'Linux', level: 'advanced', category: 'technical' },
      { name: 'Python', level: 'intermediate', category: 'technical' },
      { name: 'Critical Thinking', level: 'expert', category: 'soft' }
    ],
    salaryRange: { min: 10, max: 20, currency: 'INR_LPA' },
    locations: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'],
    industry: 'Cybersecurity',
    growthPath: [
      { level: 'Junior', title: 'Junior Security Analyst', salaryRange: { min: 5, max: 10 }, experience: '0-2 years' },
      { level: 'Mid', title: 'Cybersecurity Analyst', salaryRange: { min: 10, max: 20 }, experience: '2-5 years' },
      { level: 'Senior', title: 'Senior Security Analyst', salaryRange: { min: 18, max: 30 }, experience: '5-8 years' },
      { level: 'Manager', title: 'Security Manager', salaryRange: { min: 25, max: 45 }, experience: '8+ years' }
    ],
    isActive: true
  },
  {
    title: 'Financial Analyst',
    description: 'Analyze financial data and market trends to provide insights for investment decisions, budgeting, and strategic planning. Prepare financial reports and presentations for management.',
    requirements: [
      'Analyze financial statements and market data',
      'Prepare financial models and forecasts',
      'Conduct industry and competitive analysis',
      'Create reports and presentations for stakeholders',
      'Support budgeting and planning processes',
      'Monitor key performance indicators and metrics'
    ],
    skills: [
      { name: 'Financial Modeling', level: 'expert', category: 'domain' },
      { name: 'Excel', level: 'expert', category: 'technical' },
      { name: 'Financial Analysis', level: 'expert', category: 'domain' },
      { name: 'Valuation', level: 'advanced', category: 'domain' },
      { name: 'Bloomberg Terminal', level: 'intermediate', category: 'technical' },
      { name: 'SQL', level: 'intermediate', category: 'technical' },
      { name: 'PowerPoint', level: 'advanced', category: 'technical' },
      { name: 'Attention to Detail', level: 'expert', category: 'soft' },
      { name: 'Analytical Thinking', level: 'expert', category: 'soft' }
    ],
    salaryRange: { min: 6, max: 15, currency: 'INR_LPA' },
    locations: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'],
    industry: 'Finance',
    growthPath: [
      { level: 'Associate', title: 'Financial Analyst Associate', salaryRange: { min: 4, max: 8 }, experience: '0-2 years' },
      { level: 'Analyst', title: 'Financial Analyst', salaryRange: { min: 6, max: 15 }, experience: '2-5 years' },
      { level: 'Senior', title: 'Senior Financial Analyst', salaryRange: { min: 12, max: 22 }, experience: '5-8 years' },
      { level: 'Manager', title: 'Finance Manager', salaryRange: { min: 18, max: 35 }, experience: '8+ years' }
    ],
    isActive: true
  }
];

// Learning resources data for seeding
const LEARNING_RESOURCES = [
  {
    title: 'React Hooks Masterclass',
    description: 'Master useState, useEffect, and custom hooks with practical projects',
    type: 'course' as const,
    url: 'https://www.udemy.com/course/react-hooks-masterclass',
    provider: 'Udemy',
    rating: 4.8,
    duration: '8h 30m',
    difficulty: 'intermediate' as const,
    skills: ['react', 'javascript', 'hooks'],
    isRecommended: true
  },
  {
    title: 'Node.js Backend Development',
    description: 'Build scalable server-side applications with Node.js and Express',
    type: 'course' as const,
    url: 'https://www.coursera.org/learn/nodejs-backend',
    provider: 'Coursera',
    rating: 4.6,
    duration: '12h 15m',
    difficulty: 'intermediate' as const,
    skills: ['nodejs', 'express', 'backend'],
    isRecommended: true
  },
  {
    title: 'AWS Cloud Practitioner',
    description: 'Get certified in cloud fundamentals with hands-on AWS experience',
    type: 'certification' as const,
    url: 'https://aws.amazon.com/certification/certified-cloud-practitioner',
    provider: 'AWS',
    rating: 4.7,
    duration: '15h 45m',
    difficulty: 'beginner' as const,
    skills: ['aws', 'cloud', 'devops'],
    isRecommended: true
  },
  {
    title: 'Python for Data Science',
    description: 'Learn Python, pandas, and machine learning for data analysis',
    type: 'course' as const,
    url: 'https://www.unacademy.com/course/python-data-science',
    provider: 'Unacademy',
    rating: 4.5,
    duration: '20h 30m',
    difficulty: 'beginner' as const,
    skills: ['python', 'pandas', 'machine learning'],
    isRecommended: true
  },
  {
    title: 'Digital Marketing Fundamentals',
    description: 'Complete guide to SEO, social media, and online advertising',
    type: 'course' as const,
    url: 'https://www.google.com/skillshop/course/digital-marketing',
    provider: 'Google',
    rating: 4.4,
    duration: '6h 20m',
    difficulty: 'beginner' as const,
    skills: ['seo', 'social media marketing', 'google ads'],
    isRecommended: true
  },
  {
    title: 'UI/UX Design with Figma',
    description: 'Create stunning user interfaces and prototypes using Figma',
    type: 'course' as const,
    url: 'https://www.youtube.com/playlist?list=PLWlUJU11tp4fEXI8deWhBQAHDv9R23WHB',
    provider: 'YouTube',
    rating: 4.3,
    duration: '4h 45m',
    difficulty: 'beginner' as const,
    skills: ['figma', 'ui design', 'prototyping'],
    isRecommended: true
  },
  {
    title: 'Cybersecurity Essentials',
    description: 'Learn network security, ethical hacking, and incident response',
    type: 'course' as const,
    url: 'https://www.cybrary.it/course/cybersecurity-fundamentals',
    provider: 'Cybrary',
    rating: 4.6,
    duration: '18h 15m',
    difficulty: 'intermediate' as const,
    skills: ['network security', 'ethical hacking', 'incident response'],
    isRecommended: true
  },
  {
    title: 'Financial Modeling in Excel',
    description: 'Build comprehensive financial models for business analysis',
    type: 'course' as const,
    url: 'https://www.edx.org/course/financial-modeling',
    provider: 'edX',
    rating: 4.5,
    duration: '12h 30m',
    difficulty: 'advanced' as const,
    skills: ['excel', 'financial modeling', 'valuation'],
    isRecommended: true
  },
  {
    title: 'Content Writing for Digital Marketing',
    description: 'Master SEO writing, copywriting, and content strategy',
    type: 'course' as const,
    url: 'https://www.skillshare.com/classes/content-writing-masterclass',
    provider: 'Skillshare',
    rating: 4.2,
    duration: '5h 30m',
    difficulty: 'beginner' as const,
    skills: ['content writing', 'seo writing', 'copywriting'],
    isRecommended: true
  },
  {
    title: 'Product Management Fundamentals',
    description: 'Learn product strategy, roadmapping, and stakeholder management',
    type: 'course' as const,
    url: 'https://www.coursera.org/specializations/product-management',
    provider: 'Coursera',
    rating: 4.7,
    duration: '25h 45m',
    difficulty: 'intermediate' as const,
    skills: ['product strategy', 'user research', 'agile methodologies'],
    isRecommended: true
  }
];

async function seedCareers() {
  try {
    console.log('🌱 Starting career seeding process...');
    
    // Check if careers already exist
    const existingCareers = await firestoreService.getCareers(1);
    if (existingCareers.length > 0) {
      console.log('✅ Careers already exist, skipping seeding');
      return;
    }
    
    console.log('📊 Generating embeddings for careers...');
    
    // Generate embeddings for each career
    const careersWithEmbeddings: InsertCareer[] = [];
    
    for (let i = 0; i < INDIAN_CAREERS.length; i++) {
      const career = INDIAN_CAREERS[i];
      console.log(`Processing ${i + 1}/${INDIAN_CAREERS.length}: ${career.title}`);
      
      try {
        // Generate embedding for this career
        const embedding = await embeddingService.generateCareerEmbedding({
          title: career.title,
          description: career.description,
          skills: career.skills || [],
          industry: career.industry || '',
        });
        
        careersWithEmbeddings.push({
          ...career,
          embedding,
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating embedding for ${career.title}:`, error);
        
        // Use a default embedding (zeros) if generation fails
        careersWithEmbeddings.push({
          ...career,
          embedding: new Array(768).fill(0), // Default embedding size
        });
      }
    }
    
    console.log('💾 Saving careers to Firestore...');
    
    // Batch create careers
    const createdCareers = await firestoreService.batchCreateCareers(careersWithEmbeddings);
    console.log(`✅ Successfully created ${createdCareers.length} careers`);
    
    console.log('📚 Seeding learning resources...');
    
    // Create learning resources
    const createdResources = await firestoreService.batchCreateLearningResources(LEARNING_RESOURCES);
    console.log(`✅ Successfully created ${createdResources.length} learning resources`);
    
    console.log('🎉 Career seeding completed successfully!');
    
    // Print summary
    console.log('\n📋 Seeding Summary:');
    console.log(`   • Careers: ${createdCareers.length}`);
    console.log(`   • Learning Resources: ${createdResources.length}`);
    console.log(`   • Industries: ${[...new Set(careersWithEmbeddings.map(c => c.industry))].join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error during career seeding:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedCareers()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedCareers };
