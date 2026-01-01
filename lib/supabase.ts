import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to submit calculator data
export async function submitCalculation(data: {
  name: string;
  email: string;
  businessName?: string;
  industry: string;
  callsPerWeek: number;
  answerPercentage: number;
  phoneCoverage: string;
  jobValue: number;
  closeRate: number;
  monthlySpending: number;
  monthlyCallVolume: number;
  perceivedAnswerRate: number;
  realisticAnswerRate: number;
  perceivedMissedCallsWeekly: number;
  perceivedMissedCallsMonthly: number;
  actualMissedCallsWeekly: number;
  actualMissedCallsMonthly: number;
  newBusinessMissedMonthly: number;
  lostCustomersMonthly: number;
  lostRevenueMonthly: number;
  lostRevenueAnnual: number;
  aiMissedCallsWeekly: number;
  aiMissedCallsMonthly: number;
  revenueRecoveredMonthly: number;
  revenueRecoveredAnnual: number;
  costPerAnsweredCall: number | null;
  actualAnswerRate: number;
  dailyMissedCalls: number;
  monthlyMissedCalls: number;
  monthlyLostRevenue: number;
  annualLostRevenue: number;
}) {
  // Map our app data structure to database column names
  const dbData = {
    // User info
    name: data.name,
    email: data.email,
    business_name: data.businessName || null,

    // Input data
    industry_type: data.industry,
    calls_per_week: data.callsPerWeek,
    answer_percentage: data.answerPercentage,
    phone_coverage: data.phoneCoverage,
    job_value: data.jobValue,
    close_rate: data.closeRate,
    monthly_spending: data.monthlySpending,

    // Enhanced calculation results
    monthly_call_volume: data.monthlyCallVolume,
    perceived_answer_rate: data.perceivedAnswerRate,
    realistic_answer_rate: data.realisticAnswerRate,
    coverage_setup: data.phoneCoverage,
    perceived_missed_weekly: data.perceivedMissedCallsWeekly,
    perceived_missed_monthly: data.perceivedMissedCallsMonthly,
    actual_missed_weekly: data.actualMissedCallsWeekly,
    actual_missed_monthly: data.actualMissedCallsMonthly,
    new_business_missed_monthly: data.newBusinessMissedMonthly,
    lost_customers_monthly: data.lostCustomersMonthly,
    lost_revenue_monthly: data.lostRevenueMonthly,
    lost_revenue_annual: data.lostRevenueAnnual,
    ai_missed_weekly: data.aiMissedCallsWeekly,
    ai_missed_monthly: data.aiMissedCallsMonthly,
    revenue_recovered_monthly: data.revenueRecoveredMonthly,
    revenue_recovered_annual: data.revenueRecoveredAnnual,
    cost_per_answered_call: data.costPerAnsweredCall,

    // Legacy fields (for backward compatibility)
    actual_answer_rate: data.actualAnswerRate,
    daily_missed_calls: data.dailyMissedCalls,
    monthly_missed_calls: data.monthlyMissedCalls,
    monthly_lost_revenue: data.monthlyLostRevenue,
    annual_lost_revenue: data.annualLostRevenue,
  };

  const { data: submission, error } = await supabase
    .from('calculator_submissions')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Error submitting calculation:', error);
    throw error;
  }

  return submission;
}

// Helper function to update PDF download status
export async function updatePDFDownloaded(email: string) {
  const { error } = await supabase
    .from('calculator_submissions')
    .update({
      pdf_downloaded: true,
      pdf_downloaded_at: new Date().toISOString()
    })
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error updating PDF download status:', error);
    throw error;
  }
}

// Helper function to get all submissions (requires authentication)
export async function getSubmissions() {
  const { data, error } = await supabase
    .from('calculator_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }

  return data;
}

// Helper function to get submission by email
export async function getSubmissionsByEmail(email: string) {
  const { data, error } = await supabase
    .from('calculator_submissions')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions by email:', error);
    throw error;
  }

  return data;
}
