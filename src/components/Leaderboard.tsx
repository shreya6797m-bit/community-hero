import React from 'react';
import { motion } from 'motion/react';
import { Award, ShieldAlert, Eye, Sprout, Shield, Flame, Hammer, Trophy, HelpCircle } from 'lucide-react';
import { LeaderboardUser } from '../types';

interface LeaderboardProps {
  users: LeaderboardUser[];
}

export default function Leaderboard({ users }: LeaderboardProps) {
  // Map string badge names to nice Lucide icons
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4 text-emerald-400" />;
      case 'Hammer': return <Hammer className="w-4 h-4 text-amber-400" />;
      case 'Award': return <Award className="w-4 h-4 text-blue-400" />;
      case 'Eye': return <Eye className="w-4 h-4 text-sky-400" />;
      case 'Sprout': return <Sprout className="w-4 h-4 text-emerald-400" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  // Nice background color cycles for user initials
  const getAvatarBg = (idx: number) => {
    const bgList = [
      'bg-blue-600 text-white',
      'bg-emerald-600 text-white',
      'bg-amber-600 text-white',
      'bg-rose-600 text-white',
      'bg-sky-500 text-white'
    ];
    return bgList[idx % bgList.length];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="leaderboard-tab">
      
      {/* 1. Leaderboard Table (2/3 width) */}
      <div className="bg-[#161618] rounded-2xl border border-white/10 shadow-xl p-6 lg:col-span-2 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 text-left">
          <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
          <div>
            <h3 className="font-bold text-white text-sm">Community Leaderboard</h3>
            <p className="text-xs text-gray-400">Citizens contributing to making Metropolis a better place</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="py-3 px-2 text-center w-12">Rank</th>
                <th className="py-3 px-4">Citizen</th>
                <th className="py-3 px-4 text-center">Level</th>
                <th className="py-3 px-4 text-center">Logged / Fixed</th>
                <th className="py-3 px-4 text-right">Civic Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {users.map((u, idx) => {
                const rank = idx + 1;
                const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                
                return (
                  <motion.tr
                     key={u.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {/* Rank Indicator */}
                    <td className="py-4 px-2 text-center">
                      {rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 font-extrabold text-xs border border-amber-500/20">
                          🥇
                        </span>
                      ) : rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-500/10 text-gray-300 font-extrabold text-xs border border-white/10">
                          🥈
                        </span>
                      ) : rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 font-extrabold text-xs border border-orange-500/20">
                          🥉
                        </span>
                      ) : (
                        <span className="font-bold text-gray-500 text-xs">#{rank}</span>
                      )}
                    </td>

                    {/* Avatar & Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs tracking-wider shrink-0 ${getAvatarBg(idx)}`}>
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {u.name}
                            {rank === 1 && <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />}
                          </div>
                          
                          {/* Badge Tag */}
                          <div className="inline-flex items-center gap-1 mt-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-[9px] font-bold text-gray-300">
                            {getBadgeIcon(u.badgeIcon)}
                            {u.badge}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                        Lvl {u.level}
                      </span>
                    </td>

                    {/* Reports and resolved count */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-white">{u.reportsCount} <span className="text-[10px] text-gray-500 font-medium">filed</span></span>
                        <span className="text-[10px] font-bold text-emerald-400">{u.resolvedCount} resolved</span>
                      </div>
                    </td>

                    {/* Points score */}
                    <td className="py-4 px-4 text-right font-black text-white">
                      {u.points} pts
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Rule Explainer (1/3 width) */}
      <div className="bg-[#161618] rounded-2xl border border-white/10 shadow-xl p-6 space-y-5 text-left">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <HelpCircle className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-white text-sm font-sans tracking-tight">Civic Leveling System</h3>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          The Community score system rewards citizens for being active eyes and ears on the street. Accumulating points unlocks higher levels and premium municipal badges!
        </p>

        <div className="space-y-4 pt-2">
          {/* Rule Item 1 */}
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
              +20
            </span>
            <div>
              <h4 className="text-xs font-bold text-white">File a Report</h4>
              <p className="text-[11px] text-gray-400">Earn points for cataloging any pothole, broken streetlight or leakage.</p>
            </div>
          </div>

          {/* Rule Item 2 */}
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
              +5
            </span>
            <div>
              <h4 className="text-xs font-bold text-white">Community Endorsement</h4>
              <p className="text-[11px] text-gray-400">Get points when neighbors upvote your ticket as high priority or accurate.</p>
            </div>
          </div>

          {/* Rule Item 3 */}
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
              +50
            </span>
            <div>
              <h4 className="text-xs font-bold text-white">Resolution Bonus</h4>
              <p className="text-[11px] text-gray-400">Awarded automatically once public crews mark your reported problem as resolved.</p>
            </div>
          </div>
        </div>

        {/* Level thresholds card */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2.5">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Badge Progression</span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-gray-300">
              <span className="font-semibold flex items-center gap-1"><Sprout className="w-3.5 h-3.5 text-emerald-400" /> Lvl 1 - Civic Novice</span>
              <span>Entry level</span>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span className="font-semibold flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-sky-400" /> Lvl 2 - Watchman</span>
              <span>2+ resolutions</span>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span className="font-semibold flex items-center gap-1"><Award className="w-3.5 h-3.5 text-blue-400" /> Lvl 3 - Champion</span>
              <span>5+ resolutions</span>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span className="font-semibold flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Lvl 5 - Civic Guardian</span>
              <span>10+ resolutions</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
