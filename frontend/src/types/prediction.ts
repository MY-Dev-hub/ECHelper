export interface PredictionRequest {
  title: string;
  description: string;
  country?: string;
}

export interface PredictionResponse {
  label: 'Strategic' | 'Non-strategic';
  probabilityNonStrategic: number;
  probabilityStrategic: number;
  confidence: 'high' | 'medium' | 'low';
}