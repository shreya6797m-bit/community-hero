import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, CheckCircle2, Clock, ShieldAlert, Users, TrendingUp, AlertCircle, Building2 } from 'lucide-react';
import { SystemStats } from '../types';

interface StatsDashboardProps {
  stats: SystemStats | null;
  onRefresh: () => void;
}

export default function StatsDashboard({ stats, onRefresh }: StatsDashboardProps) {
  const [activeCategoryTab, setActiveCategoryTab] = useState<'count' | 'percentage'>('count');

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#161618] rounded-2xl border border-white/10 min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="p-3 bg-blue-500/10 rounded-full mb-4 text-blue-400"
        >
          <TrendingUp className="w-6 h-6" />
        </motion.div>
        <p className="text-sm font-semibold text-white">Loading Municipal Analytics...</p>
      </div>
    );
  }

  // Calculate percentages
  const resolutionRate = stats.totalIssues > 0 
    ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100) 
    : 0;

  // Custom Category Distribution List helpers
  const categoryKeys = Object.keys(stats.categoryDistribution) as any[];
  const maxCategoryCount = Math.max(...Object.values(stats.categoryDistribution), 1);

  // Category visual custom styles
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'Pothole': return { color: 'bg-rose-500', text: 'text-rose-400', fill: '#f43f5e' };
      case 'Streetlight': return { color: 'bg-amber-500', text: 'text-amber-400', fill: '#f59e0b' };
      case 'Water Leakage': return { color: 'bg-blue-500', text: 'text-blue-400', fill: '#3b82f6' };
      case 'Trash/Sanitation': return { color: 'bg-emerald-500', text: 'text-emerald-400', fill: '#10b981' };
      case 'Traffic Sign': return { color: 'bg-violet-500', text: 'text-violet-400', fill: '#8b5cf6' };
      default: return { color: 'bg-gray-500', text: 'text-gray-400', fill: '#6b7280' };
    }
  };

  // Custom SVG line chart calculations for weeklyTrend
  const paddingX = 8;
  const paddingY = 10;
  const chartWidth = 100;
  const chartHeight = 50;

  // Find max value in weeklyTrend to scale correctly
  const trendMax = Math.max(
    ...stats.weeklyTrend.map(t => Math.max(t.reported, t.resolved)),
    5 // Minimum ceiling
  );

  // Convert points to SVG coords
  const pointsReported = stats.weeklyTrend.map((t, index) => {
    const x = paddingX + (index * (chartWidth - 2 * paddingX)) / (stats.weeklyTrend.length - 1);
    const y = chartHeight - paddingY - (t.reported * (chartHeight - 2 * paddingY)) / trendMax;
    return { x, y, label: t.reported, date: t.date };
  });

  const pointsResolved = stats.weeklyTrend.map((t, index) => {
    const x = paddingX + (index * (chartWidth - 2 * paddingX)) / (stats.weeklyTrend.length - 1);
    const y = chartHeight - paddingY - (t.resolved * (chartHeight - 2 * paddingY)) / trendMax;
    return { x, y, label: t.resolved };
  });

  // Build SVG path strings
  const pathReported = pointsReported.reduce((acc, p, index) => {
    return acc + `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }, '');

  const pathResolved = pointsResolved.reduce((acc, p, index) => {
    return acc + `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }, '');

  // Fill paths under line for gradient effect
  const fillPathReported = pathReported + ` L ${pointsReported[pointsReported.length - 1].x} ${chartHeight - paddingY} L ${pointsReported[0].x} ${chartHeight - paddingY} Z`;
  const fillPathResolved = pathResolved + ` L ${pointsResolved[pointsResolved.length - 1].x} ${chartHeight - paddingY} L ${pointsResolved[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="space-y-6" id="dashboard-tab">
      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Reports */}
        <div className="bg-[#161618] p-5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4 text-left">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Logged</span>
            <span className="text-2xl font-black text-white">{stats.totalIssues}</span>
            <span className="text-[10px] text-gray-500 block mt-1">
              Active community submissions
            </span>
          </div>
        </div>

        {/* KPI 2: Resolved */}
        <div className="bg-[#161618] p-5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4 text-left">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Resolved</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{stats.resolvedIssues}</span>
              <span className="text-xs font-bold text-emerald-400">({resolutionRate}%)</span>
            </div>
            <span className="text-[10px] text-gray-500 block mt-1">
              Work orders marked complete
            </span>
          </div>
        </div>

        {/* KPI 3: In Progress */}
        <div className="bg-[#161618] p-5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4 text-left">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Active Queue</span>
            <span className="text-2xl font-black text-white">{stats.inProgressIssues + stats.investigatingIssues}</span>
            <span className="text-[10px] text-gray-500 block mt-1">
              {stats.reportedIssues} pending assessment
            </span>
          </div>
        </div>

        {/* KPI 4: Speed */}
        <div className="bg-[#161618] p-5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4 text-left">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Resolution Speed</span>
            <span className="text-2xl font-black text-white">{stats.averageResolutionDays} Days</span>
            <span className="text-[10px] text-gray-500 block mt-1">
              Average dispatch-to-close
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Bento Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Trend Graph Area (2/3 width) */}
        <div className="bg-[#161618] p-6 rounded-2xl border border-white/10 shadow-xl xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-left">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-blue-500" />
                Weekly Civic Activity Trend
              </h3>
              <p className="text-xs text-gray-400">Comparing reported civic complaints vs. municipal resolutions</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                Complaints Received
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                Issues Solved
              </span>
            </div>
          </div>

          {/* CUSTOM HIGH-FIDELITY LINE CHART SVG */}
          <div className="relative bg-[#0D0D0F] rounded-xl p-2 border border-white/10">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingY + ratio * (chartHeight - 2 * paddingY);
                return (
                  <line
                    key={i}
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="0.25"
                    strokeDasharray="1,1"
                  />
                );
              })}

              {/* Gradient defs for shadows */}
              <defs>
                <linearGradient id="gradientReported" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gradientResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Area Under Reported Line */}
              <path d={fillPathReported} fill="url(#gradientReported)" />
              
              {/* Area Under Resolved Line */}
              <path d={fillPathResolved} fill="url(#gradientResolved)" />

              {/* Reported Path Line */}
              <path
                d={pathReported}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="0.85"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Resolved Path Line */}
              <path
                d={pathResolved}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.85"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Coordinate Data Nodes - Reported */}
              {pointsReported.map((p, index) => (
                <g key={`rep-${index}`} className="group cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="1"
                    fill="#f43f5e"
                    stroke="#0D0D0F"
                    strokeWidth="0.25"
                  />
                  <text
                    x={p.x}
                    y={p.y - 1.8}
                    textAnchor="middle"
                    fontSize="1.8"
                    fontWeight="700"
                    fill="#f43f5e"
                  >
                    {p.label}
                  </text>
                  {/* Date labels on bottom axis */}
                  <text
                    x={p.x}
                    y={chartHeight - 3}
                    textAnchor="middle"
                    fontSize="1.8"
                    fontWeight="600"
                    fill="#6b7280"
                  >
                    {p.date}
                  </text>
                </g>
              ))}

              {/* Coordinate Data Nodes - Resolved */}
              {pointsResolved.map((p, index) => (
                <g key={`res-${index}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="1"
                    fill="#3b82f6"
                    stroke="#0D0D0F"
                    strokeWidth="0.25"
                  />
                  <text
                    x={p.x}
                    y={p.y - 1.8}
                    textAnchor="middle"
                    fontSize="1.8"
                    fontWeight="700"
                    fill="#60a5fa"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] text-gray-400 flex items-center gap-2 text-left">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Weekly diagnostics confirm a healthy <strong className="text-white">+{resolutionRate}% backlog clearance factor</strong> across all wards.
          </div>
        </div>

        {/* Category Breakdown (1/3 width) */}
        <div className="bg-[#161618] p-6 rounded-2xl border border-white/10 shadow-xl space-y-5 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <BarChart className="w-4.5 h-4.5 text-blue-500" />
                Category Distribution
              </h3>
              <p className="text-xs text-gray-400">Proportions of logged citizen concerns</p>
            </div>
          </div>

          <div className="space-y-4">
            {categoryKeys.map((cat) => {
              const count = stats.categoryDistribution[cat] || 0;
              const pct = stats.totalIssues > 0 ? Math.round((count / stats.totalIssues) * 100) : 0;
              const theme = getCategoryTheme(cat);

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-300">{cat}</span>
                    <span className="font-bold text-white">
                      {count} {count === 1 ? 'report' : 'reports'}{' '}
                      <span className="text-[10px] font-medium text-gray-400">({pct}%)</span>
                    </span>
                  </div>
                  {/* Styled custom progress bar */}
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCategoryCount) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${theme.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Neighborhood Hotspot breakdown */}
      <div className="bg-[#161618] p-6 rounded-2xl border border-white/10 shadow-xl text-left">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="font-bold text-white text-sm">Neighborhood Problem Concentration</h3>
            <p className="text-xs text-gray-400">Distribution of active repairs across city municipal wards</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(stats.neighborhoodDistribution)
            .sort((a, b) => b[1] - a[1])
            .map(([ward, count], idx) => (
              <div key={ward} className="p-3 bg-white/5 border border-white/10 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
                  Rank #{idx + 1}
                </span>
                <span className="text-sm font-bold text-white block">{ward}</span>
                <span className="text-2xl font-black text-blue-400 block">{count}</span>
                <span className="text-[10px] text-gray-500 font-semibold uppercase">Total Issues</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
