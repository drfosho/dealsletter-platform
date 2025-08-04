'use client';

import { useState } from 'react';
import type { MergedPropertyData } from '@/utils/property-data-merger';
import type { GeneratedAnalysis } from '@/services/property-analysis-ai';

interface PropertyPreviewModalProps {
  isOpen: boolean;
  property: MergedPropertyData | null;
  analysis: GeneratedAnalysis | null;
  strategy: string;
  onClose: () => void;
  onPublish: () => void;
}

export default function PropertyPreviewModal({
  isOpen,
  property,
  analysis,
  strategy,
  onClose,
  onPublish
}: PropertyPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'card' | 'details'>('card');

  if (!isOpen || !property || !analysis) return null;

  // Format strategy display name
  const strategyDisplayName = 
    strategy === 'flip' ? 'Fix & Flip' :
    strategy === 'brrrr' ? 'BRRRR' :
    strategy === 'airbnb' ? 'Short-term Rental' :
    strategy === 'commercial' ? 'Commercial' : 'Buy & Hold';

  // Calculate strategy-specific metrics
  const isFlipStrategy = strategy === 'flip';
  // Use the actual rehab estimate from analysis if available, fallback to property data
  const rehabCost = analysis.financialAnalysis.estimatedRehab || property.estimatedRehab || 0;
  const totalInvestment = (property.price || 0) + rehabCost;
  const estimatedProfit = isFlipStrategy ? 
    Math.round(totalInvestment * 0.25) : // Estimate 25% profit for flips
    0;
  const flipROI = isFlipStrategy && totalInvestment > 0 ? 
    Math.round((estimatedProfit / totalInvestment) * 100) : 0;
  const arv = isFlipStrategy ? totalInvestment + estimatedProfit : 0; // After Repair Value

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Property Preview</h2>
          <p className="text-blue-100">Review how this property will appear on the dashboard</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('card')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'card' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard Card View
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'details' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Full Analysis
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          {activeTab === 'card' ? (
            /* Dashboard Card Preview */
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-lg border border-gray-200">
                {/* Strategy Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isFlipStrategy 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {strategyDisplayName}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    analysis.riskAssessment.riskLevel === 'low' 
                      ? 'bg-green-100 text-green-700'
                      : analysis.riskAssessment.riskLevel === 'high'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {analysis.riskAssessment.riskLevel} risk
                  </span>
                </div>

                {/* Property Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {property.address}
                </h3>
                <p className="text-gray-600 mb-4">
                  {property.city}, {property.state} {property.zipCode}
                </p>

                {/* Property Details */}
                <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500">Beds</p>
                    <p className="font-semibold text-gray-900">{property.bedrooms || '-'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Baths</p>
                    <p className="font-semibold text-gray-900">{property.bathrooms || '-'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Sq Ft</p>
                    <p className="font-semibold text-gray-900">
                      {property.squareFootage?.toLocaleString() || '-'}
                    </p>
                  </div>
                </div>

                {/* Financial Metrics */}
                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Price</span>
                      <span className="font-semibold text-gray-900">
                        ${property.price?.toLocaleString() || 0}
                      </span>
                    </div>
                    
                    {isFlipStrategy ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rehab Budget</span>
                          <span className="font-semibold text-gray-900">
                            ${rehabCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Investment</span>
                          <span className="font-semibold text-gray-900">
                            ${totalInvestment.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Sale (ARV)</span>
                          <span className="font-semibold text-purple-600">
                            ${arv.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Est. Profit</span>
                          <span className="font-bold">
                            ${estimatedProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-blue-600">
                          <span>ROI</span>
                          <span className="font-bold">{flipROI}%</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Rent</span>
                          <span className="font-semibold text-gray-900">
                            ${property.monthlyRent?.toLocaleString() || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Cash Flow</span>
                          <span className="font-semibold text-green-600">
                            ${analysis.financialAnalysis.monthlyCashFlow.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cap Rate</span>
                          <span className="font-semibold text-blue-600">
                            {analysis.financialAnalysis.capRate}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Data Confidence</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                          style={{ width: `${analysis.confidenceScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {analysis.confidenceScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Full Analysis Preview */
            <div className="max-w-none">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Strategic Overview</h3>
              <p className="text-gray-700 mb-6 whitespace-pre-wrap">{analysis.strategicOverview}</p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">Executive Summary</h3>
              <p className="text-gray-700 mb-6 whitespace-pre-wrap">{analysis.executiveSummary}</p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">Investment Thesis</h3>
              <p className="text-gray-700 mb-6 whitespace-pre-wrap">{analysis.investmentThesis}</p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Analysis</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Purchase Price</p>
                    <p className="font-semibold">${analysis.financialAnalysis.purchasePrice.toLocaleString()}</p>
                  </div>
                  {isFlipStrategy && (
                    <div>
                      <p className="text-sm text-gray-600">Rehab Budget</p>
                      <p className="font-semibold">${analysis.financialAnalysis.estimatedRehab.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Total Investment</p>
                    <p className="font-semibold">${analysis.financialAnalysis.totalInvestment.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ROI</p>
                    <p className="font-semibold">{analysis.financialAnalysis.roi}%</p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">Market Analysis</h3>
              <div className="space-y-3 mb-6">
                <div>
                  <p className="font-semibold text-gray-800">Neighborhood Overview:</p>
                  <p className="text-gray-700 mt-1 whitespace-pre-wrap">{analysis.marketAnalysis.neighborhoodOverview}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Market Trends:</p>
                  <p className="text-gray-700 mt-1 whitespace-pre-wrap">{analysis.marketAnalysis.marketTrends}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Demand Drivers:</p>
                  <p className="text-gray-700 mt-1 whitespace-pre-wrap">{analysis.marketAnalysis.demandDrivers}</p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Assessment</h3>
              <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                <p className="font-semibold mb-2">Primary Risks:</p>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.riskAssessment.primaryRisks.map((risk, idx) => (
                    <li key={idx} className="text-gray-700">{risk}</li>
                  ))}
                </ul>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">Value-Add Opportunities</h3>
              <ul className="list-disc list-inside space-y-1 mb-6">
                {analysis.valueAddOpportunities.map((opp, idx) => (
                  <li key={idx} className="text-gray-700">{opp}</li>
                ))}
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-4">Exit Strategy</h3>
              <p className="text-gray-700 mb-6 whitespace-pre-wrap">{analysis.exitStrategy}</p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Actions</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.recommendedActions.map((action, idx) => (
                  <li key={idx} className="text-gray-700">{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Strategy:</span> {strategyDisplayName} | 
              <span className="font-semibold ml-2">Confidence:</span> {analysis.confidenceScore}%
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Back to Edit
              </button>
              <button
                onClick={onPublish}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Publish to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}