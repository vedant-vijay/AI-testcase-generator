import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, FileText, Sparkles, User } from "lucide-react";
import { Link } from "react-router-dom";

interface FileData {
  name: string;
  path: string;
  type: string;
  size: number;
}

interface TestSummary {
  file: string;
  path: string;
  type: string;
  summary: string;
  id: string;
}

interface User {
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export default function TestSummaries() {
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const [repoName, setRepoName] = useState("");
  const [summaries, setSummaries] = useState<TestSummary[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCurrentUser();
    loadSelectedFiles();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      window.location.href = '/';
    }
  };

  const loadSelectedFiles = () => {
    const storedFiles = sessionStorage.getItem('selectedFiles');
    const storedRepo = sessionStorage.getItem('repoName');
    
    if (storedFiles && storedRepo) {
      setSelectedFiles(JSON.parse(storedFiles));
      setRepoName(storedRepo);
    } else {
      // Redirect back to dashboard if no files selected
      window.location.href = '/dashboard';
    }
  };

  const fetchFileContent = async (file: FileData) => {
    const [owner, repo] = repoName.split('/');
    const response = await fetch(`/api/github/repos/${owner}/${repo}/contents/${file.path}`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const fileData = await response.json();
      return fileData.content;
    }
    throw new Error(`Failed to fetch content for ${file.name}`);
  };

  const generateTestSummaries = async () => {
    setIsGenerating(true);
    setError("");
    
    try {
      // Fetch content for all selected files
      const filesWithContent = [];
      for (const file of selectedFiles) {
        try {
          const content = await fetchFileContent(file);
          filesWithContent.push({
            ...file,
            content
          });
        } catch (error) {
          console.error(`Error fetching content for ${file.name}:`, error);
        }
      }

      // Generate summaries using AI
      const response = await fetch('/api/ai/generate-summaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          files: filesWithContent
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSummaries(data.summaries);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate test summaries');
      }
    } catch (error) {
      console.error('Error generating summaries:', error);
      setError('Failed to generate test summaries');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTestCode = (summary: TestSummary) => {
    // Store the summary data for the code viewer page
    sessionStorage.setItem('selectedSummary', JSON.stringify(summary));
    sessionStorage.setItem('repoName', repoName);
    window.location.href = '/code-viewer';
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-slate-900">Test Case Generator</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full" />
                  ) : (
                    <User className="h-8 w-8 text-slate-400" />
                  )}
                  <span className="text-sm text-slate-600">Welcome, {user.displayName || user.username}!</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">AI Test Case Summaries</h2>
              <p className="text-slate-600">Repository: {repoName}</p>
            </div>
          </div>

          {/* Selected Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Selected Files ({selectedFiles.length})
              </CardTitle>
              <CardDescription>
                Files that will be analyzed for test case generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedFiles.map((file) => (
                  <div key={file.path} className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">{file.type}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {summaries.length === 0 && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <Button 
                    onClick={generateTestSummaries}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating AI Test Summaries...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Test Case Summaries
                      </>
                    )}
                  </Button>
                  {error && (
                    <p className="text-sm text-red-600 mt-2">{error}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Summaries */}
          {summaries.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Generated Test Case Summaries</h3>
              {summaries.map((summary) => (
                <Card key={summary.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {summary.file}
                      </span>
                      <Button 
                        onClick={() => handleGenerateTestCode(summary)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Generate Test Code
                      </Button>
                    </CardTitle>
                    <CardDescription>{summary.type} • {summary.path}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">
                        {summary.summary}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
