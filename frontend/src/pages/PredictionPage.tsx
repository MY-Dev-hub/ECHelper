import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Divider, message } from 'antd';  // 🔥 message 추가
import PredictionForm from '../components/prediction/PredictionForm';
import PredictionResult from '../components/prediction/PredictionResult';
import SimilarCasesList from '../components/prediction/SimilarCasesList';
import { findSimilarDocuments } from '../utils/tfidf';
import { predictStrategic } from '../utils/modelPredictor';

const { Title } = Typography;

const PredictionPage: React.FC = () => {
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [similarCases, setSimilarCases] = useState<any[]>([]);
  const [allData, setAllData] = useState<any[]>([]);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/export_history.json');
        const jsonData = await response.json();
        setAllData(jsonData);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      }
    };

    loadData();
  }, []);

 const handlePredict = async (formData: any) => {
  try {
    // 🔥 AI 모델로 예측
    const aiResult = await predictStrategic(
      formData.title,
      formData.description || '',
      formData.purpose || '',
      formData.application || ''
    );
    
    const result = {
      isStrategic: aiResult.isStrategic,
      confidence: aiResult.confidence,
      eccn: aiResult.isStrategic ? ['0A001', '0E001', '1C234', '2B231'][Math.floor(Math.random() * 4)] : 'N/A',
      classType: aiResult.isStrategic ? ['E1', 'E2', 'E3', 'A', 'B'][Math.floor(Math.random() * 5)] : 'N/A',
      explanation: aiResult.isStrategic 
        ? '입력된 내용을 분석한 결과, 원자력/방사선 관련 전략물자로 분류될 가능성이 높습니다.'
        : '입력된 내용을 분석한 결과, 일반 상업용 품목으로 비전략물자로 판단됩니다.',
    };
    
    setPredictionResult(result);
    
    // 유사 사례 검색 (기존 로직)
    const queryText = `${formData.title} ${formData.description || ''} ${formData.purpose || ''} ${formData.application || ''}`;
    
    if (queryText.trim().length < 3) {
      setSimilarCases([]);
      message.warning('더 구체적인 내용을 입력해주세요. (최소 3자 이상)');
      return;
    }
    
    const similarResults = findSimilarDocuments(queryText, allData, 5);
    const filteredResults = similarResults.filter(result => result.similarity > 0.05);
    
    if (filteredResults.length === 0) {
      setSimilarCases([]);
      message.info('유사한 과거 이력을 찾을 수 없습니다. 더 자세한 설명을 입력해보세요.');
      return;
    }
    
    const cases = filteredResults.map(result => ({
      ...allData[result.itemId],
      similarity: result.similarity,
      rank: filteredResults.indexOf(result) + 1
    }));
    
    setSimilarCases(cases);
    message.success(`${cases.length}개의 유사 사례를 찾았습니다.`);
    
  } catch (error) {
    console.error('예측 중 오류:', error);
    message.error('예측 중 오류가 발생했습니다.');
  }
};

  return (
    <div>
      <Title level={3}>Strategic Item Prediction</Title>

      <Row gutter={[16, 16]}>
        {/* 좌측: 입력 폼 */}
        <Col xs={24} lg={14}>
          <PredictionForm onPredict={handlePredict} />
        </Col>

        {/* 우측: 예측 결과 */}
        <Col xs={24} lg={10}>
          <PredictionResult result={predictionResult} />
        </Col>
      </Row>

      {/* 구분선 */}
      {similarCases.length > 0 && (
        <Divider style={{ margin: '22px 0' }} />
      )}

      {/* 하단: 유사 사례 */}
      {similarCases.length > 0 && (
        <div>
          <SimilarCasesList cases={similarCases} />
        </div>
      )}
    </div>
  );
};

export default PredictionPage;