export interface KeyResult {
  id: number;
  objective_id: number;
  title: string;
  owner: string;
  target_value: number;
  current_value: number;
  unit: string;
}

export interface Objective {
  id: number;
  title: string;
  description: string;
  progress: number;
  deadline: string;
  created_at: string;
  key_results: KeyResult[];
}

export interface DailyUpdate {
  id: number;
  kr_id: number;
  value: number;
  comment: string;
  created_at: string;
  kr_title: string;
  kr_owner: string;
  kr_target: number;
  kr_unit: string;
  objective_title: string;
}
