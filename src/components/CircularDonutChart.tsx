import React from 'react';
import { WeddingEvent } from '../types';

interface CircularDonutChartProps {
  event: WeddingEvent;
  budget: number;
  spent: number;
  onFilterClick?: (event: WeddingEvent) => void;
  isSelected?: boolean;
}

export const formatIndianRupee = (num: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const CircularDonutChart: React.FC<CircularDonutChartProps> = ({
  event,
  budget,
  spent,
  onFilterClick,
  isSelected,
}) => {
  const remaining = budget - spent;
  const percentSpent = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 999) : 0;
  const isOverBudget = remaining < 0;

  // SVG ring parameters
  const size = 110;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  // Progress clamped to 100% for stroke-dashoffset visual, but displays real percentage
  const visualPercent = Math.min(percentSpent, 100);
  const strokeDashoffset = circumference - (visualPercent / 100) * circumference;

  // Event specific thematic color tints
  const getEventBadgeColor = (name: WeddingEvent) => {
    switch (name) {
      case 'Mehendi / Ghee Pilayi':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Carnival':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Haldi':
        return 'bg-yellow-50 text-yellow-900 border-yellow-200';
      case 'Sangeet':
        return 'bg-purple-50 text-purple-900 border-purple-200';
      case 'Mayra':
        return 'bg-orange-50 text-orange-900 border-orange-200';
      case 'Dora Padla':
        return 'bg-rose-50 text-rose-900 border-rose-200';
      case 'Wedding Ceremony':
        return 'bg-red-50 text-red-900 border-red-200';
      case 'Reception':
        return 'bg-indigo-50 text-indigo-900 border-indigo-200';
      default:
        return 'bg-stone-50 text-stone-800 border-stone-200';
    }
  };

  return (
    <div
      id={`donut-chart-${event.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      onClick={() => onFilterClick && onFilterClick(event)}
      className={`relative p-5 rounded-2xl luxury-card transition-all duration-300 flex flex-col justify-between cursor-pointer group ${
        isSelected
          ? 'ring-2 ring-[#B2503A] shadow-md bg-[#FDFBF7]'
          : 'hover:shadow-md hover:border-[#C5A059]/60 hover:-translate-y-0.5'
      }`}
    >
      {/* Event Header with Tag */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border mb-1.5 ${getEventBadgeColor(
              event
            )}`}
          >
            Event
          </span>
          <h3 className="font-serif-heading text-lg font-semibold text-[#2C2420] group-hover:text-[#9E2A2B] transition-colors leading-snug line-clamp-1">
            {event}
          </h3>
        </div>

        {isOverBudget ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 whitespace-nowrap">
            Over Budget
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            On Track
          </span>
        )}
      </div>

      {/* Center Donut SVG and Percentage */}
      <div className="flex items-center justify-center my-2">
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#F2EAE0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Value ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke={
                isOverBudget
                  ? '#E11D48'
                  : percentSpent > 80
                  ? '#C86D51'
                  : '#C5A059'
              }
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Inner Donut Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className={`text-xl font-bold font-cormorant leading-none ${
                isOverBudget ? 'text-rose-600' : 'text-[#3D312A]'
              }`}
            >
              {percentSpent}%
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#8C7A6B] font-medium mt-0.5">
              Utilized
            </span>
          </div>
        </div>
      </div>

      {/* Financial Details Grid */}
      <div className="mt-3 pt-3 border-t border-[#F0E6DA] space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#7A6B60] font-normal">Budget:</span>
          <span className="font-semibold text-[#2C2420]">{formatIndianRupee(budget)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#7A6B60] font-normal">Amount Spent:</span>
          <span className={`font-semibold ${isOverBudget ? 'text-rose-600' : 'text-[#8C6221]'}`}>
            {formatIndianRupee(spent)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-dashed border-[#F0E6DA]">
          <span className="text-[#7A6B60] font-medium">
            {isOverBudget ? 'Deficit:' : 'Remaining:'}
          </span>
          <span
            className={`font-bold ${
              isOverBudget ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {isOverBudget
              ? `- ${formatIndianRupee(Math.abs(remaining))}`
              : formatIndianRupee(remaining)}
          </span>
        </div>
      </div>

      {/* Click hint */}
      <div className="text-[10px] text-center text-[#B0A093] mt-2 group-hover:text-[#9E2A2B] transition-colors">
        Click to view expenses
      </div>
    </div>
  );
};
