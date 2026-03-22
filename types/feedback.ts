/** Payload sent from the feedback widget to POST /api/feedback */
export interface FeedbackSubmitPayload {
  emoji: string | null;
  text: string;
  pageLabel: string;
  path: string;
}
