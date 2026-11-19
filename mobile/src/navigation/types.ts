import { CheckIn, Receipt } from '../domain/models';
export type RootStackParams = {
  Welcome: undefined;
  Login: undefined;
  Main: undefined;
  Questionnaire: { checkIn: CheckIn };
  Confirmation: { checkIn: CheckIn; receipt: Receipt };
  Guide: undefined;
  Insights: undefined;
};
export type TabParams = { Home: undefined; Profile: undefined };
