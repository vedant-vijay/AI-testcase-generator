# Test Case Generator - Setup Guide

## 🚀 Quick Start

This is a complete real-time Test Case Generator web app with GitHub integration and AI-powered test case generation.

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **GitHub Account** (for OAuth and repository access)
3. **Google Account** (for free Gemini AI API)

## 🔧 Required API Keys and Setup

### 1. GitHub OAuth App Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Test Case Generator
   - **Homepage URL**: `http://localhost:8080`
   - **Authorization callback URL**: `http://localhost:8080/api/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

### 2. GitHub Personal Access Token (for API calls)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Select scopes: `repo` (for private repos) or `public_repo` (for public repos only)
4. Copy the generated token

### 3. Google Gemini API Key (FREE)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

**Note**: Gemini API provides free usage with generous quotas, perfect for development and testing!

**Gemini API Free Tier Benefits:**
- 15 requests per minute
- 1 million tokens per minute
- 1,500 requests per day
- Completely FREE with no credit card required!

## ⚙️ Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your `.env` file with the following values:

   ```env
   # GitHub OAuth Configuration
   GITHUB_CLIENT_ID=your_github_client_id_here
   GITHUB_CLIENT_SECRET=your_github_client_secret_here
   GITHUB_CALLBACK_URL=http://localhost:8080/api/auth/github/callback

   # GitHub Personal Access Token (for API calls)
   GITHUB_TOKEN=your_github_personal_access_token_here

   # Google Gemini API Configuration (FREE)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Session Secret (change this in production)
   SESSION_SECRET=your_random_session_secret_here

   # Application URL
   APP_URL=http://localhost:8080
   ```

## 🏃‍♂️ Running the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:8080`

## 🔄 Application Flow

### 1. **Login Page** (`/`)
- Click "Continue with GitHub" to authenticate
- Redirects to GitHub OAuth flow
- Returns to dashboard after successful authentication

### 2. **Dashboard** (`/dashboard`)
- Enter a GitHub repository (format: `owner/repository`)
- Click "Fetch Files" to get all code files from the repository
- Select files using checkboxes
- Click "Generate Test Case Summaries"

### 3. **Test Summaries** (`/test-summaries`)
- AI analyzes selected files and generates comprehensive test case summaries
- Each summary includes:
  - Code description
  - Key functions to test
  - Edge cases
  - Test scenarios
  - Mock requirements

### 4. **Code Viewer** (`/code-viewer`)
- Select testing framework (Jest, PyTest, JUnit, etc.)
- AI generates complete, runnable test code
- Features:
  - Copy to clipboard
  - Download test file
  - Create Pull Request (mock functionality)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Authentication**: GitHub OAuth (Passport.js)
- **AI**: Google Gemini 1.5 Flash (FREE)
- **GitHub API**: Octokit
- **Session Management**: Express Session

## 🔒 Security Features

- GitHub OAuth authentication
- Session-based user management
- Secure API key handling
- CORS protection
- Input validation

## 🐛 Troubleshooting

### Common Issues:

1. **"Authentication required" errors**
   - Check if GitHub OAuth app is configured correctly
   - Verify callback URL matches exactly
   - Ensure user is logged in

2. **"Failed to fetch repository files"**
   - Check if GitHub token has correct permissions
   - Verify repository exists and is accessible
   - Check if repository is private (requires `repo` scope)

3. **"Failed to generate test summaries"**
   - Verify Gemini API key is valid and active
   - Check if you've exceeded the free quota (unlikely for normal usage)
   - Ensure files aren't too large (1MB limit per request)

4. **Session issues**
   - Clear browser cookies and localStorage
   - Restart the development server
   - Check SESSION_SECRET is set

### Debug Mode:

Check the browser console and server logs for detailed error messages.

## 🚀 Production Deployment

1. Set environment variables on your hosting platform
2. Update `APP_URL` and `GITHUB_CALLBACK_URL` to production URLs
3. Set `SESSION_SECRET` to a strong random value
4. Enable HTTPS and update cookie settings for security

## 📁 Project Structure

```
client/                 # React frontend
├── pages/             # Route components
│   ├── Login.tsx      # GitHub OAuth login
│   ├── Dashboard.tsx  # Repository selection & file management
│   ├── TestSummaries.tsx  # AI-generated summaries
│   └── CodeViewer.tsx # Generated test code viewer
├── components/ui/     # Reusable UI components
└── global.css        # Styling

server/                # Express backend
├── routes/
│   ├── auth.ts       # GitHub OAuth routes
│   ├── github.ts     # GitHub API integration
│   └── ai.ts         # OpenAI integration
└── index.ts          # Server setup

shared/               # Shared types and interfaces
```

## 📄 API Endpoints

### Authentication
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user

### GitHub Integration
- `GET /api/github/repos/:owner/:repo/contents` - Get repository files
- `GET /api/github/repos/:owner/:repo/contents/:path` - Get file content
- `GET /api/github/repos` - Get user repositories

### AI Integration
- `POST /api/ai/generate-summaries` - Generate test case summaries
- `POST /api/ai/generate-test-code` - Generate test code
- `GET /api/ai/frameworks` - Get available test frameworks

## 💡 Features

✅ **Real GitHub OAuth authentication**  
✅ **Real GitHub API integration**  
�� **Real OpenAI integration for test generation**  
✅ **Multiple programming language support**  
✅ **Multiple test framework support**  
✅ **File content fetching and analysis**  
✅ **Responsive design**  
✅ **Session management**  
✅ **Error handling**  
✅ **Code copying and downloading**  

## 🆘 Support

For issues or questions:
1. Check this setup guide
2. Review browser console and server logs
3. Verify all API keys are correctly configured
4. Ensure all required permissions are granted
