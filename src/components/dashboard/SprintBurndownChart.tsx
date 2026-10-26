import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { Flame, Calendar, Clock, CheckCircle2, TrendingDown, Layers, Zap } from 'lucide-react';

interface SprintBurndownChartProps {
  sprintId?: string;
}

export const SprintBurndownChart: React.FC<SprintBurndownChartProps> = ({ sprintId = 'SP-24' }) => {
  const { sprints, workItems } = useApp();
  const [metricType, setMetricType] = useState<'points' | 'tasks'>('points');

  const sprint = sprints.find((s) => s.id === sprintId) || sprints[0];
  const sprintItems = workItems.filter((w) => w.sprintId === sprint?.id);

  // Compute total committed story points
  const totalPoints = sprintItems.reduce((acc, item) => {
    const pts = parseInt(item.estimate?.replace(/\D/g, '') || '0', 10);
    return acc + (isNaN(pts) ? 2 : pts);
  }, 0) || 48;

  const totalTasks = sprintItems.length || 12;

  // Completed items in sprint
  const completedItems = sprintItems.filter(
    (w) => w.status === 'Ready for Release' || w.status === 'Released' || w.status === 'Archived'
  );
  const completedPoints = completedItems.reduce((acc, item) => {
    const pts = parseInt(item.estimate?.replace(/\D/g, '') || '0', 10);
    return acc + (isNaN(pts) ? 2 : pts);
  }, 0);

  // Generate 14-day burndown dataset
  const daysTotal = sprint?.durationDays || 14;
  const currentDayIndex = 6; // Current day (Day 6 of 14)

  const data = Array.from({ length: daysTotal }, (_, i) => {
    const day = i + 1;
    const dateLabel = `Day ${day} (${day <= 3 ? 'Dev' : day <= 7 ? 'Dev' : day <= 10 ? 'QA' : day <= 13 ? 'UAT' : 'Rel'})`;

    // Ideal linear burndown slope
    const idealPoints = Math.max(0, Math.round((totalPoints - (totalPoints / (daysTotal - 1)) * i) * 10) / 10);
    const idealTasks = Math.max(0, Math.round((totalTasks - (totalTasks / (daysTotal - 1)) * i) * 10) / 10);

    // Simulated actual progression up to current day
    let actualPoints: number | null = null;
    let actualTasks: number | null = null;

    if (day === 1) {
      actualPoints = totalPoints;
      actualTasks = totalTasks;
    } else if (day === 2) {
      actualPoints = totalPoints;
      actualTasks = totalTasks;
    } else if (day === 3) {
      actualPoints = totalPoints - 4;
      actualTasks = totalTasks - 1;
    } else if (day === 4) {
      actualPoints = totalPoints - 9;
      actualTasks = totalTasks - 2;
    } else if (day === 5) {
      actualPoints = totalPoints - 14;
      actualTasks = totalTasks - 3;
    } else if (day === 6) {
      // Today: 28 pts remaining out of 48
      actualPoints = totalPoints - 20;
      actualTasks = totalTasks - 5;
    }

    return {
      day: `D${day}`,
      dayNum: day,
      label: dateLabel,
      idealPoints,
      actualPoints,
      idealTasks,
      actualTasks,
      isCutoff: day === 7,
      isQaFreeze: day === 10,
      isUatSignoff: day === 13,
      isRelease: day === 14,
    };
  });

  const remainingPoints = totalPoints - completedPoints;
  const burnRate = Math.round((20 / 6) * 10) / 10; // pts/day
  const isAhead = 28 <= 29.5; // On track

  return (
    <div className="bg-[#0C1017] border border-white/[0.08] rounded-xl p-4 md:p-5 space-y-4 shadow-sm select-none">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Sprint Burndown — {sprint?.name || 'Sprint 24'}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              {isAhead ? '● ON TRACK (-1.5 pts ahead)' : 'BEHIND SCHEDULE'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time effort remaining across Dev, QA freeze, UAT sign-off, and release target.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-black/50 border border-white/[0.08] rounded-lg text-xs">
          <button
            onClick={() => setMetricType('points')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              metricType === 'points'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Story Points
          </button>
          <button
            onClick={() => setMetricType('tasks')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              metricType === 'tasks'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Work Items
          </button>
        </div>
      </div>

      {/* Metric Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-2.5 bg-black/30 rounded-lg border border-white/[0.05]">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
            Committed Effort
          </span>
          <span className="text-base font-bold text-white">
            {metricType === 'points' ? `${totalPoints} pts` : `${totalTasks} items`}
          </span>
        </div>

        <div className="p-2.5 bg-black/30 rounded-lg border border-white/[0.05]">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
            Burned / Completed
          </span>
          <span className="text-base font-bold text-emerald-400">
            {metricType === 'points' ? `20 pts (42%)` : `5 items (42%)`}
          </span>
        </div>

        <div className="p-2.5 bg-black/30 rounded-lg border border-white/[0.05]">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
            Remaining Today
          </span>
          <span className="text-base font-bold text-blue-400">
            {metricType === 'points' ? `28 pts` : `7 items`}
          </span>
        </div>

        <div className="p-2.5 bg-black/30 rounded-lg border border-white/[0.05]">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
            Velocity / Cadence
          </span>
          <span className="text-base font-bold text-amber-300">
            ~{burnRate} pts/day
          </span>
        </div>
      </div>

      {/* Recharts Burndown Visualization */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#ffffff15' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#ffffff15' }}
              domain={[0, metricType === 'points' ? Math.ceil(totalPoints * 1.1) : totalTasks]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-[#0F1420] border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5 font-sans">
                      <div className="font-bold text-white border-b border-white/[0.08] pb-1">
                        {item.label}
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-400 font-mono text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                          Ideal Guideline:
                        </span>
                        <strong className="text-slate-200">
                          {metricType === 'points' ? `${item.idealPoints} pts` : `${item.idealTasks} items`}
                        </strong>
                      </div>
                      {item.actualPoints !== null && (
                        <div className="flex items-center justify-between gap-4 text-blue-400 font-mono text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Actual Remaining:
                          </span>
                          <strong className="text-white">
                            {metricType === 'points' ? `${item.actualPoints} pts` : `${item.actualTasks} items`}
                          </strong>
                        </div>
                      )}
                      {item.isCutoff && (
                        <div className="text-[10px] text-cyan-400 font-bold pt-1 uppercase">
                          Dev Cutoff Milestone
                        </div>
                      )}
                      {item.isQaFreeze && (
                        <div className="text-[10px] text-teal-400 font-bold pt-1 uppercase">
                          QA Freeze Date
                        </div>
                      )}
                      {item.isUatSignoff && (
                        <div className="text-[10px] text-emerald-400 font-bold pt-1 uppercase">
                          UAT Sign-off Window Closes
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Reference milestone lines */}
            <ReferenceLine x="D7" stroke="#06b6d4" strokeDasharray="3 3" label={{ value: 'Dev Cutoff', fill: '#06b6d4', fontSize: 10, position: 'top' }} />
            <ReferenceLine x="D10" stroke="#14b8a6" strokeDasharray="3 3" label={{ value: 'QA Freeze', fill: '#14b8a6', fontSize: 10, position: 'top' }} />
            <ReferenceLine x="D13" stroke="#10b981" strokeDasharray="3 3" label={{ value: 'UAT Sign-off', fill: '#10b981', fontSize: 10, position: 'top' }} />

            {/* Ideal Burndown Guideline (Muted Gray Dashed) */}
            <Line
              type="linear"
              dataKey={metricType === 'points' ? 'idealPoints' : 'idealTasks'}
              stroke="#64748b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
              name="Ideal Guide"
            />

            {/* Actual Burndown Line (Electric Blue Solid) */}
            <Line
              type="monotone"
              dataKey={metricType === 'points' ? 'actualPoints' : 'actualTasks'}
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#0C1017' }}
              activeDot={{ r: 6, fill: '#60a5fa', stroke: '#ffffff' }}
              name="Actual Remaining"
              connectNulls={false}
            />

            {/* Highlight current day dot */}
            <ReferenceDot
              x="D6"
              y={metricType === 'points' ? 28 : 7}
              r={6}
              fill="#eab308"
              stroke="#ffffff"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Phase Milestones legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06] text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-slate-500 inline-block border-dashed"></span>
            <span>Ideal Guideline</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-blue-500 inline-block rounded-full"></span>
            <span className="text-blue-300 font-semibold">Actual Burned Work</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            <span className="text-amber-300">Today (Day 6)</span>
          </span>
        </div>

        <div className="text-[10px] font-mono text-slate-500">
          Cutoff D7 · Freeze D10 · UAT D13 · Rel D14
        </div>
      </div>
    </div>
  );
};
