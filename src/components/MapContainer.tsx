import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Info, Compass, Shield, Droplet, Lightbulb, AlertTriangle, Trash2, ArrowBigUp } from 'lucide-react';
import { Issue, IssueCategory } from '../types';

interface MapContainerProps {
  issues: Issue[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: Issue) => void;
  onMapClick?: (x: number, y: number, neighborhood: string) => void;
  placedPin: { x: number; y: number; neighborhood: string } | null;
}

const NEIGHBORHOODS = [
  { name: 'Greenwood', x: 75, y: 25, color: 'rgba(34, 197, 94, 0.08)', stroke: '#22c55e', text: 'Greenwood Residential' },
  { name: 'Riverside', x: 20, y: 55, color: 'rgba(14, 165, 233, 0.08)', stroke: '#0ea5e9', text: 'Riverside Industrial' },
  { name: 'Downtown', x: 50, y: 45, color: 'rgba(99, 102, 241, 0.08)', stroke: '#6366f1', text: 'Downtown Commercial Hub' },
  { name: 'Westside', x: 80, y: 70, color: 'rgba(245, 158, 11, 0.08)', stroke: '#f59e0b', text: 'Westside Suburbs' },
  { name: 'Oak Heights', x: 40, y: 15, color: 'rgba(16, 185, 129, 0.08)', stroke: '#10b981', text: 'Oak Heights Hills' }
];

export default function MapContainer({
  issues,
  selectedIssueId,
  onSelectIssue,
  onMapClick,
  placedPin
}: MapContainerProps) {
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<string | null>(null);

  // Determine neighborhood based on X/Y coordinates
  const getNeighborhoodName = (x: number, y: number): string => {
    let closest = NEIGHBORHOODS[0];
    let minDistance = Infinity;
    NEIGHBORHOODS.forEach(n => {
      const dist = Math.sqrt(Math.pow(n.x - x, 2) + Math.pow(n.y - y, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closest = n;
      }
    });
    return closest.name;
  };

  const handleContainerClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onMapClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert to 0-100 percentage coordinates
    const pctX = Math.round((clickX / rect.width) * 100);
    const pctY = Math.round((clickY / rect.height) * 100);
    
    const neighborhood = getNeighborhoodName(pctX, pctY);
    onMapClick(pctX, pctY, neighborhood);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reported': return 'bg-rose-500 border-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
      case 'Investigating': return 'bg-amber-500 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      case 'In Progress': return 'bg-blue-500 border-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
      case 'Resolved': return 'bg-emerald-500 border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      default: return 'bg-gray-500 border-gray-300 shadow-gray-500/50';
    }
  };

  const getCategoryIcon = (category: IssueCategory) => {
    switch (category) {
      case 'Pothole': return <AlertTriangle className="w-3 h-3 text-white" />;
      case 'Streetlight': return <Lightbulb className="w-3 h-3 text-white" />;
      case 'Water Leakage': return <Droplet className="w-3 h-3 text-white" />;
      case 'Trash/Sanitation': return <Trash2 className="w-3 h-3 text-white" />;
      default: return <MapPin className="w-3 h-3 text-white" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161618] rounded-2xl border border-white/10 shadow-xl overflow-hidden" id="map-widget">
      {/* Map Header */}
      <div className="p-4 bg-[#0D0D0F] border-b border-white/10 flex items-center justify-between">
        <div className="text-left">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-500 animate-spin-slow" />
            Live Civic District Map
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Select a pin to inspect, or click on empty ground to place a new report marker.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-gray-300 bg-[#161618] p-2 rounded-lg border border-white/10">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span>Reported</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span>Investigating</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block"></span>In Progress</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>Resolved</span>
        </div>
      </div>

      {/* Map Vector Stage */}
      <div className="relative flex-1 bg-[#0F0F11] min-h-[400px] overflow-hidden select-none">
        <svg
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onClick={handleContainerClick}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Map Grid Patterns */}
          <defs>
            <pattern id="mapGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#mapGrid)" />

          {/* Styled Neighborhood Boundaries */}
          {NEIGHBORHOODS.map((n) => (
            <g key={n.name}>
              <circle
                cx={n.x}
                cy={n.y}
                r="18"
                fill={hoveredNeighborhood === n.name ? 'rgba(59, 130, 246, 0.05)' : n.color.replace('0.08', '0.04')}
                stroke={hoveredNeighborhood === n.name ? '#3b82f6' : n.stroke}
                strokeWidth="0.5"
                strokeDasharray="1,1"
                className="transition-all duration-300"
                onMouseEnter={() => setHoveredNeighborhood(n.name)}
                onMouseLeave={() => setHoveredNeighborhood(null)}
              />
              <text
                x={n.x}
                y={n.y + 2}
                textAnchor="middle"
                fontSize="2.5"
                fontWeight="600"
                fill="#94a3b8"
                opacity="0.3"
                className="pointer-events-none select-none"
              >
                {n.name.toUpperCase()}
              </text>
            </g>
          ))}

          {/* River Vector (Curves across the city) */}
          <path
            d="M -10,30 Q 30,35 45,60 T 110,85"
            fill="none"
            stroke="rgba(14, 165, 233, 0.15)"
            strokeWidth="5"
            strokeLinecap="round"
            className="pointer-events-none"
          />
          <path
            d="M -10,30 Q 30,35 45,60 T 110,85"
            fill="none"
            stroke="rgba(14, 165, 233, 0.08)"
            strokeWidth="7"
            strokeLinecap="round"
            className="pointer-events-none"
          />

          {/* Main Highway Loop */}
          <path
            d="M 10,-10 C 20,40 80,10 90,110"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="4,2"
            className="pointer-events-none"
          />
          <path
            d="M -10,75 L 110,75"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="pointer-events-none"
          />
        </svg>

        {/* Placing Active Marker (User-selected location) */}
        {placedPin && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
            style={{ left: `${placedPin.x}%`, top: `${placedPin.y}%` }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex flex-col items-center"
            >
              <div className="w-5 h-5 rounded-full bg-blue-600/30 flex items-center justify-center relative">
                <div className="w-3 h-3 rounded-full bg-blue-600 shadow-md shadow-blue-500/50"></div>
                <div className="absolute inset-0 border border-blue-600 rounded-full animate-ping opacity-70"></div>
              </div>
              <span className="bg-[#161618]/95 border border-white/10 text-[9px] font-bold text-white px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">
                New Report Location
              </span>
            </motion.div>
          </div>
        )}

        {/* Existing Issue Pins */}
        {issues.map((issue) => {
          const isSelected = selectedIssueId === issue.id;
          return (
            <div
              key={issue.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: `${issue.x}%`, top: `${issue.y}%` }}
            >
              <motion.button
                whileHover={{ scale: 1.25, zIndex: 30 }}
                animate={isSelected ? { scale: [1, 1.15, 1], zIndex: 25 } : {}}
                transition={isSelected ? { repeat: Infinity, duration: 1.8 } : {}}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectIssue(issue);
                }}
                className={`p-1 rounded-full border-2 cursor-pointer shadow-lg transition-colors flex items-center justify-center ${
                  isSelected ? 'scale-125 ring-4 ring-blue-500/30 ring-offset-1 ring-offset-[#0F0F11]' : ''
                } ${getStatusColor(issue.status)}`}
                style={{ width: '28px', height: '28px' }}
                title={`${issue.title} (${issue.status})`}
              >
                {getCategoryIcon(issue.category)}
              </motion.button>

              {/* Tooltip for High/Critical Urgency issues when selected or hovered */}
              {isSelected && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#161618] rounded-lg border border-white/15 shadow-2xl p-2 z-40 min-w-[150px] pointer-events-none text-left">
                  <div className="text-[10px] font-bold text-white line-clamp-1">{issue.title}</div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-[8px] font-medium text-gray-300 bg-white/5 px-1.5 py-0.5 rounded">
                      {issue.category}
                    </span>
                    <span className={`text-[8px] font-bold px-1 rounded ${
                      issue.severity === 'Critical' ? 'text-rose-400 bg-rose-500/10' :
                      issue.severity === 'High' ? 'text-amber-400 bg-amber-500/10' :
                      issue.severity === 'Medium' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 bg-white/5'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Map Footer Helper */}
      <div className="p-3 bg-[#0D0D0F] border-t border-white/10 text-gray-400 text-[10px] flex items-center justify-between">
        <span className="flex items-center gap-1 text-gray-300">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          Active Neighborhood: <strong className="text-white">{hoveredNeighborhood || 'All Districts'}</strong>
        </span>
        <span className="text-gray-500 font-medium">Verdant Heights GIS Map</span>
      </div>
    </div>
  );
}
