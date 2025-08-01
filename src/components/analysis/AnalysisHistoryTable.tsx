'use client';

import { useState, useEffect, useRef } from 'react';
import type { Analysis } from '@/types';

interface AnalysisHistoryTableProps {
  analyses: Analysis[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AnalysisHistoryTable({
  analyses,
  selectedIds,
  onSelectAll,
  onSelect,
  onView,
  onDelete
}: AnalysisHistoryTableProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  };

  const allSelected = analyses.length > 0 && analyses.every(a => selectedIds.includes(a.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  ref={checkboxRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                Strategy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                Financial
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-primary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {analyses.map((analysis) => {
              const isExpanded = expandedRows.includes(analysis.id);
              const isSelected = selectedIds.includes(analysis.id);
              
              return (
                <>
                  <tr 
                    key={analysis.id} 
                    className={`hover:bg-muted/20 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(analysis.id)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleExpanded(analysis.id)}
                        className="text-left w-full"
                      >
                        <div className="flex items-start gap-2">
                          <svg 
                            className={`w-4 h-4 mt-0.5 text-muted transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <div className="flex items-center gap-3">
                            {/* Property Image */}
                            {(analysis.property_data as any)?.property?.[0]?.primaryImageUrl ? (
                              <img 
                                src={(analysis.property_data as any).property[0].primaryImageUrl} 
                                alt={analysis.address}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted/20 rounded flex items-center justify-center">
                                <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-primary line-clamp-1">
                                {analysis.address}
                              </p>
                              <p className="text-sm text-muted">
                                {analysis.property_data?.property?.[0]?.propertyType || 'Property'} • 
                                {analysis.property_data?.property?.[0]?.bedrooms || 0} bed • 
                                {analysis.property_data?.property?.[0]?.bathrooms || 0} bath
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          analysis.strategy === 'rental' ? 'bg-blue-100 text-blue-700' :
                          analysis.strategy === 'flip' ? 'bg-orange-100 text-orange-700' :
                          analysis.strategy === 'airbnb' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }
                      `}>
                        {analysis.strategy.charAt(0).toUpperCase() + analysis.strategy.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-primary">
                          {formatCurrency(analysis.purchase_price)}
                        </p>
                        <p className="text-sm text-muted">
                          {analysis.down_payment_percent}% down
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-muted">ROI</p>
                          <p className="font-medium text-primary">
                            {analysis.ai_analysis?.financial_metrics?.roi?.toFixed(1) || '0'}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted">Cash Flow</p>
                          <p className="font-medium text-primary">
                            {formatCurrency(analysis.ai_analysis?.financial_metrics?.monthly_cash_flow || 0)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-primary">
                          {formatDate(analysis.created_at)}
                        </p>
                        <p className="text-xs text-muted">
                          {new Date(analysis.created_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onView(analysis.id)}
                          className="p-1 text-primary hover:bg-muted/20 rounded-lg transition-colors"
                          title="View analysis"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {analysis.is_favorite && (
                          <span className="p-1 text-yellow-500" title="Saved to dashboard">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </span>
                        )}
                        <button
                          onClick={() => onDelete(analysis.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete analysis"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 bg-muted/10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* AI Summary */}
                          <div className="md:col-span-2">
                            <h4 className="font-medium text-primary mb-2">AI Analysis Summary</h4>
                            <p className="text-sm text-muted mb-3">
                              {analysis.ai_analysis?.summary || 'No summary available'}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {analysis.ai_analysis?.risks && analysis.ai_analysis.risks.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-red-600 mb-1">Key Risks</h5>
                                  <ul className="text-sm text-muted space-y-1">
                                    {analysis.ai_analysis.risks.slice(0, 2).map((risk: string, idx: number) => (
                                      <li key={idx} className="flex items-start gap-1">
                                        <span className="text-red-500 mt-0.5">•</span>
                                        <span className="line-clamp-2">{risk}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {analysis.ai_analysis?.opportunities && analysis.ai_analysis.opportunities.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-green-600 mb-1">Opportunities</h5>
                                  <ul className="text-sm text-muted space-y-1">
                                    {analysis.ai_analysis.opportunities.slice(0, 2).map((opp: string, idx: number) => (
                                      <li key={idx} className="flex items-start gap-1">
                                        <span className="text-green-500 mt-0.5">•</span>
                                        <span className="line-clamp-2">{opp}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Key Metrics */}
                          <div>
                            <h4 className="font-medium text-primary mb-2">Key Metrics</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted">Cap Rate</span>
                                <span className="font-medium">
                                  {analysis.ai_analysis?.financial_metrics?.cap_rate?.toFixed(2) || '0'}%
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted">Cash on Cash</span>
                                <span className="font-medium">
                                  {analysis.ai_analysis?.financial_metrics?.cash_on_cash_return?.toFixed(2) || '0'}%
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted">Monthly Rent</span>
                                <span className="font-medium">
                                  {formatCurrency(analysis.rental_estimate?.rent || 0)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted">Total Investment</span>
                                <span className="font-medium">
                                  {formatCurrency(
                                    analysis.purchase_price + (analysis.rehab_costs || 0)
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}