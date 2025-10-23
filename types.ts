
export interface User {
  id: string;
  email: string;
  password?: string; // Optional because we remove it from client-side state
  plan: 'FREE' | 'PRO';
  analysisCount: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter';
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  };
}

export interface AnalysisResult {
  summary: string;
  keyInsights: string[];
  table: {
    headers: string[];
    data: (string | number)[][];
  };
  charts: ChartData[];
}

export interface SavedAnalysis {
  id: string;
  name: string;
  fileName: string;
  timestamp: string; // ISO string
  analysisResult: AnalysisResult;
}

export interface Job {
  id: string;
  fileName: string;
  status: 'parsing' | 'analyzing' | 'success' | 'error';
  error?: string | null;
  analysisId?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
