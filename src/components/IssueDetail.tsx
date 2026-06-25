import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowBigUpDash, MapPin, Calendar, Clock, AlertCircle, CheckSquare, Sparkles, Building, User, Mail, PlusCircle, Activity, ClipboardList, ShieldAlert, BadgeHelp } from 'lucide-react';
import { Issue, IssueStatus } from '../types';

interface IssueDetailProps {
  issue: Issue | null;
  onUpvote: (issueId: string) => void;
  onStatusUpdate: (issueId: string, status: IssueStatus, comment: string) => void;
}

export default function IssueDetail({
  issue,
  onUpvote,
  onStatusUpdate
}: IssueDetailProps) {
  const [adminStatus, setAdminStatus] = useState<IssueStatus>('Investigating');
  const [adminComment, setAdminComment] = useState('');
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [upvoteError, setUpvoteError] = useState<string | null>(null);

  if (!issue) {
    return (
      <div className="bg-[#161618] rounded-2xl border border-white/10 shadow-xl p-8 text-center flex flex-col items-center justify-center min-h-[500px]" id="issue-detail-empty">
        <div className="p-4 bg-white/5 text-gray-400 rounded-full mb-4 border border-white/10">
          <BadgeHelp className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-sm font-bold text-white">No Report Selected</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-[240px] mx-auto">
          Choose a marker pin on the map or select an item from the issue directory to explore detailed diagnostics.
        </p>
      </div>
    );
  }

  const handleUpvoteClick = async () => {
    setUpvoteError(null);
    try {
      // Create or get local unique browser signature
      let browserSig = localStorage.getItem('civic_user_sig');
      if (!browserSig) {
        browserSig = `browser-${Date.now()}`;
        localStorage.setItem('civic_user_sig', browserSig);
      }

      const response = await fetch(`/api/issues/${issue.id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: browserSig })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'You already voted on this issue');
      }

      onUpvote(issue.id);

    } catch (err: any) {
      setUpvoteError(err.message);
      setTimeout(() => setUpvoteError(null), 3000);
    }
  };

  const handleAdminUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminComment.trim()) return;

    setIsAdminSubmitting(true);
    try {
      const response = await fetch(`/api/issues/${issue.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: adminStatus, comment: adminComment })
      });

      if (!response.ok) {
        throw new Error('Failed to submit administrative update');
      }

      onStatusUpdate(issue.id, adminStatus, adminComment);
      setAdminComment('');

    } catch (err) {
      console.error(err);
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  // Timeline helper configurations
  const timelineStages: { status: IssueStatus; label: string; desc: string }[] = [
    { status: 'Reported', label: 'Report Lodged', desc: 'Citizen submitted ticket verified by community platform.' },
    { status: 'Investigating', label: 'Under Assessment', desc: 'Municipal engineers dispatched to inspect damage site.' },
    { status: 'In Progress', label: 'Active Repairs', desc: 'Maintenance crews actively deployed with equipment.' },
    { status: 'Resolved', label: 'Work Resolved', desc: 'Issue closed. Restoration signed-off by inspectors.' }
  ];

  // Check if a stage is completed based on timeline history
  const isStageActive = (status: IssueStatus) => issue.status === status;
  const isStagePassed = (status: IssueStatus) => {
    const currentIdx = timelineStages.findIndex(s => s.status === issue.status);
    const stageIdx = timelineStages.findIndex(s => s.status === status);
    return stageIdx <= currentIdx;
  };

  return (
    <div className="bg-[#161618] rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col h-full" id="issue-detail-widget">
      
      {/* Title & Category Header block */}
      <div className="p-6 border-b border-white/10 space-y-4 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Category Chip */}
          <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 px-3 py-1 rounded-md border border-blue-500/20">
            {issue.category}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
              issue.severity === 'Critical' ? 'bg-rose-500/10 text-rose-400 animate-pulse border border-rose-500/20' :
              issue.severity === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              issue.severity === 'Medium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-gray-300 border border-white/5'
            }`}>
              {issue.severity} Severity
            </span>
            <span className="text-gray-400 text-xs font-semibold uppercase">ID: {issue.id}</span>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-white leading-tight">
            {issue.title}
          </h2>
          <div className="flex flex-wrap gap-4 text-[10px] font-semibold text-gray-400 mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              {issue.neighborhood} Ward
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Filed: {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed bg-[#0D0D0F] p-4 rounded-xl border border-white/5">
          {issue.description}
        </p>

        {/* Upvote score button */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="text-gray-400 text-xs font-semibold flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Community validation: <strong className="text-white">{issue.upvotes} citizens endorsed</strong></span>
          </div>

          <div className="relative">
            <button
              onClick={handleUpvoteClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-900/20 cursor-pointer"
            >
              <ArrowBigUpDash className="w-4 h-4" />
              Upvote Issue
            </button>
            <AnimatePresence>
              {upvoteError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 bottom-8 bg-rose-600 text-white text-[10px] py-1 px-2.5 rounded shadow-lg whitespace-nowrap z-50 font-bold"
                >
                  {upvoteError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Details Body Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-h-[600px] text-left">
        
        {/* SECTION 1: Status Tracking Timeline */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            Live Status Tracker Timeline
          </h3>

          <div className="relative pl-6 border-l border-white/10 space-y-6">
            {timelineStages.map((stage) => {
              const active = isStageActive(stage.status);
              const passed = isStagePassed(stage.status);
              const matchingEvents = issue.statusTimeline.filter(e => e.status === stage.status);

              return (
                <div key={stage.status} className="relative">
                  {/* Timeline node node marker */}
                  <span className={`absolute -left-[30px] top-0 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${
                    active ? 'bg-blue-600 border-blue-400 ring-4 ring-blue-500/20' :
                    passed ? 'bg-emerald-500 border-emerald-400' : 'bg-[#161618] border-white/10'
                  }`}>
                    {active ? (
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                    ) : passed ? (
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    ) : null}
                  </span>

                  <div>
                    <h4 className={`text-xs font-bold ${active ? 'text-blue-400' : passed ? 'text-gray-200' : 'text-gray-500'}`}>
                      {stage.label}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{stage.desc}</p>
                    
                    {/* Events detailed comments */}
                    {matchingEvents.length > 0 && (
                      <div className="mt-2 p-2.5 bg-[#0D0D0F] border border-white/5 rounded-lg space-y-1">
                        {matchingEvents.map((ev, i) => (
                          <div key={i} className="text-[10px] text-gray-300">
                            <span className="font-bold text-gray-500 block mb-0.5">
                              {new Date(ev.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} • {new Date(ev.updatedAt).toLocaleDateString()}
                            </span>
                            "{ev.comment}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: AI Diagnosis & Action Plan Checklists */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-blue-500" />
            AI Diagnostics & Municipal Plan
          </h3>

          {issue.aiAnalysis ? (
            <div className="bg-blue-950/10 border border-blue-500/20 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                  Gemini Automated Diagnostics
                </span>
                <span className="text-[9px] font-black bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                  Reliability: {Math.round(issue.aiAnalysis.confidence * 100)}%
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Suggested Department</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-gray-400" />
                  {issue.suggestedDepartment}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Categorizer Rationale</span>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "{issue.aiAnalysis.explanation}"
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/5">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Technical Workorder Checklists
                </span>
                <div className="space-y-2 text-left">
                  {issue.aiAnalysis.actionPlan.map((step, idx) => (
                    <label key={idx} className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-300 hover:text-white group">
                      <input
                        type="checkbox"
                        defaultChecked={issue.status === 'Resolved' || (issue.status === 'In Progress' && idx === 0)}
                        className="mt-0.5 w-3.5 h-3.5 text-blue-600 bg-[#0F0F11] border-white/10 rounded focus:ring-blue-500 focus:ring-opacity-20"
                      />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">{step}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center text-xs text-gray-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-500 shrink-0" />
              <span>No advanced AI diagnostics compiled for this ticket. Submit a report using AI Magic to generate technical checklists.</span>
            </div>
          )}
        </div>

        {/* SECTION 3: Citizens Submitter & Assigned parameters */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs text-gray-300">
          <div>
            <span className="font-bold text-gray-500 block uppercase text-[10px] tracking-wider mb-1">Reporter</span>
            <span className="font-bold text-white flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              {issue.reporterName}
            </span>
          </div>
          <div>
            <span className="font-bold text-gray-500 block uppercase text-[10px] tracking-wider mb-1">Contact Email</span>
            <span className="font-bold text-white flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {issue.reporterEmail}
            </span>
          </div>
        </div>

        {/* SECTION 4: Simulated Administrator Work updates (Tactile testing) */}
        <div className="p-4 bg-[#0D0D0F] text-gray-100 rounded-2xl space-y-4 shadow-xl border border-white/10">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
            <Building className="w-4 h-4 text-blue-400" />
            <div>
              <h4 className="text-xs font-bold text-white">Simulate Municipal Control Actions</h4>
              <p className="text-[10px] text-gray-400">Advance status or logs to test real-time citizen-reporting flows.</p>
            </div>
          </div>

          <form onSubmit={handleAdminUpdateSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-left">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Set Stage Status</label>
                <select
                  value={adminStatus}
                  onChange={(e) => setAdminStatus(e.target.value as IssueStatus)}
                  className="w-full text-xs bg-[#161618] text-white border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Investigating">Investigating</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isAdminSubmitting || !adminComment.trim()}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:bg-white/5 disabled:text-gray-600 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {isAdminSubmitting ? 'Posting...' : 'Push Log Update'}
                </button>
              </div>
            </div>

            <div className="text-left">
              <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Administrative Log / Maintenance Comment</label>
              <input
                type="text"
                required
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="e.g. 'Road crew arrived. Filled pothole with hot mix.'"
                className="w-full text-xs bg-[#161618] text-white border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-600"
              />
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
