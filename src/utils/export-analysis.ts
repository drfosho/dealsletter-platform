/**
 * Client-side PDF and Excel export for property analysis reports.
 * Uses jsPDF (PDF) and xlsx (Excel) — both run entirely in the browser.
 */
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import type { Analysis } from '@/types';

// ─── helpers ────────────────────────────────────────────────────────
function fmt(n: number | undefined | null): string {
  if (n == null || isNaN(n)) return 'N/A';
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
function pct(n: number | undefined | null): string {
  if (n == null || isNaN(n)) return 'N/A';
  return n.toFixed(2) + '%';
}
function safeStr(v: unknown): string {
  if (v == null) return 'N/A';
  return String(v);
}
function strategyLabel(s: string): string {
  const map: Record<string, string> = {
    flip: 'Fix & Flip',
    rental: 'Buy & Hold',
    brrrr: 'BRRRR Strategy',
    airbnb: 'House Hack',
  };
  return map[s] || s;
}
function slugAddress(address: string): string {
  return address.replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 60);
}
function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
function extractProperty(analysis: Analysis) {
  const pd = analysis.property_data as any;
  const p = Array.isArray(pd?.property) ? pd.property[0] : (pd?.property || pd?.listing || pd);
  return {
    type: p?.propertyType || 'N/A',
    beds: p?.bedrooms ?? 'N/A',
    baths: p?.bathrooms ?? 'N/A',
    sqft: p?.squareFootage ? p.squareFootage.toLocaleString() : 'N/A',
    yearBuilt: p?.yearBuilt ?? 'N/A',
    lotSize: p?.lotSize ? p.lotSize.toLocaleString() : 'N/A',
  };
}
function metrics(a: Analysis) {
  const fm = a.ai_analysis?.financial_metrics || {} as any;
  const ad = (a.analysis_data || {}) as any;
  const cm = ad.calculatedMetrics || {};
  return {
    roi: a.roi ?? fm.roi ?? cm.roi,
    profit: a.profit ?? fm.net_profit ?? fm.total_profit ?? cm.net_profit,
    monthlyCashFlow: a.monthly_cash_flow ?? fm.monthly_cash_flow ?? cm.monthly_cash_flow,
    capRate: a.cap_rate ?? fm.cap_rate ?? cm.cap_rate,
    cashOnCash: a.cash_on_cash ?? fm.cash_on_cash_return ?? cm.cash_on_cash_return,
    arv: a.arv ?? fm.arv ?? ad.arv,
    totalInvestment: a.total_investment ?? fm.total_investment ?? cm.total_investment,
    monthlyRent: a.monthly_rent ?? fm.monthly_rent ?? cm.monthly_rent,
    annualNOI: fm.annual_noi ?? cm.annual_noi,
    holdingCosts: fm.holding_costs ?? cm.holding_costs,
  };
}

// ─── colours (dark theme) ───────────────────────────────────────────
const C = {
  bg: '#0f0f14',
  card: '#1a1a24',
  border: '#2a2a3a',
  primary: '#e4e4ec',
  muted: '#8888a0',
  accent: '#7c3aed',
  green: '#22c55e',
  red: '#ef4444',
  white: '#ffffff',
};

// ─── PDF EXPORT ─────────────────────────────────────────────────────
export async function exportAnalysisPDF(analysis: Analysis): Promise<string> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 15; // margin
  const CW = W - 2 * M; // content width
  let y = M;

  // Background
  const fillPage = () => {
    doc.setFillColor(15, 15, 20);
    doc.rect(0, 0, W, H, 'F');
  };
  fillPage();

  const checkPage = (need: number) => {
    if (y + need > H - 20) {
      doc.addPage();
      fillPage();
      y = M;
    }
  };

  // ── Header bar ──
  doc.setFillColor(124, 58, 237); // accent purple
  doc.rect(0, 0, W, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('DEALSLETTER', M, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Property Investment Analysis Report', M, 18);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), W - M, 12, { align: 'right' });
  doc.text(`Strategy: ${strategyLabel(analysis.strategy)}`, W - M, 18, { align: 'right' });
  y = 35;

  // ── Property address ──
  doc.setTextColor(228, 228, 236);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(analysis.address, M, y);
  y += 8;

  // ── Property details row ──
  const prop = extractProperty(analysis);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(136, 136, 160);
  const detailLine = `${prop.type}  |  ${prop.beds} bd  |  ${prop.baths} ba  |  ${prop.sqft} sqft  |  Built ${prop.yearBuilt}`;
  doc.text(detailLine, M, y);
  y += 10;

  // ── Section helper ──
  const sectionTitle = (title: string) => {
    checkPage(20);
    doc.setFillColor(26, 26, 36);
    doc.roundedRect(M, y, CW, 8, 1, 1, 'F');
    doc.setTextColor(124, 58, 237);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, M + 4, y + 5.5);
    y += 12;
  };

  const row = (label: string, value: string, highlight = false) => {
    checkPage(7);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(136, 136, 160);
    doc.text(label, M + 4, y);
    if (highlight) {
      const num = parseFloat(value.replace(/[$,%]/g, ''));
      if (!isNaN(num)) {
        doc.setTextColor(num >= 0 ? 34 : 239, num >= 0 ? 197 : 68, num >= 0 ? 94 : 68);
      } else {
        doc.setTextColor(228, 228, 236);
      }
    } else {
      doc.setTextColor(228, 228, 236);
    }
    doc.setFont('helvetica', 'bold');
    doc.text(value, W - M - 4, y, { align: 'right' });
    y += 6;
  };

  const divider = () => {
    checkPage(4);
    doc.setDrawColor(42, 42, 58);
    doc.setLineWidth(0.3);
    doc.line(M + 4, y, W - M - 4, y);
    y += 4;
  };

  // ── Key Metrics (coloured boxes) ──
  const m = metrics(analysis);
  sectionTitle('KEY FINANCIAL METRICS');

  const metricBoxes: { label: string; value: string; color: [number, number, number] }[] = [];

  if (analysis.strategy === 'flip') {
    metricBoxes.push(
      { label: 'Net Profit', value: fmt(m.profit), color: (m.profit ?? 0) >= 0 ? [34, 197, 94] : [239, 68, 68] },
      { label: 'ROI', value: pct(m.roi), color: [124, 58, 237] },
      { label: 'ARV', value: fmt(m.arv), color: [59, 130, 246] },
      { label: 'Total Investment', value: fmt(m.totalInvestment), color: [228, 228, 236] },
    );
  } else {
    metricBoxes.push(
      { label: 'Monthly Cash Flow', value: fmt(m.monthlyCashFlow), color: (m.monthlyCashFlow ?? 0) >= 0 ? [34, 197, 94] : [239, 68, 68] },
      { label: 'Cap Rate', value: pct(m.capRate), color: [124, 58, 237] },
      { label: 'Cash-on-Cash', value: pct(m.cashOnCash), color: [59, 130, 246] },
      { label: 'ROI', value: pct(m.roi), color: [34, 197, 94] },
    );
  }

  const boxW = (CW - 9) / 4;
  metricBoxes.forEach((mb, i) => {
    const bx = M + i * (boxW + 3);
    doc.setFillColor(26, 26, 36);
    doc.roundedRect(bx, y, boxW, 18, 2, 2, 'F');
    doc.setDrawColor(42, 42, 58);
    doc.roundedRect(bx, y, boxW, 18, 2, 2, 'S');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(136, 136, 160);
    doc.text(mb.label, bx + boxW / 2, y + 6, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...mb.color);
    doc.text(mb.value, bx + boxW / 2, y + 14, { align: 'center' });
  });
  y += 24;

  // ── Investment Parameters ──
  sectionTitle('INVESTMENT PARAMETERS');
  row('Purchase Price', fmt(analysis.purchase_price));
  row('Down Payment', `${analysis.down_payment_percent}% (${fmt(analysis.purchase_price * analysis.down_payment_percent / 100)})`);
  row('Loan Amount', fmt(analysis.purchase_price * (1 - analysis.down_payment_percent / 100)));
  row('Interest Rate', `${analysis.interest_rate}%`);
  row('Loan Term', `${analysis.loan_term} years`);
  if (analysis.rehab_costs > 0) {
    row('Renovation / Rehab Costs', fmt(analysis.rehab_costs));
  }
  if (m.arv) row('After Repair Value (ARV)', fmt(m.arv));
  divider();

  // ── Financial Breakdown ──
  sectionTitle('FINANCIAL BREAKDOWN');
  if (m.monthlyRent) row('Monthly Rent', fmt(m.monthlyRent));
  if (m.monthlyCashFlow != null) row('Monthly Cash Flow', fmt(m.monthlyCashFlow), true);
  if (m.annualNOI) row('Annual NOI', fmt(m.annualNOI));
  if (m.holdingCosts) row('Holding Costs', fmt(m.holdingCosts));
  if (m.totalInvestment) row('Total Investment', fmt(m.totalInvestment));
  if (m.profit != null) row('Net Profit', fmt(m.profit), true);
  if (m.roi != null) row('ROI', pct(m.roi), true);
  if (m.capRate != null) row('Cap Rate', pct(m.capRate));
  if (m.cashOnCash != null) row('Cash-on-Cash Return', pct(m.cashOnCash));
  divider();

  // ── AI Summary ──
  if (analysis.ai_analysis?.summary) {
    sectionTitle('INVESTMENT SUMMARY');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 210);
    const lines = doc.splitTextToSize(analysis.ai_analysis.summary, CW - 8);
    for (const line of lines) {
      checkPage(5);
      doc.text(line, M + 4, y);
      y += 4.5;
    }
    y += 4;
  }

  // ── AI Recommendation ──
  const rec = (analysis.ai_analysis as any)?.recommendation;
  if (rec) {
    sectionTitle('AI RECOMMENDATION');
    doc.setFillColor(124, 58, 237, 0.1);
    const recText = typeof rec === 'string' ? rec : JSON.stringify(rec);
    const recLines = doc.splitTextToSize(recText, CW - 12);
    const recH = recLines.length * 4.5 + 6;
    checkPage(recH + 4);
    doc.setFillColor(30, 20, 50);
    doc.roundedRect(M, y, CW, recH, 2, 2, 'F');
    doc.setDrawColor(124, 58, 237);
    doc.roundedRect(M, y, CW, recH, 2, 2, 'S');
    doc.setFontSize(8.5);
    doc.setTextColor(200, 200, 220);
    let ry = y + 5;
    for (const line of recLines) {
      doc.text(line, M + 6, ry);
      ry += 4.5;
    }
    y += recH + 6;
  }

  // ── Risks ──
  if (analysis.ai_analysis?.risks?.length) {
    sectionTitle('KEY RISKS');
    doc.setFontSize(8.5);
    for (const risk of analysis.ai_analysis.risks) {
      checkPage(8);
      doc.setTextColor(239, 68, 68);
      doc.text('•', M + 4, y);
      doc.setTextColor(200, 200, 210);
      const riskLines = doc.splitTextToSize(risk, CW - 14);
      for (const rl of riskLines) {
        checkPage(5);
        doc.text(rl, M + 10, y);
        y += 4.5;
      }
      y += 1;
    }
    y += 3;
  }

  // ── Opportunities ──
  if (analysis.ai_analysis?.opportunities?.length) {
    sectionTitle('OPPORTUNITIES');
    doc.setFontSize(8.5);
    for (const opp of analysis.ai_analysis.opportunities) {
      checkPage(8);
      doc.setTextColor(34, 197, 94);
      doc.text('•', M + 4, y);
      doc.setTextColor(200, 200, 210);
      const oppLines = doc.splitTextToSize(opp, CW - 14);
      for (const ol of oppLines) {
        checkPage(5);
        doc.text(ol, M + 10, y);
        y += 4.5;
      }
      y += 1;
    }
    y += 3;
  }

  // ── Footer on every page ──
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(26, 26, 36);
    doc.rect(0, H - 12, W, 12, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(136, 136, 160);
    doc.text('Generated by Dealsletter  •  dealsletter.io', M, H - 5);
    doc.text(`Page ${i} of ${pages}`, W - M, H - 5, { align: 'right' });
  }

  const filename = `Dealsletter-Analysis-${slugAddress(analysis.address)}-${dateStamp()}.pdf`;
  doc.save(filename);
  return filename;
}

// ─── EXCEL EXPORT ───────────────────────────────────────────────────
export function exportAnalysisExcel(analysis: Analysis): string {
  const wb = XLSX.utils.book_new();
  const m = metrics(analysis);
  const prop = extractProperty(analysis);

  // ── Sheet 1: Summary ──
  const summaryData = [
    ['DEALSLETTER - Property Investment Analysis'],
    ['Generated', new Date().toLocaleDateString()],
    [''],
    ['PROPERTY OVERVIEW'],
    ['Address', analysis.address],
    ['Strategy', strategyLabel(analysis.strategy)],
    ['Property Type', prop.type],
    ['Bedrooms', prop.beds],
    ['Bathrooms', prop.baths],
    ['Square Footage', prop.sqft],
    ['Year Built', prop.yearBuilt],
    [''],
    ['KEY METRICS'],
  ];

  if (analysis.strategy === 'flip') {
    summaryData.push(
      ['Net Profit', m.profit ?? 'N/A'],
      ['ROI', m.roi != null ? m.roi / 100 : 'N/A'],
      ['ARV', m.arv ?? 'N/A'],
      ['Total Investment', m.totalInvestment ?? 'N/A'],
    );
  } else {
    summaryData.push(
      ['Monthly Cash Flow', m.monthlyCashFlow ?? 'N/A'],
      ['Cap Rate', m.capRate != null ? m.capRate / 100 : 'N/A'],
      ['Cash-on-Cash Return', m.cashOnCash != null ? m.cashOnCash / 100 : 'N/A'],
      ['Monthly Rent', m.monthlyRent ?? 'N/A'],
      ['ROI', m.roi != null ? m.roi / 100 : 'N/A'],
      ['Annual NOI', m.annualNOI ?? 'N/A'],
    );
  }

  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  // Column widths
  ws1['!cols'] = [{ wch: 24 }, { wch: 30 }];
  // Format currency and percentage cells
  const currencyFmt = '$#,##0';
  const pctFmt = '0.00%';
  for (let r = 13; r < summaryData.length; r++) {
    const cell = ws1[XLSX.utils.encode_cell({ r, c: 1 })];
    if (cell && typeof cell.v === 'number') {
      const label = String(summaryData[r][0]);
      if (label.includes('Rate') || label.includes('ROI') || label.includes('Cash-on-Cash')) {
        cell.z = pctFmt;
      } else {
        cell.z = currencyFmt;
      }
    }
  }
  XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

  // ── Sheet 2: Financial Breakdown ──
  const downPayment = analysis.purchase_price * analysis.down_payment_percent / 100;
  const loanAmount = analysis.purchase_price - downPayment;

  const finData: (string | number | null)[][] = [
    ['INVESTMENT PARAMETERS'],
    ['Purchase Price', analysis.purchase_price],
    ['Down Payment %', analysis.down_payment_percent / 100],
    ['Down Payment $', downPayment],
    ['Loan Amount', loanAmount],
    ['Interest Rate', analysis.interest_rate / 100],
    ['Loan Term (years)', analysis.loan_term],
    ['Renovation / Rehab Costs', analysis.rehab_costs || 0],
    [''],
    ['CALCULATED METRICS'],
    ['Total Cash Needed', downPayment + (analysis.rehab_costs || 0) + (analysis.purchase_price * 0.03)],
    ['Closing Costs (est. 3%)', analysis.purchase_price * 0.03],
  ];

  if (m.monthlyRent) finData.push(['Monthly Rent', m.monthlyRent]);
  if (m.monthlyCashFlow != null) finData.push(['Monthly Cash Flow', m.monthlyCashFlow]);
  if (m.annualNOI) finData.push(['Annual NOI', m.annualNOI]);
  if (m.totalInvestment) finData.push(['Total Investment', m.totalInvestment]);
  if (m.holdingCosts) finData.push(['Holding Costs', m.holdingCosts]);
  if (m.profit != null) finData.push(['Net Profit', m.profit]);
  if (m.arv) finData.push(['After Repair Value (ARV)', m.arv]);

  finData.push(
    [''],
    ['RETURN METRICS'],
  );
  if (m.roi != null) finData.push(['ROI', m.roi / 100]);
  if (m.capRate != null) finData.push(['Cap Rate', m.capRate / 100]);
  if (m.cashOnCash != null) finData.push(['Cash-on-Cash Return', m.cashOnCash / 100]);

  const ws2 = XLSX.utils.aoa_to_sheet(finData);
  ws2['!cols'] = [{ wch: 28 }, { wch: 20 }];
  // Format cells
  for (let r = 0; r < finData.length; r++) {
    const cell = ws2[XLSX.utils.encode_cell({ r, c: 1 })];
    if (cell && typeof cell.v === 'number') {
      const label = String(finData[r][0]);
      if (label.includes('Rate') || label.includes('ROI') || label.includes('Cash-on-Cash') || label.includes('%')) {
        cell.z = pctFmt;
      } else {
        cell.z = currencyFmt;
      }
    }
  }
  XLSX.utils.book_append_sheet(wb, ws2, 'Financial Breakdown');

  // ── Sheet 3: Property Details ──
  const propData: (string | number | null)[][] = [
    ['PROPERTY DETAILS'],
    ['Address', analysis.address],
    ['Property Type', prop.type],
    ['Bedrooms', prop.beds === 'N/A' ? null : Number(prop.beds)],
    ['Bathrooms', prop.baths === 'N/A' ? null : Number(prop.baths)],
    ['Square Footage', prop.sqft === 'N/A' ? null : Number(prop.sqft.replace(/,/g, ''))],
    ['Year Built', prop.yearBuilt === 'N/A' ? null : Number(prop.yearBuilt)],
    ['Lot Size', prop.lotSize === 'N/A' ? null : Number(prop.lotSize.replace(/,/g, ''))],
    [''],
    ['MARKET DATA'],
  ];

  const md = analysis.market_data;
  if (md) {
    if (md.medianRent) propData.push(['Median Rent', md.medianRent]);
    if (md.medianSalePrice) propData.push(['Median Sale Price', md.medianSalePrice]);
    if (md.averageDaysOnMarket) propData.push(['Avg Days on Market', md.averageDaysOnMarket]);
  } else {
    propData.push(['Market data not available', '']);
  }

  propData.push([''], ['AI ANALYSIS']);
  if (analysis.ai_analysis?.summary) {
    propData.push(['Investment Summary', analysis.ai_analysis.summary]);
  }
  const rec2 = (analysis.ai_analysis as any)?.recommendation;
  if (rec2) {
    propData.push(['AI Recommendation', typeof rec2 === 'string' ? rec2 : JSON.stringify(rec2)]);
  }
  if (analysis.ai_analysis?.risks?.length) {
    propData.push([''], ['RISKS']);
    analysis.ai_analysis.risks.forEach((r, i) => propData.push([`Risk ${i + 1}`, r]));
  }
  if (analysis.ai_analysis?.opportunities?.length) {
    propData.push([''], ['OPPORTUNITIES']);
    analysis.ai_analysis.opportunities.forEach((o, i) => propData.push([`Opportunity ${i + 1}`, o]));
  }

  const ws3 = XLSX.utils.aoa_to_sheet(propData);
  ws3['!cols'] = [{ wch: 24 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Property Details');

  const filename = `Dealsletter-Analysis-${slugAddress(analysis.address)}-${dateStamp()}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}
