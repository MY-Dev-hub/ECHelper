// Backend API URL
const API_URL = 'http://localhost:8000';

// Predict function - now calls backend API
export async function predictStrategicItem(text: string): Promise<{
  isStrategic: boolean;
  confidence: number;
  eccn: string;
  classType: string;
  explanation: string;
}> {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Prediction error:', error);

    return {
      isStrategic: false,
      confidence: 0,
      eccn: 'Error',
      classType: 'Error',
      explanation: `백엔드 API 호출 중 오류 발생: ${error}`
    };
  }
}
