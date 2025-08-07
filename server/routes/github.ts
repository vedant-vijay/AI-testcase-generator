import { Router } from "express";
import { Octokit } from "@octokit/rest";

const router = Router();

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get repository files
router.get('/repos/:owner/:repo/contents', requireAuth, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { path = '' } = req.query;
    
    const octokit = new Octokit({
      auth: req.user.accessToken,
    });

    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: path as string,
    });

    // Filter for code files only
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt'];
    
    if (Array.isArray(response.data)) {
      const files = response.data
        .filter(item => item.type === 'file')
        .filter(item => codeExtensions.some(ext => item.name.endsWith(ext)))
        .map(item => ({
          name: item.name,
          path: item.path,
          type: getFileType(item.name),
          size: item.size,
          download_url: item.download_url
        }));
      
      res.json(files);
    } else {
      res.json([]);
    }
  } catch (error: any) {
    console.error('GitHub API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch repository files' });
  }
});

// Get file content
router.get('/repos/:owner/:repo/contents/:path(*)', requireAuth, async (req, res) => {
  try {
    const { owner, repo, path } = req.params;
    
    const octokit = new Octokit({
      auth: req.user.accessToken,
    });

    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if ('content' in response.data) {
      const content = Buffer.from(response.data.content, 'base64').toString('utf8');
      res.json({
        name: response.data.name,
        path: response.data.path,
        content: content,
        size: response.data.size
      });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error: any) {
    console.error('GitHub API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch file content' });
  }
});

// Get user repositories
router.get('/repos', requireAuth, async (req, res) => {
  try {
    const octokit = new Octokit({
      auth: req.user.accessToken,
    });

    const response = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100
    });

    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      updated_at: repo.updated_at
    }));

    res.json(repos);
  } catch (error: any) {
    console.error('GitHub API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'cpp';
    case 'c':
      return 'c';
    case 'cs':
      return 'csharp';
    case 'php':
      return 'php';
    case 'rb':
      return 'ruby';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'swift':
      return 'swift';
    case 'kt':
      return 'kotlin';
    default:
      return 'text';
  }
}

export default router;
