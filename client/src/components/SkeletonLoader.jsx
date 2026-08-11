import React from 'react';

/**
 * SkeletonLoader
 * Renders shimmer placeholder rows for lists and message streams.
 *
 * Props:
 *   variant: 'friendRow' | 'messageRow' | 'profile'
 *   count:   number of rows to render (default 4)
 */
const SkeletonLoader = ({ variant = 'friendRow', count = 4 }) => {
  return (
    <div className="p-3 space-y-3" role="status" aria-label="Loading…">
      {Array.from({ length: count }).map((_, i) => {
        if (variant === 'friendRow') {
          return (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-surface-100 dark:bg-surface-900/50 animate-pulse">
              {/* Avatar */}
              <div className="w-11 h-11 rounded-2xl bg-surface-300 dark:bg-surface-700 shrink-0" />
              {/* Text lines */}
              <div className="flex-1 space-y-2">
                <div className="h-3.5 rounded-full bg-surface-300 dark:bg-surface-700 w-2/3" />
                <div className="h-2.5 rounded-full bg-surface-200 dark:bg-surface-800 w-1/2" />
              </div>
            </div>
          );
        }

        if (variant === 'messageRow') {
          const isMe = i % 2 === 0;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-pulse`}>
              <div
                className={`h-10 rounded-2xl bg-surface-200 dark:bg-surface-800 ${
                  isMe ? 'w-48 rounded-tr-none' : 'w-56 rounded-tl-none'
                }`}
              />
            </div>
          );
        }

        if (variant === 'profile') {
          return (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="h-28 rounded-2xl bg-surface-200 dark:bg-surface-800 w-full" />
              <div className="flex gap-3 items-end px-2 -mt-10">
                <div className="w-20 h-20 rounded-2xl bg-surface-300 dark:bg-surface-700 border-4 border-white dark:border-surface-900" />
                <div className="flex-1 space-y-2 pb-1">
                  <div className="h-4 rounded-full bg-surface-300 dark:bg-surface-700 w-1/2" />
                  <div className="h-3 rounded-full bg-surface-200 dark:bg-surface-800 w-1/3" />
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}
      <span className="sr-only">Loading…</span>
    </div>
  );
};

export default SkeletonLoader;
