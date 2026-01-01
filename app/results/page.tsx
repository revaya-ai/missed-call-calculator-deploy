'use client';

import { useEffect, useState } from 'react';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import type { QuizAnswers, CalculationResults } from '@/types/quiz';

export default function ResultsPage() {
  const [resultsData, setResultsData] = useState<{
    answers: QuizAnswers;
    results: CalculationResults;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get results from sessionStorage
    const storedData = sessionStorage.getItem('calculatorResults');

    if (!storedData) {
      // No results found - redirect to start
      setLoading(false);
      return;
    }

    try {
      const data = JSON.parse(storedData);
      setResultsData(data);
    } catch (error) {
      console.error('Error parsing results:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-revaya-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl text-revaya-medium-gray">Calculating your results...</p>
        </div>
      </div>
    );
  }

  if (!resultsData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-revaya-dark-gray mb-4">No Results Found</h1>
          <p className="text-lg text-revaya-medium-gray mb-6">
            Please complete the calculator to see your results.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-revaya-purple text-white rounded-lg font-semibold hover:bg-revaya-purple-dark transition-colors"
          >
            Start Calculator
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white">
      <ResultsDisplay results={resultsData.results} answers={resultsData.answers} />
    </div>
  );
}
