import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, Droplet, Lightbulb, Trash2, HelpCircle, ArrowUp, Calendar, ChevronRight } from 'lucide-react';
import { Issue, IssueCategory, IssueStatus } from '../types';

interface IssueListProps {
  issues: Issue[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: Issue) => void;
}

const CATEGORIES: (IssueCategory | 'All')[] = ['All', 'Pothole', 'Streetlight', 'Water Leakage', 'Trash/Sanitation', 'Traffic Sign', 'Other'];
const STATUSES: (IssueStatus | 'All')[] = ['All', 'Reported', 'Investigating', 'In Progress', 'Resolved'];

export default function IssueList({
  issues,
  selectedIssueId,
  onSelectIssue
}: IssueListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'upvotes' | 'date'>('upvotes');

  // Filter issues
  const filteredIssues = issues
    .filter(issue => {
      const matchSearch = 
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory = selectedCategory === 'All' || issue.category === selectedCategory;
      const matchStatus = selectedStatus === 'All' || issue.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'upvotes') {
        return b.upvotes - a.upvotes;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Get status class
  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'Reported':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Investigating':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'In Progress':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Resolved':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-gray-400 bg-white/5 border-white/5';
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return 'text-rose-400 bg-rose-500/10';
      case 'High':
        return 'text-amber-400 bg-amber-500/10';
      case 'Medium':
        return 'text-blue-400 bg-blue-500/10';
      default:
        return 'text-gray-400 bg-white/5';
    }
  };

  const getCategoryIcon = (category: IssueCategory) => {
    switch (category) {
      case 'Pothole': return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'Streetlight': return <Lightbulb className="w-4 h-4 text-amber-400" />;
      case 'Water Leakage': return <Droplet className="w-4 h-4 text-blue-400" />;
      case 'Trash/Sanitation': return <Trash2 className="w-4 h-4 text-emerald-400" />;
      default: return <HelpCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161618] rounded-2xl border border-white/10 shadow-xl overflow-hidden" id="issues-list-widget">
      
      {/* Search & Filter Header */}
      <div className="p-4 bg-[#0D0D0F] border-b border-white/10 space-y-3">
        {/* Keyword Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search issues, reporter, neighborhood..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-[#161618] rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white placeholder-gray-500"
          />
        </div>

        {/* Filters and sorting Row */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {/* Category Filter Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="text-[10px] font-bold text-gray-300 bg-[#161618] border border-white/10 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="Pothole">Potholes</option>
              <option value="Streetlight">Streetlights</option>
              <option value="Water Leakage">Water Leakages</option>
              <option value="Trash/Sanitation">Trash & Sanitation</option>
              <option value="Traffic Sign">Traffic Signs</option>
              <option value="Other">Others</option>
            </select>

            {/* Status Filter Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="text-[10px] font-bold text-gray-300 bg-[#161618] border border-white/10 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Investigating">Investigating</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Sort Toggles */}
          <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#161618] shrink-0">
            <button
              onClick={() => setSortBy('upvotes')}
              className={`px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 border-r border-white/5 ${
                sortBy === 'upvotes' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <ArrowUp className="w-3 h-3" />
              Upvotes
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 ${
                sortBy === 'date' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3 h-3" />
              Recent
            </button>
          </div>
        </div>
      </div>

      {/* Directory Scrollable Body */}
      <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-white/5">
        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-xs font-semibold">No issues found matching parameters.</p>
            <p className="text-[10px] mt-1">Try adjusting your filters or keyword query.</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isSelected = selectedIssueId === issue.id;
            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className={`p-4 transition-all duration-200 cursor-pointer text-left ${
                  isSelected ? 'bg-blue-600/5 border-l-4 border-l-blue-600' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <span className="p-1.5 bg-white/5 rounded-lg shrink-0 border border-white/10 mt-0.5">
                      {getCategoryIcon(issue.category)}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{issue.title}</h4>
                      <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{issue.description}</p>
                      
                      {/* metadata chips */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider bg-white/5 border border-white/5 px-1.5 py-0.5 rounded">
                          {issue.neighborhood}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded-full ${getStatusBadge(issue.status)}`}>
                          {issue.status}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getSeverityBadge(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Upvote score pill */}
                  <div className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-1 px-2 shrink-0">
                    <span className="text-[10px] font-black text-white">{issue.upvotes}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Votes</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Directory Footer summary */}
      <div className="p-2.5 bg-[#0D0D0F] border-t border-white/10 text-[10px] text-gray-400 font-bold text-center">
        Showing {filteredIssues.length} of {issues.length} Issues Filed
      </div>

    </div>
  );
}
