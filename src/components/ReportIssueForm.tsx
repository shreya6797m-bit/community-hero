import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MapPin, Send, User, Mail, Plus, X, AlertCircle, RefreshCw } from 'lucide-react';
import { IssueCategory, SeverityLevel } from '../types';

interface ReportIssueFormProps {
  placedPin: { x: number; y: number; neighborhood: string } | null;
  onClearPin: () => void;
  onSubmitSuccess: () => void;
}

const CATEGORIES: IssueCategory[] = ['Pothole', 'Streetlight', 'Water Leakage', 'Trash/Sanitation', 'Traffic Sign', 'Other'];
const SEVERITIES: SeverityLevel[] = ['Low', 'Medium', 'High', 'Critical'];
const NEIGHBORHOODS = ['Greenwood', 'Riverside', 'Downtown', 'Westside', 'Oak Heights'];

export default function ReportIssueForm({
  placedPin,
  onClearPin,
  onSubmitSuccess
}: ReportIssueFormProps) {
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Other');
  const [severity, setSeverity] = useState<SeverityLevel>('Medium');
  const [neighborhood, setNeighborhood] = useState('Downtown');
  const [suggestedDepartment, setSuggestedDepartment] = useState('General Municipal Support');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Reporter states (persisted locally)
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');

  // UI/AI states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load reporter name and email from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('reporter_name');
    const savedEmail = localStorage.getItem('reporter_email');
    if (savedName) setReporterName(savedName);
    if (savedEmail) setReporterEmail(savedEmail);
  }, []);

  // Update neighborhood when user clicks the map to place a pin
  useEffect(() => {
    if (placedPin) {
      setNeighborhood(placedPin.neighborhood);
    }
  }, [placedPin]);

  // Request AI categorization from Express server
  const handleAiCategorize = async () => {
    if (!description || description.trim().length < 10) {
      setFormError('Please enter at least 10 characters in the description before calling AI.');
      return;
    }

    setFormError(null);
    setIsAiLoading(true);
    setAiAnalysis(null);

    try {
      const response = await fetch('/api/issues/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      const data = await response.json();

      // Auto fill form with AI insights
      setCategory(data.category);
      setSeverity(data.severity);
      setSuggestedDepartment(data.suggestedDepartment);
      setTags(data.tags || []);
      
      setAiAnalysis({
        confidence: data.confidence,
        explanation: data.explanation,
        actionPlan: data.actionPlan,
        isOffline: data.isOffline
      });

      // Suggest title if title is empty
      if (!title || title.trim() === '') {
        const words = description.split(' ').slice(0, 5).join(' ');
        setTitle(`AI Suggestion: ${data.category} - ${words}...`);
      }

    } catch (err) {
      console.error(err);
      setFormError('Failed to perform AI analysis. Using default parameters.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tToRemove: string) => {
    setTags(tags.filter(t => t !== tToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title || !description || !reporterName || !reporterEmail) {
      setFormError('Please complete all required fields (*).');
      return;
    }

    setIsSubmitting(true);

    // Save reporter details to localStorage for convenience next time
    localStorage.setItem('reporter_name', reporterName);
    localStorage.setItem('reporter_email', reporterEmail);

    const issuePayload = {
      title,
      description,
      category,
      severity,
      reporterName,
      reporterEmail,
      neighborhood,
      suggestedDepartment,
      tags,
      x: placedPin ? placedPin.x : Math.floor(Math.random() * 60) + 20,
      y: placedPin ? placedPin.y : Math.floor(Math.random() * 60) + 20,
      aiAnalysis: aiAnalysis ? {
        confidence: aiAnalysis.confidence,
        explanation: aiAnalysis.explanation,
        actionPlan: aiAnalysis.actionPlan
      } : undefined
    };

    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issuePayload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      // Reset Form
      setTitle('');
      setDescription('');
      setCategory('Other');
      setSeverity('Medium');
      setTags([]);
      setAiAnalysis(null);
      onClearPin();
      onSubmitSuccess();

    } catch (err) {
      console.error(err);
      setFormError('Submission failed. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#161618] rounded-2xl border border-white/10 shadow-xl p-6" id="report-form-widget">
      <div className="border-b border-white/10 pb-4 mb-6 text-left">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" />
          File a New Civic Report
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Tell us about a municipal hazard or repair need in your area. AI will automatically analyze your description to speed up dispatch!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* 1. Description Textarea + AI magic trigger */}
        <div className="text-left">
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            What is the issue? <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 'A huge pothole has formed in the left lane of Oakwood Ave near the highway ramp. Cars are swerving to avoid it.'"
              className="w-full text-sm p-4 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white placeholder-gray-600 bg-[#0D0D0F]"
            />
            
            <button
              type="button"
              onClick={handleAiCategorize}
              disabled={isAiLoading || !description.trim()}
              className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all duration-300 cursor-pointer ${
                isAiLoading 
                  ? 'bg-blue-950/40 border border-blue-500/20 text-blue-400/50 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/20 active:scale-95'
              }`}
            >
              {isAiLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  AI Classifying...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Fill with AI
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-1.5">
            Tip: Be descriptive. AI uses description keywords to set categories and prioritize response times.
          </p>
        </div>

        {/* AI Analysis Reveal Banner */}
        <AnimatePresence>
          {aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-blue-950/10 border border-blue-500/20 rounded-xl space-y-3 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Gemini AI Assessment
                </span>
                <span className="text-[10px] font-semibold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
                  {aiAnalysis.isOffline ? 'Offline Parser' : `Neural Confidence: ${Math.round(aiAnalysis.confidence * 100)}%`}
                </span>
              </div>
              <p className="text-xs text-gray-300 italic">
                "{aiAnalysis.explanation}"
              </p>
              {aiAnalysis.actionPlan && aiAnalysis.actionPlan.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                    System Response Plan
                  </span>
                  <ol className="list-decimal list-inside text-xs text-gray-400 space-y-0.5">
                    {aiAnalysis.actionPlan.map((step: string, idx: number) => (
                      <li key={idx} className="line-clamp-1">{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Core Metadata block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Title / Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give a short, punchy title"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white bg-[#0D0D0F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Neighborhood / Ward <span className="text-rose-500">*</span>
            </label>
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white bg-[#0D0D0F]"
            >
              {NEIGHBORHOODS.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white bg-[#0D0D0F]"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Priority Urgency
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white bg-[#0D0D0F]"
            >
              {SEVERITIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Placed Pin Status indicator */}
        <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
          <span className="text-xs text-gray-300 flex items-center gap-2 text-left">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
            {placedPin ? (
              <span>
                Coordinates locked at: <strong className="text-white">{placedPin.x}%, {placedPin.y}%</strong> in {placedPin.neighborhood}
              </span>
            ) : (
              <span className="text-gray-500">
                No custom pin clicked. Submitting will auto-generate safe random coordinates.
              </span>
            )}
          </span>
          {placedPin && (
            <button
              type="button"
              onClick={onClearPin}
              className="text-xs text-gray-400 hover:text-rose-400 flex items-center gap-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset Pin
            </button>
          )}
        </div>

        {/* 4. Tags and Dispatch parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Assigned Department
            </label>
            <input
              type="text"
              value={suggestedDepartment}
              onChange={(e) => setSuggestedDepartment(e.target.value)}
              placeholder="e.g. Municipal Public Works"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white bg-[#0D0D0F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Keywords / Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Press enter to add tag"
                className="flex-1 text-sm px-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white bg-[#0D0D0F]"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3.5 py-2 bg-[#161618] text-white border border-white/10 text-xs font-semibold rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                Add
              </button>
            </div>
            {/* Tag Badges wrapper */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 bg-white/5 text-[10px] font-bold text-gray-300 px-2.5 py-0.5 rounded-full border border-white/5">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="text-gray-500 hover:text-rose-400 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 5. Citizen Reporter Credentials */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4 text-left">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Citizen Submitter Credentials
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full text-sm px-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white bg-[#0D0D0F]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Your Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="jane.doe@example.com"
                className="w-full text-sm px-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white bg-[#0D0D0F]"
              />
            </div>
          </div>
          <p className="text-[9px] text-gray-500">
            Note: Submitting reports earns you <strong>+20 Civic Points</strong> on the leaderboard! When workers resolve your issue, you get a <strong>+50 points</strong> bonus!
          </p>
        </div>

        {/* Submit action */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-lg transition-all duration-300 cursor-pointer ${
              isSubmitting 
                ? 'bg-white/5 text-gray-600 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/20 active:scale-95'
            }`}
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Logging Report...' : 'Submit Official Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
