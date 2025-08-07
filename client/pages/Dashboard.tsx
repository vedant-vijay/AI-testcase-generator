import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Github, Folder, FileText, Loader2, User } from "lucide-react";
import { Link } from "react-router-dom";

interface CodeFile {
  name: string;
  path: string;
  type: string;
  size: number;
  download_url: string;
}

interface User {
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export default function Dashboard() {
  const [repoName, setRepoName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCurrentUser();
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
        // Not authenticated, redirect to login
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      window.location.href = '/';
    }
  };

  const handleFetchFiles = async () => {
    if (!repoName.trim()) return;

    setIsLoading(true);
    setError("");
    setFiles([]);
    setSelectedFiles([]);

    try {
      const [owner, repo] = repoName.split('/');
      if (!owner || !repo) {
        setError("Please enter repository in format 'owner/repository'");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/github/repos/${owner}/${repo}/contents`, {
        credentials: 'include'
      });

      if (response.ok) {
        const filesData = await response.json();
        setFiles(filesData);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch repository files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to fetch repository files');
    } finally {
      setIsLoading(false);
    }
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

  const handleFileSelection = (filePath: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles([...selectedFiles, filePath]);
    } else {
      setSelectedFiles(selectedFiles.filter(path => path !== filePath));
    }
  };

  const handleGenerateTestSummaries = async () => {
    if (selectedFiles.length === 0) return;

    // Get file contents for selected files
    const selectedFileData = [];
    for (const filePath of selectedFiles) {
      const file = files.find(f => f.path === filePath);
      if (file) {
        selectedFileData.push({
          name: file.name,
          path: file.path,
          type: file.type,
          size: file.size
        });
      }
    }

    // Store selected files in sessionStorage for the next page
    sessionStorage.setItem('selectedFiles', JSON.stringify(selectedFileData));
    sessionStorage.setItem('repoName', repoName);
  };

  const getFileIcon = (type: string) => {
    return <FileText className="h-4 w-4 text-slate-500" />;
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
          {/* Repository Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Repository Selection
              </CardTitle>
              <CardDescription>
                Enter a GitHub repository to fetch and analyze code files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="repo">Repository Name</Label>
                  <Input
                    id="repo"
                    placeholder="e.g., username/repository-name"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="mt-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleFetchFiles()}
                  />
                  {error && (
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleFetchFiles}
                    disabled={isLoading || !repoName.trim()}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Folder className="mr-2 h-4 w-4" />
                        Fetch Files
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File List */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Code Files</CardTitle>
                <CardDescription>
                  Select the files you want to generate test cases for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.path} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <Checkbox
                        id={file.path}
                        checked={selectedFiles.includes(file.path)}
                        onCheckedChange={(checked) => handleFileSelection(file.path, checked as boolean)}
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="font-medium text-slate-900">{file.name}</p>
                          <p className="text-sm text-slate-500">{file.path}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">
                        {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                      </p>
                      <Link to="/test-summaries" onClick={handleGenerateTestSummaries}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Generate Test Case Summaries
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
