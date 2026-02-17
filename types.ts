
export type Semester = 'S1' | 'S2';

export interface Subject {
  id: string;
  name: string;
  coef: number;
  grade: number | null;
}

export interface YearLevel {
  id: string;
  label: string;
  subjects: { name: string; coef: number }[];
}

export interface EducationLevel {
  id: string;
  label: string;
  years: YearLevel[];
}

export interface AppState {
  levelId: string | null;
  yearId: string | null;
  semesters: {
    S1: Subject[];
    S2: Subject[];
  };
  currentSemester: Semester;
  isDarkMode: boolean;
}
