import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, AlertCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface ConfigStatus {
  githubConfigured: boolean;
  geminiConfigured: boolean;
}

export default function Login() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/auth/status');
      if (response.ok) {
        const status = await response.json();
        setConfigStatus(status);
      }
    } catch (error) {
      console.error('Error checking configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    if (configStatus?.githubConfigured) {
      // Redirect to GitHub OAuth
      window.location.href = "/api/auth/github";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Test Case Generator</h1>
          <p className="text-slate-600">AI-powered test case generation for your code</p>
        </div>
        
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isLoading ? "Loading..." : configStatus?.githubConfigured ? "Welcome back" : "Setup Required"}
            </CardTitle>
            <CardDescription>
              {isLoading ? "Checking configuration..." : configStatus?.githubConfigured ? "Sign in to continue to your dashboard" : "Configure your environment to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-slate-300 border-t-slate-900 rounded-full"></div>
              </div>
            ) : configStatus?.githubConfigured ? (
              <>
                <Button
                  onClick={handleGitHubLogin}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                >
                  <Github className="mr-2 h-5 w-5" />
                  Continue with GitHub
                </Button>

                <div className="text-center">
                  <p className="text-sm text-slate-500">
                    Don't have an account?{" "}
                    <a href="#" className="text-slate-900 hover:underline font-medium">
                      Sign up
                    </a>
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">Configuration Required</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>To use this app, you need to configure your environment variables:</p>
                        <ul className="mt-2 ml-4 list-disc space-y-1">
                          <li><strong>GitHub OAuth:</strong> GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET</li>
                          <li><strong>Gemini AI:</strong> {configStatus?.geminiConfigured ? "✅ Configured" : "❌ GEMINI_API_KEY"}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <a
                    href="https://github.com/your-username/test-case-generator/blob/main/SETUP.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Setup Instructions
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
