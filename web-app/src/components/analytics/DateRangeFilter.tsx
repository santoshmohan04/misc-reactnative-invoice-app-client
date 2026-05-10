'use client';

import { useMemo } from 'react';
import type { AnalyticsDateRange } from '@/lib/analytics/buildSeries';

interface DateRangeFilterProps {
  value: AnalyticsDateRange;
  onChange: (value: AnalyticsDateRange) => void;
}

const buildPresets = () => {
  const today = new Date();
  const format = (date: Date) => date.toISOString().slice(0, 10);
  const daysAgo = (days: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() - days);
    return format(date);
  };

  return [
    { label: '30D', value: { from: daysAgo(30), to: format(today) } },
    { label: '90D', value: { from: daysAgo(90), to: format(today) } },
    { label: '1Y', value: { from: daysAgo(365), to: format(today) } },
  ];
};

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const presets = useMemo(buildPresets, []);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(preset.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="date"
          value={value.from}
          onChange={(event) => onChange({ ...value, from: event.target.value })}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900"
        />
        <span>to</span>
        <input
          type="date"
          value={value.to}
          onChange={(event) => onChange({ ...value, to: event.target.value })}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900"
        />
      </div>
    </div>
  );
}
