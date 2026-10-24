/**
 * Pure calculation logic for QueueLess Smart Wait-Time Prediction.
 * Decoupled from React UI components for deterministic verification and unit testing.
 *
 * Algorithm Formulation:
 * Wait Time = [ (Tokens Ahead) * S_avg + (isCounterOccupied ? max(0, S_avg - Current_Elapsed) : 0) ] / max(1, Active_Counters)
 */

export interface PredictionResult {
  queuePosition: number;
  customersAhead: number;
  estimatedWaitMinutes: number;
  confidenceScore: number;
  explanation: string;
  urgencyLevel: 'immediate' | 'soon' | 'waiting' | 'relaxed';
}

export function calculateEstimatedWait(
  customersAhead: number,
  averageServiceMinutes: number = 5,
  currentElapsedMinutes: number = 0,
  activeCountersCount: number = 1,
  isCounterOccupied: boolean = false
): PredictionResult {
  const safeAhead = Math.max(0, Math.floor(customersAhead));
  const safeAvg = Math.max(1, Math.min(60, averageServiceMinutes));
  const safeCounters = Math.max(1, Math.floor(activeCountersCount));
  const safeElapsed = Math.max(0, currentElapsedMinutes);

  // Remaining time on the token currently in the service booth (if occupied)
  const remainingCurrent = isCounterOccupied ? Math.max(0.5, safeAvg - safeElapsed) : 0;

  // Total raw waiting minutes
  const totalRawMinutes = (safeAhead * safeAvg + remainingCurrent) / safeCounters;
  const estimatedWaitMinutes = Math.max(1, Math.round(totalRawMinutes));

  const queuePosition = safeAhead + 1;

  // Determine urgency level
  let urgencyLevel: 'immediate' | 'soon' | 'waiting' | 'relaxed' = 'relaxed';
  if (queuePosition === 1 || estimatedWaitMinutes <= 2) {
    urgencyLevel = 'immediate';
  } else if (queuePosition <= 3 || estimatedWaitMinutes <= 10) {
    urgencyLevel = 'soon';
  } else if (estimatedWaitMinutes <= 25) {
    urgencyLevel = 'waiting';
  }

  // Confidence score: higher when queue is shorter and baseline is established
  let confidenceScore = 0.95 - (safeAhead * 0.02);
  confidenceScore = Math.max(0.70, Math.min(0.98, confidenceScore));

  // Human-readable transparent explanation
  let explanation = '';
  if (safeAhead === 0 && !isCounterOccupied) {
    explanation = 'You are next in line! The counter is currently open and waiting for customers.';
  } else if (safeAhead === 0 && isCounterOccupied) {
    explanation = `You are next in line. Another customer is currently being served (~${Math.round(remainingCurrent)} min remaining).`;
  } else if (safeAhead === 1) {
    explanation = `1 customer ahead of you (~${safeAvg} min service duration). Counter is currently active.`;
  } else {
    explanation = `${safeAhead} customers ahead across ${safeCounters} active counter(s). Based on ~${safeAvg.toFixed(1)} mins/person rolling average.`;
  }

  return {
    queuePosition,
    customersAhead: safeAhead,
    estimatedWaitMinutes,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    explanation,
    urgencyLevel,
  };
}

export function formatWaitTimeDisplay(minutes: number): string {
  if (minutes <= 0) return '< 1 min';
  if (minutes === 1) return '1 min';
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}
