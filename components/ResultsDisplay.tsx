'use client';

import { useState } from 'react';
import { formatCurrency, formatNumber } from '@/lib/calculations';
import { generatePDF } from '@/lib/pdfGenerator';
import { updatePDFDownloaded } from '@/lib/supabase';
import type { CalculationResults, QuizAnswers } from '@/types/quiz';

interface ResultsDisplayProps {
  results: CalculationResults;
  answers: QuizAnswers;
}

export function ResultsDisplay({ results, answers }: ResultsDisplayProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate gaps for perception vs reality
  const answerRateGap = results.perceivedAnswerRate - results.realisticAnswerRate;
  const weeklyGap = results.actualMissedCallsWeekly - results.perceivedMissedCallsWeekly;
  const monthlyGap = results.actualMissedCallsMonthly - results.perceivedMissedCallsMonthly;

  const handleDownloadPDF = async () => {
    // Generate and download PDF
    generatePDF(results, answers);

    // Track download in Supabase (fire-and-forget)
    if (answers.email) {
      updatePDFDownloaded(answers.email).catch(error => {
        console.error('Failed to track PDF download:', error);
        // Silent fail - don't block user experience
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center mb-8 animate-fadeIn">
        <h1 className="text-3xl md:text-4xl font-bold text-revaya-dark-gray mb-3">
          Your Missed Call Reality
        </h1>
        <p className="text-lg text-revaya-medium-gray">
          Based on your inputs and industry benchmarks
        </p>
      </div>

      {/* SUMMARY SECTION */}
      <div className="text-center py-10 animate-fadeIn" style={{ animationDelay: '100ms' }}>
        <h2 className="text-2xl md:text-3xl font-semibold text-revaya-dark-gray mb-2">
          You&apos;re potentially losing
        </h2>

        <div className="mb-1">
          <span className="text-5xl md:text-7xl font-bold text-revaya-purple">
            {formatCurrency(results.lostRevenueMonthly)}
          </span>
          <span className="text-2xl md:text-3xl text-revaya-medium-gray ml-2">/month</span>
        </div>

        <div className="text-lg md:text-xl text-gray-400 mb-6">
          {formatCurrency(results.lostRevenueAnnual)}/year
        </div>

        {/* Reality Check Callout */}
        <div className="max-w-3xl mx-auto bg-purple-100 border-l-4 border-revaya-purple rounded-lg p-5 md:p-6">
          <h3 className="text-lg font-semibold text-revaya-dark-gray mb-2 flex items-center justify-center">
            <svg className="w-5 h-5 mr-2 text-revaya-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Reality Check
          </h3>
          <p className="text-base text-gray-700 leading-relaxed">
            You think you&apos;re answering <span className="font-semibold text-revaya-purple">{results.perceivedAnswerRate}%</span> of calls,
            but based on your coverage setup ({answers.phoneCoverage}), you&apos;re likely answering closer to{' '}
            <span className="font-semibold text-revaya-purple">{formatNumber(results.realisticAnswerRate)}%</span>.
          </p>
        </div>
      </div>

      {/* SECTION 1: Perception vs. Reality */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fadeIn">
        <div className="bg-gray-100 px-6 py-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-revaya-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            <h2 className="text-lg md:text-xl font-bold text-revaya-dark-gray">
              Perception vs. Reality
            </h2>
          </div>
        </div>
        <div className="p-6 md:p-8">

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-2 md:px-4 font-semibold text-revaya-dark-gray">Metric</th>
                <th className="text-right py-3 px-2 md:px-4 font-semibold text-revaya-dark-gray">What You Think</th>
                <th className="text-right py-3 px-2 md:px-4 font-semibold text-revaya-dark-gray">Reality</th>
                <th className="text-right py-3 px-2 md:px-4 font-semibold text-red-600">Gap</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-2 md:px-4 text-revaya-dark-gray">Answer Rate</td>
                <td className="py-4 px-2 md:px-4 text-right font-bold">{results.perceivedAnswerRate}%</td>
                <td className="py-4 px-2 md:px-4 text-right font-bold">{formatNumber(results.realisticAnswerRate)}%</td>
                <td className="py-4 px-2 md:px-4 text-right font-bold text-red-600">
                  {answerRateGap > 0 ? '-' : '+'}{Math.abs(Math.round(answerRateGap))}%
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-2 md:px-4 text-revaya-dark-gray">Missed/Week</td>
                <td className="py-4 px-2 md:px-4 text-right font-bold">{formatNumber(results.perceivedMissedCallsWeekly)}</td>
                <td className="py-4 px-2 md:px-4 text-right font-bold">{formatNumber(results.actualMissedCallsWeekly)}</td>
                <td className="py-4 px-2 md:px-4 text-right font-bold text-red-600">
                  +{formatNumber(weeklyGap)}
                </td>
              </tr>
              <tr>
                <td className="py-4 px-2 md:px-4 text-revaya-dark-gray">Missed/Month</td>
                <td className="py-4 px-2 md:px-4 text-right font-bold">{results.perceivedMissedCallsMonthly}</td>
                <td className="py-4 px-2 md:px-4 text-right font-bold">{results.actualMissedCallsMonthly}</td>
                <td className="py-4 px-2 md:px-4 text-right font-bold text-red-600">
                  +{Math.round(monthlyGap)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </div>

      {/* SECTION 2: What This Is Costing You */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fadeIn" style={{ animationDelay: '200ms' }}>
        <div className="bg-red-50 px-6 py-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-revaya-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg md:text-xl font-bold text-revaya-dark-gray">
              What This Is Costing You
            </h2>
          </div>
        </div>
        <div className="p-6 md:p-8">

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-revaya-dark-gray">Missed calls/month</span>
            <span className="text-sm font-bold text-revaya-dark-gray">
              {results.actualMissedCallsMonthly}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-revaya-dark-gray">At {answers.closeRate}% close rate</span>
            <span className="text-sm font-bold text-revaya-dark-gray">
              {formatNumber(results.lostCustomersMonthly)} lost
            </span>
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-base font-semibold text-revaya-dark-gray">Monthly</span>
            <span className="text-2xl md:text-3xl font-bold text-red-600">
              {formatCurrency(results.lostRevenueMonthly)}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-base font-semibold text-revaya-dark-gray">Annual</span>
            <span className="text-2xl md:text-3xl font-bold text-red-600">
              {formatCurrency(results.lostRevenueAnnual)}
            </span>
          </div>
        </div>
        </div>
      </div>

      {/* SECTION 3: With 24/7 AI Voice Coverage */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fadeIn" style={{ animationDelay: '400ms' }}>
        <div className="bg-teal-50 px-6 py-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-revaya-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg md:text-xl font-bold text-revaya-dark-gray">
              With 24/7 AI Voice Coverage
            </h2>
          </div>
        </div>
        <div className="p-6 md:p-8">

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-revaya-dark-gray">Answer rate</span>
            <span className="flex items-center">
              <span className="text-sm font-bold text-revaya-dark-gray mr-2">95%</span>
              <button
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-revaya-teal border border-revaya-teal rounded-full cursor-help">
                  i
                </span>
                {showTooltip && (
                  <span className="absolute right-0 bottom-full mb-2 w-64 p-3 text-sm text-white bg-revaya-dark-gray rounded-lg shadow-lg z-10">
                    Industry-standard performance for AI voice agents with proper setup and monitoring
                  </span>
                )}
              </button>
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-revaya-dark-gray">Missed reduced to</span>
            <span className="text-sm font-bold text-revaya-dark-gray">
              {formatNumber(results.aiMissedCallsWeekly)}/week
            </span>
          </div>
        </div>

        <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-base font-semibold text-revaya-dark-gray">Recovered</span>
            <span className="text-2xl md:text-3xl font-bold text-teal-600">
              {formatCurrency(results.revenueRecoveredMonthly)}/mo
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-base font-semibold text-revaya-dark-gray">Annual</span>
            <span className="text-2xl md:text-3xl font-bold text-teal-600">
              {formatCurrency(results.revenueRecoveredAnnual)}/yr
            </span>
          </div>
        </div>
        </div>
      </div>

      {/* CTAs Section */}
      <div className="bg-revaya-purple rounded-xl border border-revaya-purple p-6 md:p-8 text-center animate-fadeIn" style={{ animationDelay: '600ms' }}>
        <h3 className="text-2xl font-bold text-white mb-2">
          Ready to Capture These Calls?
        </h3>
        <p className="text-white text-opacity-90 mb-6">
          See how much revenue you could recover.
        </p>

        <div className="space-y-4 max-w-md mx-auto">
          {/* Primary CTA */}
          <button
            onClick={() => window.open('https://cal.com/revaya/ai-fit-call', '_blank')}
            className="w-full px-8 py-4 text-lg font-semibold text-revaya-purple bg-white border-2 border-white rounded-lg hover:bg-gray-100 transition-colors"
          >
            📅 Book Free Strategy Call
          </button>

          {/* Secondary CTA */}
          <button
            onClick={handleDownloadPDF}
            className="w-full px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-white rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            📄 Download Report
          </button>

          {/* Tertiary CTA */}
          <div className="pt-2">
            <p className="text-sm text-white text-opacity-90 mb-2">
              Find out if you have the clarity to make AI work.
            </p>
            <a
              href="https://revaya.ai/ai-strategy-quiz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline font-medium"
            >
              📋 Take the AI Strategy Quiz
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
