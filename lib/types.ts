export interface Question {
  id: string;
  text: string;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[];
}

export interface Participant {
  id: string;
  name: string;
  phone: string | null;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export type SessionStatus = "in_progress" | "completed" | "failed";

export interface QASession {
  id: string;
  user_id: string;
  participant_id: string | null;
  status: SessionStatus;
  total_questions: number;
  correct_answers: number;
  points_donated: number;
  created_at: string;
  completed_at: string | null;
}

export interface SessionStatistics {
  session_id: string;
  user_id: string;
  participant_id: string | null;
  user_name: string;
  user_phone: string;
  participant_name: string | null;
  status: SessionStatus;
  total_questions: number;
  correct_answers: number;
  success_rate: number;
  points_donated: number;
  created_at: string;
  completed_at: string | null;
}

export interface SessionQuestion {
  id: string;
  session_id: string;
  question_id: string;
  answer_id: string | null;
  answered_at: string | null;
  created_at: string;
}

export interface LocalGamePrize {
  id: string;
  question_id: string;
  prize_amount: number;
  created_at: string;
  updated_at: string;
}

export interface LocalGamePrizeWithQuestion extends LocalGamePrize {
  question: Question;
}
