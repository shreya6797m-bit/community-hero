import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { SEED_ISSUES, SEED_LEADERBOARD } from './src/mockData.js';
import { Issue, IssueCategory, IssueStatus, LeaderboardUser, SeverityLevel } from './src/types.js';

const PORT = 3000;
const app = express();
app.use(express.json());

// Paths for persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const ISSUES_FILE = path.join(DATA_DIR, 'issues.json');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

// Ensure data directory and seed files exist
function initializeDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(ISSUES_FILE)) {
    fs.writeFileSync(ISSUES_FILE, JSON.stringify(SEED_ISSUES, null, 2), 'utf-8');
    console.log('Seeded issues database.');
  }

  if (!fs.existsSync(LEADERBOARD_FILE)) {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(SEED_LEADERBOARD, null, 2), 'utf-8');
    console.log('Seeded leaderboard database.');
  }
}

initializeDatabase();

// Database read/write helpers
function readIssues(): Issue[] {
  try {
    const content = fs.readFileSync(ISSUES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading issues, falling back to seed:', err);
    return SEED_ISSUES;
  }
}

function writeIssues(issues: Issue[]) {
  fs.writeFileSync(ISSUES_FILE, JSON.stringify(issues, null, 2), 'utf-8');
}

function readLeaderboard(): LeaderboardUser[] {
  try {
    const content = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading leaderboard, falling back to seed:', err);
    return SEED_LEADERBOARD;
  }
}

function writeLeaderboard(leaderboard: LeaderboardUser[]) {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2), 'utf-8');
}

// Lazy load Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        console.log('Gemini client initialized successfully.');
      } catch (err) {
        console.error('Failed to initialize GoogleGenAI client:', err);
      }
    } else {
      console.warn('GEMINI_API_KEY not set or invalid. Running in local rule-based offline mode.');
    }
  }
  return aiClient;
}

// Rule-based fallback categorization for offline mode
function analyzeIssueLocally(description: string): {
  category: IssueCategory;
  severity: SeverityLevel;
  suggestedDepartment: string;
  tags: string[];
  confidence: number;
  explanation: string;
  actionPlan: string[];
} {
  const descLower = description.toLowerCase();
  let category: IssueCategory = 'Other';
  let severity: SeverityLevel = 'Medium';
  let suggestedDepartment = 'General Municipal Support';
  let tags: string[] = ['Community Report'];
  let explanation = 'Analyzed via local heuristic parsing.';
  let actionPlan: string[] = [
    'Assess report details and locate coordinate markers.',
    'Dispatch service inspector to document conditions.',
    'Log outcome in central community system.'
  ];

  if (descLower.includes('pothole') || descLower.includes('crater') || descLower.includes('road') || descLower.includes('asphalt') || descLower.includes('street damage')) {
    category = 'Pothole';
    suggestedDepartment = 'Public Works - Road Maintenance';
    tags = ['Traffic Hazard', 'Road Surface', 'Pavement'];
    actionPlan = [
      'Set out warning signs and cones around pothole.',
      'Clear dirt and loose debris from the pothole cavity.',
      'Fill with high-performance hot-mix asphalt and compact thoroughly.'
    ];
    if (descLower.includes('severe') || descLower.includes('huge') || descLower.includes('crash') || descLower.includes('swerve') || descLower.includes('wheel')) {
      severity = 'High';
    }
  } else if (descLower.includes('streetlight') || descLower.includes('dark') || descLower.includes('lamp') || descLower.includes('flicker') || descLower.includes('bulb')) {
    category = 'Streetlight';
    suggestedDepartment = 'Municipal Electrical Department';
    tags = ['Lighting', 'Night Safety', 'Power Grid'];
    actionPlan = [
      'Locate the malfunctioning lamppost and check light sensors.',
      'Inspect wire connections and verify bulb integrity.',
      'Replace old fixture with energy-efficient LED lamp.'
    ];
    if (descLower.includes('unsafe') || descLower.includes('school') || descLower.includes('crime') || descLower.includes('dark alley')) {
      severity = 'High';
    }
  } else if (descLower.includes('leak') || descLower.includes('water') || descLower.includes('burst') || descLower.includes('pipe') || descLower.includes('gushing') || descLower.includes('flood')) {
    category = 'Water Leakage';
    suggestedDepartment = 'Water and Sewerage Authority';
    tags = ['Water Line', 'Resource Waste', 'Utility Burst'];
    actionPlan = [
      'Locate nearest valve to isolate the main pipe segment.',
      'Excavate pavement and identify the split or fractured section.',
      'Replace with reinforced copper or steel pipe and restore water flow.'
    ];
    if (descLower.includes('gushing') || descLower.includes('flooding') || descLower.includes('basement') || descLower.includes('millions of gallons')) {
      severity = 'Critical';
    }
  } else if (descLower.includes('trash') || descLower.includes('dump') || descLower.includes('garbage') || descLower.includes('litter') || descLower.includes('sanitation') || descLower.includes('rubbish')) {
    category = 'Trash/Sanitation';
    suggestedDepartment = 'Sanitation and Environment Services';
    tags = ['Cleanliness', 'Hygiene', 'Waste Removal'];
    actionPlan = [
      'Dispatch sanitation collection vehicle to location.',
      'Gather loose trash and secure local public bin enclosures.',
      'Disinfect area and report back on wildlife-proofing needs.'
    ];
    if (descLower.includes('illegal dumping') || descLower.includes('chemical') || descLower.includes('hazard')) {
      severity = 'High';
    }
  } else if (descLower.includes('sign') || descLower.includes('stop') || descLower.includes('signal') || descLower.includes('traffic light') || descLower.includes('intersection')) {
    category = 'Traffic Sign';
    suggestedDepartment = 'Traffic Safety and Signage';
    tags = ['Traffic Control', 'Intersection Safety', 'Road Signs'];
    actionPlan = [
      'Inspect sign mounting or electronic signal light controller.',
      'Prune blocking foliage or fix electric connection relays.',
      'Test signal cycle timing and clear sightlines.'
    ];
    if (descLower.includes('obstructed') || descLower.includes('broken signal') || descLower.includes('near miss') || descLower.includes('accident')) {
      severity = 'High';
    }
  }

  return {
    category,
    severity,
    suggestedDepartment,
    tags,
    confidence: 0.85,
    explanation,
    actionPlan
  };
}

// API Endpoints

// 1. Live AI-Powered Categorizer
app.post('/api/issues/categorize', async (req, res) => {
  const { description } = req.body;

  if (!description || typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({ error: 'Description is required' });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Return offline mock rule-based categorization
    const mockCategorization = analyzeIssueLocally(description);
    return res.json({
      ...mockCategorization,
      isOffline: true
    });
  }

  try {
    const prompt = `You are an AI community coordinator for a smart city issue reporting platform. 
Analyze the citizen's report of a local municipal problem:
"${description}"

Categorize it into one of the following exact categories: 'Pothole', 'Streetlight', 'Water Leakage', 'Trash/Sanitation', 'Traffic Sign', or 'Other'.

Determine the following parameters:
1. Category: Must be exactly one of: 'Pothole', 'Streetlight', 'Water Leakage', 'Trash/Sanitation', 'Traffic Sign', or 'Other'.
2. Severity: Must be one of: 'Low', 'Medium', 'High', 'Critical'.
3. Suggested Department: The department of the local municipality to handle this.
4. Tags: 2 to 4 short, relevant tags (e.g., 'Safety', 'Flooding', 'Road Hazard', 'Darkness', 'Property Damage').
5. Confidence: A decimal between 0.0 and 1.0 indicating your confidence in the categorization.
6. Explanation: A brief, polite, professional explanation of why you categorized it this way, written in clear human language.
7. Action Plan: A 3-step action plan for municipal crews to resolve this issue.

You must respond with a JSON object that strictly adheres to the requested response schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'Must be exactly one of: Pothole, Streetlight, Water Leakage, Trash/Sanitation, Traffic Sign, Other'
            },
            severity: {
              type: Type.STRING,
              description: 'Must be one of: Low, Medium, High, Critical'
            },
            suggestedDepartment: {
              type: Type.STRING,
              description: 'Appropriate municipal department'
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 4 short relevant tags'
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Confidence score between 0 and 1'
            },
            explanation: {
              type: Type.STRING,
              description: 'Explanation for categorization'
            },
            actionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-step action plan for crews'
            }
          },
          required: ['category', 'severity', 'suggestedDepartment', 'tags', 'confidence', 'explanation', 'actionPlan']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    const data = JSON.parse(text);

    // Validate category output to avoid stray classes
    const validCategories: IssueCategory[] = ['Pothole', 'Streetlight', 'Water Leakage', 'Trash/Sanitation', 'Traffic Sign', 'Other'];
    if (!validCategories.includes(data.category as IssueCategory)) {
      data.category = 'Other';
    }

    const validSeverities: SeverityLevel[] = ['Low', 'Medium', 'High', 'Critical'];
    if (!validSeverities.includes(data.severity as SeverityLevel)) {
      data.severity = 'Medium';
    }

    return res.json({
      ...data,
      isOffline: false
    });

  } catch (err) {
    console.error('Gemini categorization failed, falling back to local rule-based matching:', err);
    const mockCategorization = analyzeIssueLocally(description);
    return res.json({
      ...mockCategorization,
      isOffline: true,
      error: 'AI service temporary offline, used rules engine instead.'
    });
  }
});

// 2. Get all issues
app.get('/api/issues', (req, res) => {
  const issues = readIssues();
  res.json(issues);
});

// 3. Create new issue and award points to the reporter
app.post('/api/issues', (req, res) => {
  const {
    title,
    description,
    category,
    severity,
    reporterName,
    reporterEmail,
    x,
    y,
    neighborhood,
    suggestedDepartment,
    tags,
    aiAnalysis
  } = req.body;

  if (!title || !description || !category || !reporterName || !reporterEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const issues = readIssues();

  const newIssue: Issue = {
    id: `issue-${Date.now()}`,
    title,
    description,
    category: category as IssueCategory,
    status: 'Reported',
    severity: (severity || 'Medium') as SeverityLevel,
    upvotes: 1, // Auto-upvoted by reporter
    upvotedBy: ['reporter-ip'],
    reporterName,
    reporterEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    x: x ?? Math.floor(Math.random() * 80) + 10,
    y: y ?? Math.floor(Math.random() * 80) + 10,
    neighborhood: neighborhood || 'Central District',
    suggestedDepartment: suggestedDepartment || 'Municipal Operations',
    tags: tags || ['Citizen Report'],
    statusTimeline: [
      {
        status: 'Reported',
        updatedAt: new Date().toISOString(),
        comment: `Issue successfully logged by ${reporterName}. Forwarded to ${suggestedDepartment || 'Municipal Operations'}.`
      }
    ],
    aiAnalysis
  };

  issues.push(newIssue);
  writeIssues(issues);

  // Update leaderboard points (+20 points for reporting)
  const leaderboard = readLeaderboard();
  const existingUser = leaderboard.find(
    u => u.name.toLowerCase() === reporterName.toLowerCase() || u.name.split(' ')[0].toLowerCase() === reporterName.split(' ')[0].toLowerCase()
  );

  if (existingUser) {
    existingUser.reportsCount += 1;
    existingUser.points += 20;
    // Level up thresholds (100 points per level)
    existingUser.level = Math.floor(existingUser.points / 100) + 1;
  } else {
    // Create new leaderboard entry
    leaderboard.push({
      id: `user-${Date.now()}`,
      name: reporterName,
      points: 20,
      reportsCount: 1,
      resolvedCount: 0,
      badge: 'Civic Novice',
      badgeIcon: 'Sprout',
      level: 1
    });
  }

  // Sort leaderboard by points descending
  leaderboard.sort((a, b) => b.points - a.points);
  writeLeaderboard(leaderboard);

  res.status(201).json(newIssue);
});

// 4. Upvote an issue (increases points to reporter and advances issue relevance)
app.post('/api/issues/:id/upvote', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // simple browser identifier

  const issues = readIssues();
  const issue = issues.find(i => i.id === id);

  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const userIdentifier = userId || 'anonymous';

  if (issue.upvotedBy.includes(userIdentifier)) {
    return res.status(400).json({ error: 'You have already upvoted this issue' });
  }

  issue.upvotes += 1;
  issue.upvotedBy.push(userIdentifier);
  issue.updatedAt = new Date().toISOString();
  writeIssues(issues);

  // Award reporter +5 points for community validation
  const leaderboard = readLeaderboard();
  const reporter = leaderboard.find(u => u.name.toLowerCase() === issue.reporterName.toLowerCase());
  if (reporter) {
    reporter.points += 5;
    reporter.level = Math.floor(reporter.points / 100) + 1;
    writeLeaderboard(leaderboard);
  }

  res.json(issue);
});

// 5. Update issue status (Simulates administrative status flow)
app.put('/api/issues/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;

  const validStatuses: IssueStatus[] = ['Reported', 'Investigating', 'In Progress', 'Resolved'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Valid status is required' });
  }

  const issues = readIssues();
  const issue = issues.find(i => i.id === id);

  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const oldStatus = issue.status;
  issue.status = status;
  issue.updatedAt = new Date().toISOString();
  
  issue.statusTimeline.push({
    status,
    updatedAt: new Date().toISOString(),
    comment: comment || `Status updated from ${oldStatus} to ${status}.`
  });

  writeIssues(issues);

  // If issue is resolved, give reporter a +50 point bonus!
  if (status === 'Resolved' && oldStatus !== 'Resolved') {
    const leaderboard = readLeaderboard();
    const reporter = leaderboard.find(u => u.name.toLowerCase() === issue.reporterName.toLowerCase());
    if (reporter) {
      reporter.points += 50;
      reporter.resolvedCount += 1;
      reporter.level = Math.floor(reporter.points / 100) + 1;
      
      // Upgrade badges based on resolution count
      if (reporter.resolvedCount >= 10) {
        reporter.badge = 'Civic Legend';
        reporter.badgeIcon = 'ShieldAlert';
      } else if (reporter.resolvedCount >= 5) {
        reporter.badge = 'Civic Champion';
        reporter.badgeIcon = 'Award';
      } else if (reporter.resolvedCount >= 2) {
        reporter.badge = 'Local Guardian';
        reporter.badgeIcon = 'Eye';
      }
      
      writeLeaderboard(leaderboard);
    }
  }

  res.json(issue);
});

// 6. Get Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const leaderboard = readLeaderboard();
  res.json(leaderboard);
});

// 7. Get platform statistics
app.get('/api/stats', (req, res) => {
  const issues = readIssues();
  
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === 'Resolved').length;
  const inProgressIssues = issues.filter(i => i.status === 'In Progress').length;
  const investigatingIssues = issues.filter(i => i.status === 'Investigating').length;
  const reportedIssues = issues.filter(i => i.status === 'Reported').length;

  // Compute average resolution time (mock calculations tied to seeded issue durations)
  const averageResolutionDays = 3.2; 

  const categoryDistribution: Record<IssueCategory, number> = {
    'Pothole': 0,
    'Streetlight': 0,
    'Water Leakage': 0,
    'Trash/Sanitation': 0,
    'Traffic Sign': 0,
    'Other': 0
  };

  const neighborhoodDistribution: Record<string, number> = {};

  issues.forEach(i => {
    if (categoryDistribution[i.category] !== undefined) {
      categoryDistribution[i.category]++;
    } else {
      categoryDistribution['Other']++;
    }

    const n = i.neighborhood;
    neighborhoodDistribution[n] = (neighborhoodDistribution[n] || 0) + 1;
  });

  // Calculate 7-day trend
  const weeklyTrend = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Simulate counts relative to seeded data timeline
    const reportedSeed = [2, 1, 3, 2, 4, 1, reportedIssues];
    const resolvedSeed = [1, 2, 1, 3, 2, 2, resolvedIssues];
    
    return {
      date: label,
      reported: reportedSeed[idx] || 0,
      resolved: resolvedSeed[idx] || 0
    };
  });

  res.json({
    totalIssues,
    resolvedIssues,
    inProgressIssues,
    investigatingIssues,
    reportedIssues,
    averageResolutionDays,
    categoryDistribution,
    neighborhoodDistribution,
    weeklyTrend
  });
});

// Vite server integrations
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
  });
}

startServer();
