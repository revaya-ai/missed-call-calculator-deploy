'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QuizProgress } from '@/components/QuizProgress';
import { Dropdown } from '@/components/ui/Dropdown';
import { Slider } from '@/components/ui/Slider';
import { ContactForm } from '@/components/ContactForm';
import { Button } from '@/components/ui/Button';
import { useQuizState } from '@/hooks/useQuizState';
import { QUIZ_QUESTIONS, INDUSTRY_DEFAULTS } from '@/lib/constants';
import { calculateROI } from '@/lib/calculations';
import { submitCalculation } from '@/lib/supabase';
import { notifyParentOfHeight } from '@/lib/iframe-utils';
import type { QuizAnswers, IndustryType, PhoneCoverage } from '@/types/quiz';

const TOTAL_QUESTIONS = 8; // 7 quiz questions + 1 contact form

export default function QuizPage() {
  const router = useRouter();
  const { answers, updateAnswer, currentQuestion, nextQuestion, prevQuestion, progress } =
    useQuizState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Validate email
  const validateEmail = (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Auto-progress when dropdown is selected
  const handleDropdownChange = (key: keyof QuizAnswers, value: string) => {
    if (key === 'industry') {
      updateAnswer(key, value as IndustryType);
    } else if (key === 'phoneCoverage') {
      updateAnswer(key, value as PhoneCoverage);
    } else {
      return;
    }

    // If industry is selected, auto-fill job value and close rate with defaults
    if (key === 'industry' && value && INDUSTRY_DEFAULTS[value]) {
      const defaults = INDUSTRY_DEFAULTS[value];
      updateAnswer('jobValue', defaults.jobValue);
      updateAnswer('closeRate', defaults.closeRate);
    }

    // Auto-progress after a short delay
    setTimeout(() => {
      nextQuestion();
      // B) Notify parent of height after question navigation
      setTimeout(notifyParentOfHeight, 100);
    }, 300);
  };

  // Handle slider change (no auto-progress, user must click Next)
  const handleSliderChange = (key: keyof QuizAnswers, value: number) => {
    if (key === 'callsPerWeek' || key === 'answerPercentage' || key === 'jobValue' ||
        key === 'closeRate' || key === 'monthlySpending') {
      updateAnswer(key, value);
    }
  };

  // Handle next button click with height notification
  const handleNext = () => {
    nextQuestion();
    // B) Notify parent of height after question navigation
    setTimeout(notifyParentOfHeight, 100);
  };

  // Handle previous button click with height notification
  const handlePrevious = () => {
    prevQuestion();
    setTimeout(notifyParentOfHeight, 100);
  };

  // Check if current question is answered
  const isCurrentQuestionAnswered = (): boolean => {
    if (currentQuestion === 7) {
      // Contact form - name and email required
      return !!answers.name && !!answers.email && validateEmail(answers.email);
    }

    if (currentQuestion >= QUIZ_QUESTIONS.length) return true;

    const question = QUIZ_QUESTIONS[currentQuestion];
    const answer = answers[question.answerKey as keyof QuizAnswers];

    // For optional questions, always return true
    if (question.optional) return true;

    return answer !== null && answer !== undefined && answer !== '';
  };

  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setNameError('');
    setEmailError('');

    // Validate required fields
    if (!answers.name) {
      setNameError('Name is required');
      setIsSubmitting(false);
      return;
    }

    if (!answers.email) {
      setEmailError('Email is required');
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(answers.email)) {
      setEmailError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      // Calculate results
      const results = calculateROI(answers);

      // Store results in sessionStorage for results page
      const resultsData = {
        answers,
        results,
      };
      sessionStorage.setItem('calculatorResults', JSON.stringify(resultsData));

      // Save to Supabase in background (fire-and-forget)
      // Don't wait for it to complete - user sees results immediately
      const submissionData = {
        ...answers,
        ...results,
      };
      submitCalculation(submissionData).catch((error) => {
        console.error('Background save failed:', error);
        // Silent fail - user already has their results
      });

      // Redirect to results page immediately
      router.push('/results');
    } catch (error) {
      console.error('Error calculating results:', error);
      alert('There was an error calculating your results. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Skip optional question
  const handleSkip = () => {
    nextQuestion();
  };

  // Render current question
  const renderQuestion = () => {
    if (currentQuestion === 7) {
      // Contact form (Question 8)
      return (
        <ContactForm
          name={answers.name}
          email={answers.email}
          businessName={answers.businessName || ''}
          onUpdate={(field, value) => {
            updateAnswer(field, value);
          }}
          nameError={nameError}
          emailError={emailError}
        />
      );
    }

    if (currentQuestion >= QUIZ_QUESTIONS.length) {
      return <div>Loading...</div>;
    }

    const question = QUIZ_QUESTIONS[currentQuestion];

    return (
      <div className="w-full">
        <h2 className="text-lg font-semibold text-revaya-dark-gray mb-8">
          {question.questionText}
        </h2>

        {question.type === 'dropdown' && question.options && (
          <Dropdown
            options={question.options}
            value={answers[question.answerKey as keyof QuizAnswers] as string | null}
            onChange={(value) => handleDropdownChange(question.answerKey as keyof QuizAnswers, value)}
            placeholder="Select an option..."
          />
        )}

        {question.type === 'slider' && (
          <>
            <Slider
              min={question.min!}
              max={question.max!}
              value={answers[question.answerKey as keyof QuizAnswers] as number}
              onChange={(value) => handleSliderChange(question.answerKey as keyof QuizAnswers, value)}
              step={question.step}
              prefix={question.prefix}
              suffix={question.suffix}
              formatValue={question.formatValue}
            />
            <div className="mt-8 flex justify-center">
              <Button onClick={handleNext} disabled={!isCurrentQuestionAnswered()}>
                Next
              </Button>
            </div>
          </>
        )}

        {question.tip && (
          <p className="mt-6 text-sm text-revaya-medium-gray text-center">{question.tip}</p>
        )}

        {question.optional && (
          <div className="mt-4 text-center">
            <button
              onClick={handleSkip}
              className="text-revaya-coral hover:underline text-sm font-medium"
            >
              Skip this question
            </button>
          </div>
        )}
      </div>
    );
  };

  const canProceed = isCurrentQuestionAnswered();
  const isLastQuestion = currentQuestion === TOTAL_QUESTIONS - 1;
  const currentQ = QUIZ_QUESTIONS[currentQuestion];
  const isSliderQuestion = currentQ?.type === 'slider';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white pt-5">
      <div className="max-w-3xl w-full">
        {/* Progress Bar */}
        <QuizProgress
          progress={progress}
          currentQuestion={currentQuestion}
          totalQuestions={TOTAL_QUESTIONS}
        />

        {/* Question */}
        <div className="mb-8">{renderQuestion()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <div>
            {currentQuestion > 0 && (
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePrevious();
                }}
                className="flex items-center text-revaya-purple hover:text-revaya-purple-dark font-medium"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </Link>
            )}
          </div>

          <div>
            {isLastQuestion ? (
              <Button onClick={handleSubmit} disabled={!canProceed || isSubmitting}>
                {isSubmitting ? 'Calculating...' : 'See My Results'}
              </Button>
            ) : !isSliderQuestion ? null : null}
          </div>
        </div>
      </div>
    </div>
  );
}
