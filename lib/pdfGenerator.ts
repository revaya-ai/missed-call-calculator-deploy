import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CalculationResults, QuizAnswers } from '@/types/quiz';
import { formatCurrency, formatNumber } from './calculations';

export function generatePDF(results: CalculationResults, answers: QuizAnswers): void {
  const doc = new jsPDF();

  // Set up fonts and colors
  const purpleColor: [number, number, number] = [59, 61, 159]; // #3B3D9F
  const darkGray: [number, number, number] = [31, 41, 55]; // #1F2937
  const mediumGray: [number, number, number] = [107, 114, 128]; // #6B7280
  const redColor: [number, number, number] = [239, 68, 68]; // #EF4444
  const tealColor: [number, number, number] = [20, 184, 166]; // #14B8A6

  let yPosition = 20;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(...purpleColor);
  doc.text('REVAYA AI', 105, yPosition, { align: 'center' });

  yPosition += 8;
  doc.setFontSize(16);
  doc.text('Your Missed Call Reality Report', 105, yPosition, { align: 'center' });

  yPosition += 15;

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(...mediumGray);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (answers.businessName) {
    doc.text(`Business: ${answers.businessName}`, 20, yPosition);
    yPosition += 6;
  }

  doc.text(`Industry: ${answers.industry || 'Not specified'}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Report Date: ${today}`, 20, yPosition);
  yPosition += 15;

  // Section 1: Perception vs. Reality
  doc.setFontSize(14);
  doc.setTextColor(...darkGray);
  doc.text('📉 Perception vs. Reality', 20, yPosition);
  yPosition += 10;

  // Calculate gaps
  const answerRateGap = results.perceivedAnswerRate - results.realisticAnswerRate;
  const weeklyGap = results.actualMissedCallsWeekly - results.perceivedMissedCallsWeekly;
  const monthlyGap = results.actualMissedCallsMonthly - results.perceivedMissedCallsMonthly;

  // Table
  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'What You Think', 'Reality', 'Gap']],
    body: [
      [
        'Answer Rate',
        `${results.perceivedAnswerRate}%`,
        `${formatNumber(results.realisticAnswerRate)}%`,
        `${answerRateGap > 0 ? '-' : '+'}${Math.abs(Math.round(answerRateGap))}%`
      ],
      [
        'Missed/Week',
        formatNumber(results.perceivedMissedCallsWeekly),
        formatNumber(results.actualMissedCallsWeekly),
        `+${formatNumber(weeklyGap)}`
      ],
      [
        'Missed/Month',
        results.perceivedMissedCallsMonthly.toString(),
        results.actualMissedCallsMonthly.toString(),
        `+${Math.round(monthlyGap)}`
      ]
    ],
    headStyles: {
      fillColor: [229, 231, 235],
      textColor: [31, 41, 55],
      fontStyle: 'bold'
    },
    columnStyles: {
      3: { textColor: [239, 68, 68], fontStyle: 'bold' }
    },
    margin: { left: 20, right: 20 }
  });

  yPosition = (doc as typeof doc & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // Section 2: What This Is Costing You
  doc.setFontSize(14);
  doc.setTextColor(...darkGray);
  doc.text('💰 What This Is Costing You', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(...mediumGray);

  const costingData = [
    ['Missed calls/month', results.actualMissedCallsMonthly.toString()],
    [`At ${answers.closeRate}% close rate`, `${formatNumber(results.lostCustomersMonthly)} lost`],
    ['Monthly Revenue Loss', formatCurrency(results.lostRevenueMonthly)],
    ['Annual Revenue Loss', formatCurrency(results.lostRevenueAnnual)]
  ];

  costingData.forEach(([label, value]) => {
    doc.setTextColor(...mediumGray);
    doc.text(label, 25, yPosition);
    doc.setTextColor(...redColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 180, yPosition, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    yPosition += 8;
  });

  yPosition += 10;

  // Calculation Breakdown
  doc.setFontSize(12);
  doc.setTextColor(...darkGray);
  doc.text('Calculation Breakdown:', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setTextColor(...mediumGray);
  const breakdownLines = [
    `• ${formatNumber(results.monthlyCallVolume)} total calls/month`,
    `• ${formatNumber(results.realisticAnswerRate)}% answer rate (based on coverage: ${answers.phoneCoverage})`,
    `• ${results.actualMissedCallsMonthly} missed calls/month`,
    `• ${formatNumber(results.newBusinessMissedMonthly)} potential new customers (60% of missed calls)`,
    `• ${formatNumber(results.lostCustomersMonthly)} lost customers (${formatNumber(results.newBusinessMissedMonthly)} × ${answers.closeRate}% close rate)`,
    `• ${formatCurrency(results.lostRevenueMonthly)}/month (${formatNumber(results.lostCustomersMonthly)} × ${formatCurrency(answers.jobValue)} avg job value)`
  ];

  breakdownLines.forEach(line => {
    doc.text(line, 25, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Section 3: With 24/7 AI Voice Coverage
  doc.setFontSize(14);
  doc.setTextColor(...darkGray);
  doc.text('🤖 With 24/7 AI Voice Coverage', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(...mediumGray);

  const aiData = [
    ['Answer rate', '95%'],
    ['Missed reduced to', `${formatNumber(results.aiMissedCallsWeekly)}/week`],
    ['Revenue Recovered Monthly', formatCurrency(results.revenueRecoveredMonthly)],
    ['Revenue Recovered Annual', formatCurrency(results.revenueRecoveredAnnual)]
  ];

  aiData.forEach(([label, value]) => {
    doc.setTextColor(...mediumGray);
    doc.text(label, 25, yPosition);
    doc.setTextColor(...tealColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 180, yPosition, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    yPosition += 8;
  });

  yPosition += 10;

  // How AI Changes The Math
  doc.setFontSize(12);
  doc.setTextColor(...darkGray);
  doc.text('How AI Changes The Math:', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setTextColor(...mediumGray);
  const aiLines = [
    `• 95% answer rate vs. ${formatNumber(results.realisticAnswerRate)}% current`,
    `• Missed calls drop from ${results.actualMissedCallsMonthly}/month to ${formatNumber(results.aiMissedCallsMonthly)}/month`,
    `• Revenue recovered: ${formatCurrency(results.revenueRecoveredMonthly)}/month`
  ];

  aiLines.forEach(line => {
    doc.text(line, 25, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Optional: Cost Per Answered Call
  if (results.costPerAnsweredCall !== null) {
    doc.setFontSize(12);
    doc.setTextColor(...darkGray);
    doc.text('Cost Per Answered Call:', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setTextColor(...mediumGray);
    doc.text(`Currently spending: ${formatCurrency(answers.monthlySpending)}/month`, 25, yPosition);
    yPosition += 6;
    doc.text(`Current cost per answered call: ${formatCurrency(results.costPerAnsweredCall)}`, 25, yPosition);
    yPosition += 10;
  }

  // Footer
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(12);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'bold');
  doc.text('Ready to stop losing revenue?', 105, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...purpleColor);
  doc.text('Schedule your free strategy call: https://revaya.ai/contact', 105, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(9);
  doc.setTextColor(...mediumGray);
  doc.text('Revaya AI | Reclaim Time. Build Freedom.', 105, yPosition, { align: 'center' });

  // Generate filename
  const businessName = answers.businessName ? answers.businessName.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'business';
  const dateString = new Date().toISOString().split('T')[0];
  const filename = `missed-call-report-${businessName}-${dateString}.pdf`;

  // Save the PDF
  doc.save(filename);
}
