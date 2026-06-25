import { Issue, LeaderboardUser } from './types';

export const SEED_LEADERBOARD: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Shreya Mohanty',
    points: 480,
    reportsCount: 15,
    resolvedCount: 11,
    badge: 'Civic Guardian',
    badgeIcon: 'ShieldAlert',
    level: 5
  },
  {
    id: '2',
    name: 'Lucas K.',
    points: 340,
    reportsCount: 10,
    resolvedCount: 7,
    badge: 'Pothole Patrol',
    badgeIcon: 'Hammer',
    level: 4
  },
  {
    id: '3',
    name: 'Sarah Chen',
    points: 250,
    reportsCount: 8,
    resolvedCount: 5,
    badge: 'Urban Champion',
    badgeIcon: 'Award',
    level: 3
  },
  {
    id: '4',
    name: 'Marcus Brody',
    points: 180,
    reportsCount: 6,
    resolvedCount: 4,
    badge: 'Watchman',
    badgeIcon: 'Eye',
    level: 2
  },
  {
    id: '5',
    name: 'Elena Rostova',
    points: 90,
    reportsCount: 3,
    resolvedCount: 2,
    badge: 'Civic Rookie',
    badgeIcon: 'Sprout',
    level: 1
  }
];

export const SEED_ISSUES: Issue[] = [
  {
    id: 'issue-101',
    title: 'Severe Water Pipe Leakage on River Road',
    description: 'Main water line appears to have burst near the bridge. Water is gushing onto the sidewalk and road, causing significant traffic slowing. This has been running for at least two hours.',
    category: 'Water Leakage',
    status: 'In Progress',
    severity: 'High',
    upvotes: 45,
    upvotedBy: ['user-1', 'user-2'],
    reporterName: 'Sarah Chen',
    reporterEmail: 'sarah.chen@example.com',
    createdAt: new Date(Date.now() - 5 * 3600000 * 24).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 1 * 3600000 * 24).toISOString(), // 1 day ago
    x: 22,
    y: 65,
    neighborhood: 'Riverside',
    suggestedDepartment: 'Water and Sewerage Authority',
    tags: ['Flooding', 'Utility Burst', 'Road Hazard'],
    statusTimeline: [
      {
        status: 'Reported',
        updatedAt: new Date(Date.now() - 5 * 3600000 * 24).toISOString(),
        comment: 'Issue submitted by citizen Sarah Chen. Automated AI check categorized as Water Leakage.'
      },
      {
        status: 'Investigating',
        updatedAt: new Date(Date.now() - 4 * 3600000 * 24).toISOString(),
        comment: 'Dispatching field engineer to evaluate the leak on River Road.'
      },
      {
        status: 'In Progress',
        updatedAt: new Date(Date.now() - 1 * 3600000 * 24).toISOString(),
        comment: 'Water valve closed. Crew is actively digging to replace the ruptured 12-inch main line.'
      }
    ],
    aiAnalysis: {
      confidence: 0.98,
      explanation: 'Description highlights high-pressure water escape, localized road flooding, and utility-level infrastructure concerns.',
      actionPlan: [
        'Isolate water supply main upstream.',
        'Excavate and assess pipe damage.',
        'Replace broken segment and resurface path.'
      ]
    }
  },
  {
    id: 'issue-102',
    title: 'Broken Streetlight - Dark Alleyway near School',
    description: 'The streetlamp at Elm St alley has been completely dark for a week. High school students walk past this area after late sports practices. It is very dark and feels unsafe.',
    category: 'Streetlight',
    status: 'Investigating',
    severity: 'Medium',
    upvotes: 28,
    upvotedBy: ['user-3'],
    reporterName: 'Marcus Brody',
    reporterEmail: 'marcus.brody@example.com',
    createdAt: new Date(Date.now() - 2 * 3600000 * 24).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 3600000 * 24).toISOString(), // 1 day ago
    x: 45,
    y: 28,
    neighborhood: 'Downtown',
    suggestedDepartment: 'Municipal Electrical Department',
    tags: ['Safety', 'Lighting', 'Public Amenity'],
    statusTimeline: [
      {
        status: 'Reported',
        updatedAt: new Date(Date.now() - 2 * 3600000 * 24).toISOString(),
        comment: 'Report submitted. Flagged for dark environment near educational facility.'
      },
      {
        status: 'Investigating',
        updatedAt: new Date(Date.now() - 1 * 3600000 * 24).toISOString(),
        comment: 'Electrical maintenance team has added the streetlight to the night-inspection roster.'
      }
    ],
    aiAnalysis: {
      confidence: 0.95,
      explanation: 'Identified as streetlight deficiency. Highlighted location near a school elevates severity due to safety concerns.',
      actionPlan: [
        'Inspect bulb and photo-sensor status.',
        'Verify circuit breaker alignment.',
        'Replace with energy-efficient LED lamp.'
      ]
    }
  },
  {
    id: 'issue-103',
    title: 'Crater-Sized Pothole on Oakwood Blvd Lane 2',
    description: 'A deep pothole is causing vehicles to swerve violently into the adjacent lane to avoid wheel damage. Located right before the freeway entrance on Oakwood Blvd.',
    category: 'Pothole',
    status: 'Reported',
    severity: 'Critical',
    upvotes: 56,
    upvotedBy: ['user-2', 'user-4', 'user-5'],
    reporterName: 'Shreya Mohanty',
    reporterEmail: 'shreya.mohanty@example.com',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    x: 65,
    y: 42,
    neighborhood: 'Greenwood',
    suggestedDepartment: 'Public Works - Road Maintenance',
    tags: ['Traffic Hazard', 'Car Damage', 'Urgent repairs'],
    statusTimeline: [
      {
        status: 'Reported',
        updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        comment: 'Citizen report entered. Urgency verified via community upvotes. Forwarding to immediate road maintenance patch queue.'
      }
    ],
    aiAnalysis: {
      confidence: 0.99,
      explanation: 'Pothole is described as large ("crater-sized") and causing active vehicle avoidance maneuvers directly preceding high-speed highway ingress.',
      actionPlan: [
        'Deploy temporary warning barrier.',
        'Prep cavity with hot-mix asphalt sealant.',
        'Compact and steamroll surface flush with pavement.'
      ]
    }
  },
  {
    id: 'issue-104',
    title: 'Overturned Trash Bins & Littering near Greenwood Park',
    description: 'Several public bins have been knocked over, likely by animals or strong winds. Trash is blowing into the park lake and onto the pedestrian path. Needs clean-up before weekend crowds arrive.',
    category: 'Trash/Sanitation',
    status: 'Resolved',
    severity: 'Low',
    upvotes: 14,
    upvotedBy: [],
    reporterName: 'Elena Rostova',
    reporterEmail: 'elena@example.com',
    createdAt: new Date(Date.now() - 6 * 3600000 * 24).toISOString(), // 6 days ago
    updatedAt: new Date(Date.now() - 4 * 3600000 * 24).toISOString(), // 4 days ago
    x: 75,
    y: 18,
    neighborhood: 'Greenwood',
    suggestedDepartment: 'Sanitation and Environment Services',
    tags: ['Litter', 'Park Maintenance', 'Wildlife Interference'],
    statusTimeline: [
      {
        status: 'Reported',
        updatedAt: new Date(Date.now() - 6 * 3600000 * 24).toISOString(),
        comment: 'Report created for municipal sanitation crews.'
      },
      {
        status: 'Investigating',
        updatedAt: new Date(Date.now() - 5 * 3600000 * 24).toISOString(),
        comment: 'Assigned to Greenwood Park district cleaning crew.'
      },
      {
        status: 'Resolved',
        updatedAt: new Date(Date.now() - 4 * 3600000 * 24).toISOString(),
        comment: 'Bins uprighted, trash gathered and cleared from pathways and lakefront. Installed wind-resistant anchor chains.'
      }
    ],
    aiAnalysis: {
      confidence: 0.97,
      explanation: 'Public space cleanliness issue. Lower hazard level, but sensitive recreational ecology.',
      actionPlan: [
        'Dispatch sanitation patrol cart.',
        'Collect scattered refuse.',
        'Implement robust locking bins.'
      ]
    }
  },
  {
    id: 'issue-105',
    title: 'Obstructed Stop Sign at 4th and Vine Intersection',
    description: 'The Stop sign at the northwest corner of 4th Ave and Vine St is completely overgrown with tree branches. Drivers cannot see it until they are in the intersection. There was a near-miss collision yesterday.',
    category: 'Traffic Sign',
    status: 'Resolved',
    severity: 'High',
    upvotes: 33,
    upvotedBy: ['user-1'],
    reporterName: 'Shreya Mohanty',
    reporterEmail: 'shreya.mohanty@example.com',
    createdAt: new Date(Date.now() - 8 * 3600000 * 24).toISOString(), // 8 days ago
    updatedAt: new Date(Date.now() - 5 * 3600000 * 24).toISOString(), // 5 days ago
    x: 82,
    y: 58,
    neighborhood: 'Westside',
    suggestedDepartment: 'Traffic Safety and Signage',
    tags: ['Near Miss', 'Visibility obstruction', 'Intersection Safety'],
    statusTimeline: [
      {
        status: 'Reported',
        updatedAt: new Date(Date.now() - 8 * 3600000 * 24).toISOString(),
        comment: 'Urgent sign obstruction issue recorded.'
      },
      {
        status: 'In Progress',
        updatedAt: new Date(Date.now() - 7 * 3600000 * 24).toISOString(),
        comment: 'Forestry crew scheduled for tree pruning at the intersection.'
      },
      {
        status: 'Resolved',
        updatedAt: new Date(Date.now() - 5 * 3600000 * 24).toISOString(),
        comment: 'Obstructing tree limbs pruned. Full visibility of the stop sign restored. Inspected by traffic crew.'
      }
    ]
  },
  {
    id: 'issue-106',
    title: 'Broken Traffic Light Signal - Main & Broadway Loop',
    description: 'The left turn green arrow for eastbound traffic on Broadway turning onto Main St is completely dead. This causes immense backups during rush hours as drivers are afraid to turn.',
    category: 'Traffic Sign',
    status: 'In Progress',
    severity: 'High',
    upvotes: 39,
    upvotedBy: ['user-1', 'user-4'],
    reporterName: 'Lucas K.',
    reporterEmail: 'lucas@example.com',
    createdAt: new Date(Date.now() - 3 * 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000 * 24).toISOString(),
    x: 48,
    y: 42,
    neighborhood: 'Downtown',
    suggestedDepartment: 'Urban Signal Control Division',
    tags: ['Traffic Jam', 'Faulty Signal', 'Rush Hour'],
    statusTimeline: [
      {
        status: 'Reported',
        updatedAt: new Date(Date.now() - 3 * 3600000 * 24).toISOString(),
        comment: 'Signal failure logged.'
      },
      {
        status: 'Investigating',
        updatedAt: new Date(Date.now() - 2 * 3600000 * 24).toISOString(),
        comment: 'System diagnostics confirmed a faulty relay switch on the green-arrow module.'
      },
      {
        status: 'In Progress',
        updatedAt: new Date(Date.now() - 1 * 3600000 * 24).toISOString(),
        comment: 'Electrical technicians are replacement-wiring the loop relay controller.'
      }
    ]
  },
  {
    id: 'issue-107',
    title: 'Severe Basement Flooding from Stormwater Drain Defect',
    description: 'Storm drain in our street is entirely blocked by leaves. After the morning storm, water has nowhere to go and is actively seeping into several basements on our block.',
    category: 'Water Leakage',
    status: 'Reported',
    severity: 'Critical',
    upvotes: 49,
    upvotedBy: ['user-3', 'user-5'],
    reporterName: 'Sarah Chen',
    reporterEmail: 'sarah.chen@example.com',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), // 6 hrs ago
    updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    x: 88,
    y: 72,
    neighborhood: 'Westside',
    suggestedDepartment: 'Municipal Stormwater and Drainage',
    tags: ['Flooding', 'Storm Drain', 'Property Damage'],
    statusTimeline: [
      {
        status: 'Reported',
        updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
        comment: 'Critical blockage and property water damage logged. Dispatching high-priority drainage vacuum truck.'
      }
    ]
  }
];
