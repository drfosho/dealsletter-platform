'use client';

import { useEffect, useState } from 'react';

// Skeleton loader for cards
export function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted/70 rounded w-1/2"></div>
        </div>
        <div className="h-10 w-10 bg-muted rounded-full"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-muted/50 rounded"></div>
        <div className="h-4 bg-muted/50 rounded w-5/6"></div>
        <div className="h-4 bg-muted/50 rounded w-4/6"></div>
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-muted/70 rounded w-20"></div>
        <div className="h-8 bg-muted/70 rounded w-20"></div>
      </div>
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="bg-muted/50 p-4 border-b border-border">
        <div className="h-4 bg-muted rounded w-1/4"></div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-4 w-4 bg-muted rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted/70 rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 bg-muted rounded w-16"></div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-muted rounded"></div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Analysis loading animation
export function AnalysisLoader({ stage }: { stage: string }) {
  const stages = [
    { icon: '🔍', text: 'Searching property data...' },
    { icon: '📊', text: 'Analyzing market trends...' },
    { icon: '💰', text: 'Calculating financial metrics...' },
    { icon: '🤖', text: 'Generating AI insights...' },
    { icon: '✨', text: 'Finalizing your analysis...' }
  ];

  const currentStageIndex = stages.findIndex(s => s.text.toLowerCase().includes(stage.toLowerCase()));
  const activeIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  return (
    <div className="max-w-md mx-auto">
      <div className="space-y-4">
        {stages.map((s, index) => {
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex;
          
          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ${
                isActive 
                  ? 'bg-primary/10 border-primary' 
                  : isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-muted/10 border-border'
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInLeft 0.5s ease-out forwards'
              }}
            >
              <div className={`text-2xl ${
                isActive ? 'animate-bounce' : ''
              }`}>
                {isCompleted ? '✅' : s.icon}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  isActive ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-muted'
                }`}>
                  {s.text}
                </p>
              </div>
              {isActive && (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted">
          <div className="animate-pulse w-2 h-2 bg-primary rounded-full"></div>
          <span>This usually takes 15-30 seconds</span>
        </div>
      </div>
    </div>
  );
}

// Progress bar
export function ProgressBar({ progress, label }: { progress: number; label?: string }) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted">{label}</span>
          <span className="text-primary font-medium">{progress}%</span>
        </div>
      )}
      <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Shimmer effect
export function Shimmer() {
  return (
    <div className="animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  );
}