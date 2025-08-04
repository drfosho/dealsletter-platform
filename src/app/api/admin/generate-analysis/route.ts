import { NextRequest, NextResponse } from 'next/server';
import { propertyAnalysisAI } from '@/services/property-analysis-ai';
import { propertyCache } from '@/services/property-cache';
import type { MergedPropertyData } from '@/utils/property-data-merger';
import type { AnalysisConfig } from '@/services/property-analysis-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyData, config, customNotes } = body;

    // Validate inputs
    if (!propertyData) {
      return NextResponse.json(
        { error: 'Property data is required' },
        { status: 400 }
      );
    }

    if (!config || !config.strategy) {
      return NextResponse.json(
        { error: 'Analysis configuration is required' },
        { status: 400 }
      );
    }

    // Set defaults for config
    const analysisConfig: AnalysisConfig = {
      strategy: config.strategy || 'rental',
      timeHorizon: config.timeHorizon || 5,
      financingType: config.financingType || 'conventional',
      includeProjections: config.includeProjections !== false,
      includeComparables: config.includeComparables !== false,
      analysisDepth: config.analysisDepth || 'comprehensive'
    };

    console.log(`[API] Generating ${analysisConfig.strategy} analysis for ${propertyData.address}`);

    // Check cache for existing analysis (using address as key)
    const cacheKey = propertyData.address || 'unknown';
    const cachedAnalysis = propertyCache.getAnalysis(cacheKey);
    
    if (cachedAnalysis) {
      console.log('[API] Returning cached analysis');
      return NextResponse.json({
        success: true,
        analysis: cachedAnalysis,
        cached: true,
        metadata: {
          generatedAt: new Date().toISOString(),
          strategy: analysisConfig.strategy,
          timeHorizon: analysisConfig.timeHorizon,
          confidenceScore: cachedAnalysis.confidenceScore,
          dataCompleteness: propertyData.dataCompleteness?.score || 0
        }
      });
    }

    // Generate AI analysis
    const analysis = await propertyAnalysisAI.generateAnalysis(
      propertyData as MergedPropertyData,
      analysisConfig,
      customNotes || undefined
    );

    // Cache the analysis
    propertyCache.setAnalysis(cacheKey, analysis);
    console.log('[API] Analysis cached for future requests');

    // Format response
    const response = {
      success: true,
      analysis,
      metadata: {
        generatedAt: new Date().toISOString(),
        strategy: analysisConfig.strategy,
        timeHorizon: analysisConfig.timeHorizon,
        confidenceScore: analysis.confidenceScore,
        dataCompleteness: propertyData.dataCompleteness?.score || 0
      }
    };

    console.log(`[API] Analysis generated with ${analysis.confidenceScore}% confidence`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[API] Analysis generation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'AI service not configured',
            message: 'Please set ANTHROPIC_API_KEY in environment variables'
          },
          { status: 503 }
        );
      }

      if (error.message.includes('Claude API')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'AI service error',
            message: error.message
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}