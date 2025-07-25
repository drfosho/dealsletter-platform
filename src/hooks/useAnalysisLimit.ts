'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkAnalysisUsage, incrementAnalysisUsage } from '@/lib/supabase/usage-tracking';
import { saveAnalyzedProperty } from '@/lib/supabase/analyzed-properties';

interface UseAnalysisLimitReturn {
  canAnalyze: boolean;
  remainingAnalyses: number;
  checkAndIncrementUsage: () => Promise<boolean>;
  saveAnalysis: (analysisData: Record<string, unknown>) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  showUpgradePrompt: boolean;
  setShowUpgradePrompt: (show: boolean) => void;
}

export function useAnalysisLimit(): UseAnalysisLimitReturn {
  const { user } = useAuth();
  const [canAnalyze, setCanAnalyze] = useState(true);
  const [remainingAnalyses, setRemainingAnalyses] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const checkAndIncrementUsage = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      setError('You must be logged in to analyze properties');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if user can analyze
      const usageCheck = await checkAnalysisUsage(user.id);
      
      if (!usageCheck.can_analyze) {
        setCanAnalyze(false);
        setRemainingAnalyses(0);
        setShowUpgradePrompt(true);
        setError(usageCheck.message);
        return false;
      }

      // Increment usage
      const { error: incrementError } = await incrementAnalysisUsage(user.id);
      
      if (incrementError) {
        setError('Failed to track analysis. Please try again.');
        return false;
      }

      // Update state
      setCanAnalyze(true);
      setRemainingAnalyses(usageCheck.remaining_analyses - 1);
      
      return true;
    } catch (err) {
      console.error('Error checking/incrementing usage:', err);
      setError('An error occurred. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const saveAnalysis = useCallback(async (analysisData: Record<string, unknown>): Promise<boolean> => {
    if (!user?.id) {
      setError('You must be logged in to save analyses');
      return false;
    }

    try {
      // Format the data for saving
      const propertyData = {
        user_id: user.id,
        address: (analysisData.address as string) || 'Property Analysis',
        analysis_date: new Date().toISOString().split('T')[0],
        roi: Number(analysisData.roi) || 0,
        profit: Number(analysisData.profit) || 0,
        deal_type: (analysisData.dealType as string) || 'Fix & Flip',
        is_favorite: false,
        analysis_data: analysisData // Store full analysis results
      };

      const { error: saveError } = await saveAnalyzedProperty(propertyData);
      
      if (saveError) {
        console.error('Error saving analysis:', saveError);
        setError('Failed to save analysis. Please try again.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error saving analysis:', err);
      setError('Failed to save analysis. Please try again.');
      return false;
    }
  }, [user?.id]);

  return {
    canAnalyze,
    remainingAnalyses,
    checkAndIncrementUsage,
    saveAnalysis,
    loading,
    error,
    showUpgradePrompt,
    setShowUpgradePrompt
  };
}