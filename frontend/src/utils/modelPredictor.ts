import * as tf from '@tensorflow/tfjs';

let model: tf.LayersModel | null = null;

// 모델 로드
export const loadModel = async (): Promise<tf.LayersModel> => {
  if (!model) {
    try {
      // 나중에 모델 파일 추가하면 이 경로 사용
      model = await tf.loadLayersModel('/models/tfjs_model/model.json');
      console.log('모델 로드 성공!');
    } catch (error) {
      console.error('모델 로드 실패:', error);
      throw error;
    }
  }
  return model;
};

// 텍스트 전처리 (임시 - 나중에 실제 전처리로 교체)
const preprocessText = (text: string): tf.Tensor => {
  // TODO: 실제 토크나이저 로직 추가
  // 지금은 임시로 랜덤 텐서 반환
  return tf.randomNormal([1, 100]);
};

// 예측 실행
export const predictStrategic = async (
  title: string,
  description: string,
  purpose: string,
  application: string
): Promise<{ isStrategic: boolean; confidence: number }> => {
  try {
    // 모델 로드
    const loadedModel = await loadModel();
    
    // 텍스트 결합
    const combinedText = `${title} ${description} ${purpose} ${application}`;
    
    // 전처리
    const inputTensor = preprocessText(combinedText);
    
    // 예측
    const prediction = loadedModel.predict(inputTensor) as tf.Tensor;
    const result = await prediction.data();
    
    // 정리
    inputTensor.dispose();
    prediction.dispose();
    
    const confidence = result[0] * 100;
    
    return {
      isStrategic: result[0] > 0.5,
      confidence: confidence
    };
  } catch (error) {
    console.error('예측 실패:', error);
    
    // 에러 시 임시 랜덤 결과 반환
    const randomConfidence = 50 + Math.random() * 40;
    return {
      isStrategic: Math.random() > 0.4,
      confidence: randomConfidence
    };
  }
};