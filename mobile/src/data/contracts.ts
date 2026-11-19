import {
  Session,
  Participant,
  Study,
  Questionnaire,
  Submission,
  Receipt,
  Insight,
  CheckInTimes,
} from '../domain/models';
export interface EmaApi {
  signIn(email: string, password: string): Promise<Session>;
  restoreSession(token: string): Promise<Session>;
  signOut(token: string): Promise<void>;
  getStudy(token: string): Promise<Study>;
  getQuestionnaire(token: string, checkInId: string): Promise<Questionnaire>;
  submit(token: string, submission: Submission): Promise<Receipt>;
  setReminders(token: string, enabled: boolean): Promise<Participant>;
  setCheckInTimes(token: string, times: CheckInTimes): Promise<Participant>;
  getInsights(token: string): Promise<Insight[]>;
}
export interface SessionStore {
  read(): Promise<string | null>;
  write(token: string): Promise<void>;
  clear(): Promise<void>;
}
