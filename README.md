# AI Career Advisor India

A comprehensive AI-powered career guidance platform designed specifically for the Indian job market. The platform provides personalized career recommendations, skill-based matching, structured learning roadmaps, and progress tracking to help professionals navigate their career journey.

## 🌟 Features

- **Firebase Authentication**: Email/password and Google OAuth integration
- **Multi-step Onboarding**: Comprehensive profile setup with interests and resume upload
- **AI-Powered Career Matching**: Uses embeddings and cosine similarity for accurate job matching
- **Resume Analysis**: Automated skill extraction and parsing using pdf-parse
- **Personalized Roadmaps**: AI-generated learning paths with milestones and resources
- **Progress Tracking**: Monitor learning progress and skill development
- **Offline Support**: IndexedDB caching with sync capabilities
- **Indian Market Focus**: Salary ranges in INR, local companies, and relevant opportunities

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling with shadcn/ui components
- **Wouter** for client-side routing
- **TanStack Query** for state management and API calls
- **Firebase SDK** for authentication and storage
- **IndexedDB** for offline caching

### Backend
- **Node.js** with Express.js
- **Firebase Admin SDK** for server-side operations
- **Firestore** as the primary database
- **Firebase Storage** for resume files
- **Google Gemini AI** for embeddings and roadmap generation
- **pdf-parse** for resume processing

### AI/ML Services
- **Google Vertex AI Embeddings** (with OpenAI fallback)
- **Gemini 2.5 Pro** for structured roadmap generation
- **Cosine similarity** for career matching
- **Custom matching engine** with skill gap analysis

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- A Firebase project set up
- Google Cloud project with Vertex AI enabled (for embeddings)
- Gemini API key or OpenAI API key

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ai-career-advisor-india
npm install
