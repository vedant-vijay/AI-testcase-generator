import { Router } from "express";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";

const router = Router();

// Check if GitHub OAuth is configured
const isGitHubConfigured = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CALLBACK_URL);

// Configure GitHub OAuth strategy only if environment variables are set
if (isGitHubConfigured) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: process.env.GITHUB_CALLBACK_URL!
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    // Store user info and access token
    const user = {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      accessToken: accessToken,
      avatarUrl: profile.photos?.[0]?.value
    };
    return done(null, user);
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj: any, done) => {
    done(null, obj);
  });
}

// GitHub OAuth routes (only if configured)
if (isGitHubConfigured) {
  router.get('/github', passport.authenticate('github', { scope: ['repo', 'read:user'] }));

  router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
      // Successful authentication, redirect to dashboard
      res.redirect('/dashboard');
    }
  );
} else {
  // Fallback routes when OAuth is not configured
  router.get('/github', (req, res) => {
    res.status(500).json({ error: 'GitHub OAuth not configured. Please set GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and GITHUB_CALLBACK_URL environment variables.' });
  });

  router.get('/github/callback', (req, res) => {
    res.status(500).json({ error: 'GitHub OAuth not configured' });
  });
}

// Logout route
router.post('/logout', (req, res) => {
  if (isGitHubConfigured && req.logout) {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  } else {
    res.json({ success: true });
  }
});

// Get current user
router.get('/user', (req, res) => {
  if (isGitHubConfigured && req.isAuthenticated && req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Configuration status endpoint
router.get('/status', (req, res) => {
  res.json({
    githubConfigured: isGitHubConfigured,
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

export default router;
