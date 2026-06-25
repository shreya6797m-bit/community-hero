import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, FolderClosed, BarChart3, Trophy, PlusCircle, Sparkles, RefreshCw, Radio, CheckCircle2, ShieldAlert, Hammer, MapPin } from 'lucide-react';

import { Issue, LeaderboardUser, SystemStats, IssueStatus } from './types';
import MapContainer from './components/MapContainer';
import IssueList from './components/IssueList';
import IssueDetail from './components/IssueDetail';
import ReportIssueForm from './components/ReportIssueForm';
import StatsDashboard from './components/StatsDashboard';
import Leaderboard from './components/Leaderboard';

type AppTab = 'map' | 'directory' | 'dashboard' | 'leaderboard' | 'report';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('map');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  
  // App state
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [placedPin, setPlacedPin] = useState<{ x: number; y: number; neighborhood: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Rotating municipal announcements
  const tickerMessages = [
    '🔔 Greenwood Roadwork: Asphalt patch crew dispatched near Oakwood Freeway Loop.',
    '💧 Riverside Water Line: Main valve isolated. Water Authority replaces main conduit.',
    '⚡ Westside Streetlamps: Electrical Division replaced 14 bulbs today.',
    '🌟 Civic Impact: Community has logged 70+ resolved repairs this month.',
    '🏆 Leaderboard Status: Top reporter Shreya Mohanty awarded the Golden Shield badge.'
  ];

  const fetchAllData = async () => {
    try {
      const [issuesRes, leaderboardRes, statsRes] = await Promise.all([
        fetch('/api/issues'),
        fetch('/api/leaderboard'),
        fetch('/api/stats')
      ]);

      if (!issuesRes.ok || !leaderboardRes.ok || !statsRes.ok) {
        throw new Error('API request failed');
      }

      const issuesData = await issuesRes.json();
      const leaderboardData = await leaderboardRes.json();
      const statsData = await statsRes.json();

      setIssues(issuesData);
      setLeaderboard(leaderboardData);
      setStats(statsData);

      // Keep selectedIssue synced with updated data
      if (selectedIssue) {
        const updated = issuesData.find((i: Issue) => i.id === selectedIssue.id);
        if (updated) setSelectedIssue(updated);
      } else if (issuesData.length > 0 && !selectedIssue) {
        // Default to first active issue
        setSelectedIssue(issuesData[0]);
      }

    } catch (err) {
      console.error('Error loading full-stack data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
    
    // Auto cycle bulletin ticker every 6 seconds
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerMessages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Handle map click
  const handleMapClick = (x: number, y: number, neighborhood: string) => {
    setPlacedPin({ x, y, neighborhood });
  };

  // Clear map pin
  const handleClearPin = () => {
    setPlacedPin(null);
  };

  // Upvote success re-fetch
  const handleUpvoteSuccess = (issueId: string) => {
    fetchAllData();
  };

  // Status changed success re-fetch
  const handleStatusUpdateSuccess = (issueId: string, status: IssueStatus, comment: string) => {
    fetchAllData();
  };

  // Report submission success callback
  const handleReportSuccess = () => {
    fetchAllData();
    // Switch back to district map tab
    setCurrentTab('map');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col font-sans text-gray-200">
      
      {/* 1. Header & Live Bulletin Ticker */}
      <header className="bg-[#0D0D0F] border-b border-white/10 sticky top-0 z-50">
        {/* Main Header bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base text-white tracking-tight">MetroCivic</h1>
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black tracking-widest px-1.5 py-0.5 border border-emerald-500/20 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  LIVE PLATFORM
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Verdant Heights Citizen Reporting Platform
              </p>
            </div>
          </div>

          {/* Bulletin Marquee Ticker */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 bg-[#161618] border border-white/5 rounded-lg py-1.5 px-3 overflow-hidden items-center gap-2 text-xs">
            <Radio className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
            <div className="font-medium text-gray-300 truncate">
              <AnimatePresence mode="wait">
                <motion.span
                  key={tickerIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="block"
                >
                  {tickerMessages[tickerIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Refresh Status */}
          <button
            onClick={() => {
              setIsLoading(true);
              fetchAllData();
            }}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 active:scale-95 transition-all flex items-center gap-1 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            Refresh
          </button>
        </div>

        {/* 2. Platform Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
          <nav className="flex space-x-1 py-2 overflow-x-auto select-none">
            {/* Tab: Map */}
            <button
              onClick={() => setCurrentTab('map')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                currentTab === 'map'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4.5 h-4.5" />
              District Map
            </button>

            {/* Tab: Directory */}
            <button
              onClick={() => setCurrentTab('directory')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                currentTab === 'directory'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderClosed className="w-4.5 h-4.5" />
              Issue Directory
            </button>

            {/* Tab: Dashboard */}
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5" />
              Impact Dashboard
            </button>

            {/* Tab: Leaderboard */}
            <button
              onClick={() => setCurrentTab('leaderboard')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                currentTab === 'leaderboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="w-4.5 h-4.5" />
              Reporters Leaderboard
            </button>

            <div className="flex-1"></div>

            {/* Tab: File Report Button */}
            <button
              onClick={() => setCurrentTab('report')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                currentTab === 'report'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              <PlusCircle className="w-4.5 h-4.5" />
              File a Report
              {placedPin && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* 3. Main Stage Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {isLoading && issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0D0D0F] rounded-3xl border border-white/10 min-h-[500px] shadow-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="p-3 bg-blue-950/40 text-blue-400 rounded-full mb-4 border border-blue-500/30"
            >
              <RefreshCw className="w-6 h-6" />
            </motion.div>
            <h3 className="font-bold text-white text-sm">Syncing with Municipal DB...</h3>
            <p className="text-xs text-gray-400 mt-1">Please wait while we initialize local services and seed databases.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* TAB: DISTRICT MAP (Split Pane Map & Selected Issue details) */}
            {currentTab === 'map' && (
              <motion.div
                key="map-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <div className="lg:col-span-2 h-[550px] lg:h-[650px]">
                  <MapContainer
                    issues={issues}
                    selectedIssueId={selectedIssue ? selectedIssue.id : null}
                    onSelectIssue={(issue) => setSelectedIssue(issue)}
                    onMapClick={handleMapClick}
                    placedPin={placedPin}
                  />
                </div>
                
                <div className="h-[550px] lg:h-[650px] flex flex-col">
                  {placedPin ? (
                    <div className="bg-[#161618] text-white rounded-2xl p-6 flex flex-col justify-between h-full border border-white/10 shadow-xl">
                      <div className="space-y-4 text-left">
                        <div className="w-10 h-10 rounded-xl bg-blue-950/40 flex items-center justify-center border border-blue-500/30">
                          <MapPin className="w-5 h-5 text-blue-400 animate-bounce" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-white">Report Marker Placed!</h3>
                          <p className="text-xs text-gray-400 mt-1">
                            Coordinates: <strong className="text-white">{placedPin.x}%, {placedPin.y}%</strong> in the <strong className="text-white">{placedPin.neighborhood}</strong> district.
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          We have locked in the spatial location. Click the button below to fill out the complaint form for this exact spot.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={() => setCurrentTab('report')}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                        >
                          Proceed to File Report Here
                        </button>
                        <button
                          onClick={handleClearPin}
                          className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-[10px] uppercase tracking-wider rounded-xl border border-white/5 transition-all"
                        >
                          Discard Marker Pin
                        </button>
                      </div>
                    </div>
                  ) : (
                    <IssueDetail
                      issue={selectedIssue}
                      onUpvote={handleUpvoteSuccess}
                      onStatusUpdate={handleStatusUpdateSuccess}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: DIRECTORY (Split Pane List & Selected Issue details) */}
            {currentTab === 'directory' && (
              <motion.div
                key="directory-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <div className="lg:col-span-1 h-[650px] flex flex-col">
                  <IssueList
                    issues={issues}
                    selectedIssueId={selectedIssue ? selectedIssue.id : null}
                    onSelectIssue={(issue) => setSelectedIssue(issue)}
                  />
                </div>
                
                <div className="lg:col-span-2 h-[650px] flex flex-col">
                  <IssueDetail
                    issue={selectedIssue}
                    onUpvote={handleUpvoteSuccess}
                    onStatusUpdate={handleStatusUpdateSuccess}
                  />
                </div>
              </motion.div>
            )}

            {/* TAB: IMPACT DASHBOARD */}
            {currentTab === 'dashboard' && (
              <motion.div
                key="dashboard-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <StatsDashboard
                  stats={stats}
                  onRefresh={fetchAllData}
                />
              </motion.div>
            )}

            {/* TAB: CONTRIBUTORS LEADERBOARD */}
            {currentTab === 'leaderboard' && (
              <motion.div
                key="leaderboard-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Leaderboard users={leaderboard} />
              </motion.div>
            )}

            {/* TAB: FILE A REPORT */}
            {currentTab === 'report' && (
              <motion.div
                key="report-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <ReportIssueForm
                  placedPin={placedPin}
                  onClearPin={handleClearPin}
                  onSubmitSuccess={handleReportSuccess}
                />
              </motion.div>
            )}

          </AnimatePresence>
        )}

      </main>

      {/* 4. Municipal Footer */}
      <footer className="bg-[#0D0D0F] border-t border-white/10 py-6 mt-12 text-gray-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 font-extrabold text-[10px]">VERDANT</span>
            <span>© 2026 Metropolitan District Services. All Rights Reserved.</span>
          </div>
          <div className="flex gap-4 font-semibold text-gray-400">
            <a href="#map" onClick={(e) => (e.preventDefault(), setCurrentTab('map'))} className="hover:text-blue-400 transition-colors">District Map</a>
            <a href="#directory" onClick={(e) => (e.preventDefault(), setCurrentTab('directory'))} className="hover:text-blue-400 transition-colors">Issues Directory</a>
            <a href="#dashboard" onClick={(e) => (e.preventDefault(), setCurrentTab('dashboard'))} className="hover:text-blue-400 transition-colors">Impact stats</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
