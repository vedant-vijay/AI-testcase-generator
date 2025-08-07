import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Generate test case summaries
router.post('/generate-summaries', requireAuth, async (req, res) => {
  try {
    const { files } = req.body;
    
    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ error: 'Files array is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const summaries = [];

    for (const file of files) {
      try {
        const prompt = `Analyze this ${file.type} code file and generate a comprehensive test case summary.

File: ${file.name}
Code:
${file.content}

Please provide:
1. A brief description of what this code does
2. Key functions/methods that need testing
3. Edge cases to consider
4. Suggested test scenarios
5. Potential mock requirements

Format the response as a structured summary.`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const summary = {
          file: file.name,
          path: file.path,
          type: file.type,
          summary: text || "Failed to generate summary",
          id: `${file.path}-${Date.now()}`
        };

        summaries.push(summary);
      } catch (error) {
        console.error(`Error generating summary for ${file.name}:`, error);
        summaries.push({
          file: file.name,
          path: file.path,
          type: file.type,
          summary: "Failed to generate summary due to an error.",
          id: `${file.path}-${Date.now()}`
        });
      }
    }

    res.json({ summaries });
  } catch (error: any) {
    console.error('Gemini API error:', error.message);
    res.status(500).json({ error: 'Failed to generate test case summaries' });
  }
});

// Generate actual test code
router.post('/generate-test-code', requireAuth, async (req, res) => {
  try {
    const { file, summary, testFramework = 'jest' } = req.body;
    
    if (!file || !summary) {
      return res.status(400).json({ error: 'File and summary are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const prompt = `Generate comprehensive test code for this file using ${testFramework}.

File: ${file.name}
Type: ${file.type}
Summary: ${summary}

Original Code:
${file.content}

Requirements:
1. Use ${testFramework} testing framework
2. Include all necessary imports and setup
3. Test all major functions/methods
4. Include edge cases and error scenarios
5. Add proper mocking where needed
6. Follow best practices for ${file.type} testing
7. Make tests readable and maintainable

Generate complete, runnable test code. Only return the test code without any explanations or markdown formatting.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const testCode = response.text();
    
    res.json({ 
      testCode: testCode || "Failed to generate test code",
      framework: testFramework,
      filename: `${file.name.split('.')[0]}.test.${file.name.split('.').pop()}`
    });
  } catch (error: any) {
    console.error('Gemini API error:', error.message);
    res.status(500).json({ error: 'Failed to generate test code' });
  }
});

// Get available test frameworks
router.get('/frameworks', (req, res) => {
  const frameworks = [
    { id: 'jest', name: 'Jest', languages: ['javascript', 'typescript'] },
    { id: 'vitest', name: 'Vitest', languages: ['javascript', 'typescript'] },
    { id: 'mocha', name: 'Mocha', languages: ['javascript', 'typescript'] },
    { id: 'pytest', name: 'PyTest', languages: ['python'] },
    { id: 'unittest', name: 'unittest', languages: ['python'] },
    { id: 'junit', name: 'JUnit', languages: ['java'] },
    { id: 'googletest', name: 'Google Test', languages: ['cpp', 'c'] },
    { id: 'xunit', name: 'xUnit', languages: ['csharp'] },
    { id: 'phpunit', name: 'PHPUnit', languages: ['php'] },
    { id: 'rspec', name: 'RSpec', languages: ['ruby'] }
  ];
  
  res.json(frameworks);
});

export default router;
