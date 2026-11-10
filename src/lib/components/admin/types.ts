/** What an admin action reported back, whichever action it was. */
export interface AdminFeedback {
  action?: string;
  /** The household the action was about, when it was about one. */
  householdId?: number | null;
  message?: string;
  saved?: boolean;
  email?: string;
  errors?: Record<string, string[] | undefined>;
}
