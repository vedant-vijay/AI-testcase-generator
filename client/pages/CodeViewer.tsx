import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Copy, Download, GitPullRequest, Loader2, User, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

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

interface TestFramework {
  id: string;
  name: string;
  languages: string[];
}

export default function CodeViewer() {
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [repoName, setRepoName] = useState("");
  const [testCode, setTestCode] = useState("");
  const [filename, setFilename] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [frameworks, setFrameworks] = useState<TestFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    loadSummaryData();
    fetchFrameworks();
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

  const loadSummaryData = () => {
    const storedSummary = sessionStorage.getItem('selectedSummary');
    const storedRepo = sessionStorage.getItem('repoName');
    
    if (storedSummary && storedRepo) {
      const summaryData = JSON.parse(storedSummary);
      setSummary(summaryData);
      setRepoName(storedRepo);
    } else {
      window.location.href = '/test-summaries';
    }
  };

  const fetchFrameworks = async () => {
    try {
      const response = await fetch('/api/ai/frameworks');
      if (response.ok) {
        const frameworksData = await response.json();
        setFrameworks(frameworksData);
        
        // Auto-select appropriate framework based on file type
        if (summary) {
          const compatibleFramework = frameworksData.find((fw: TestFramework) => 
            fw.languages.includes(summary.type)
          );
          if (compatibleFramework) {
            setSelectedFramework(compatibleFramework.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching frameworks:', error);
    }
  };

  const generateTestCode = async () => {
    if (!summary || !selectedFramework) return;

    setIsGenerating(true);
    setError("");
    
    try {
      // First, fetch the original file content
      const [owner, repo] = repoName.split('/');
      const fileResponse = await fetch(`/api/github/repos/${owner}/${repo}/contents/${summary.path}`, {
        credentials: 'include'
      });

      if (!fileResponse.ok) {
        throw new Error('Failed to fetch file content');
      }

      const fileData = await fileResponse.json();

      // Generate test code using AI
      const response = await fetch('/api/ai/generate-test-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          file: {
            name: summary.file,
            path: summary.path,
            type: summary.type,
            content: fileData.content
          },
          summary: summary.summary,
          testFramework: selectedFramework
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTestCode(data.testCode);
        setFilename(data.filename);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate test code');
      }
    } catch (error) {
      console.error('Error generating test code:', error);
      setError('Failed to generate test code');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(testCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadTestFile = () => {
    const blob = new Blob([testCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createPullRequest = () => {
    // Mock PR creation - in real implementation, this would create an actual PR
    alert('Pull Request creation feature would be implemented here. This would create a new branch, commit the test file, and open a PR.');
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

  const getAvailableFrameworks = () => {
    if (!summary) return frameworks;
    return frameworks.filter(fw => fw.languages.includes(summary.type));
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
            <Link to="/test-summaries">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Test Summaries
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Generated Test Code</h2>
              <p className="text-slate-600">
                {summary?.file} • {repoName}
              </p>
            </div>
          </div>

          {/* Test Framework Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Test Framework</CardTitle>
              <CardDescription>
                Select the testing framework for code generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a test framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableFrameworks().map((framework) => (
                        <SelectItem key={framework.id} value={framework.id}>
                          {framework.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={generateTestCode}
                  disabled={isGenerating || !selectedFramework}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Test Code'
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* Generated Test Code */}
          {testCode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated Test Code</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Code
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTestFile}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={createPullRequest}
                    >
                      <GitPullRequest className="mr-2 h-4 w-4" />
                      Create PR
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  File: {filename}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 p-6 rounded-lg overflow-x-auto text-sm">
                    <code>{testCode}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
