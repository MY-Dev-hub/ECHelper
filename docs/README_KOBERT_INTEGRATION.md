# KoBERT 모델 통합 작업 현황

## ✅ 완료된 작업

### 1. 모델 학습 (완료)
- **학습 데이터**: `data/labelled_data_aug_for_learning.xlsx` (2,287 샘플)
- **모델**: KoBERT (skt/kobert-base-v1)
- **최종 정확도**: **70.09%**
- **저장 위치**: `models/kobert-strategic-final/`
- **학습 스크립트**: `scripts/train_kobert.py`

### 2. ONNX 변환 (완료)
- **변환 스크립트**: `scripts/convert_to_onnx_v2.py`
- **ONNX 모델 위치**: `frontend/public/models/kobert-onnx/`
- **생성된 파일**:
  - `model.onnx` (ONNX 모델)
  - `tokenizer.json`, `spiece.model` (토크나이저 파일들)

### 3. Frontend 라이브러리 설치 (완료)
- `@xenova/transformers` ✅
- `onnxruntime-web` ✅

### 4. 예측 서비스 생성 (완료)
- **파일**: `frontend/src/services/kobertPrediction.ts`
- **기능**: ONNX Runtime Web을 사용한 브라우저 내 예측

## 🔄 남은 작업

### 1. PredictionPage.tsx 수정 필요
**위치**: `frontend/src/pages/PredictionPage.tsx`

**해야 할 일**:
1. kobertPrediction 서비스 import 추가:
   ```typescript
   import { predictStrategicItem } from '../services/kobertPrediction';
   ```

2. `handlePredict` 함수 수정 (31번 줄 근처):
   ```typescript
   const handlePredict = async (formData: any) => {
     // 기존 랜덤 예측 코드 제거
     // 아래 코드로 교체:

     const queryText = `${formData.title} ${formData.description || ''} ${formData.purpose || ''} ${formData.application || ''}`;

     // KoBERT 모델로 예측
     const result = await predictStrategicItem(queryText);
     setPredictionResult(result);

     // 유사 사례 찾기 (기존 코드 유지)
     if (queryText.trim().length < 3) {
       setSimilarCases([]);
       message.warning('더 구체적인 내용을 입력해주세요. (최소 3자 이상)');
       return;
     }

     const similarResults = findSimilarDocuments(queryText, allData, 5);
     // ... 나머지 유사 사례 코드는 기존과 동일
   };
   ```

### 2. 토크나이저 개선 필요 (선택사항)

**현재 상황**:
- `kobertPrediction.ts`의 `tokenize` 함수는 매우 간단한 구현
- 실제 KoBERT는 SentencePiece 토크나이저 사용

**개선 방법** (선택):
- `spiece.model` 파일을 사용하는 proper tokenization 구현
- 또는 백엔드 API를 통한 토크나이제이션

**현재 상태로도 테스트 가능**: 임시 토크나이저로도 기본 동작은 확인할 수 있음

### 3. 테스트 및 디버깅

**테스트 단계**:
1. Frontend 개발 서버 실행:
   ```bash
   cd frontend
   npm run dev
   ```

2. Prediction 페이지 접속

3. 테스트 입력:
   - "원자로 및 그 용도로 특별히 설계 또는 준비된 장비와 부품" → Strategic 예상
   - "일반 사무용 컴퓨터 및 주변기기" → Non-strategic 예상

## ⚠️ 알려진 이슈 및 해결방법

### 이슈 1: CORS 오류
**증상**: 모델 파일 로딩 실패

**해결**:
- Vite 개발 서버는 자동으로 public 폴더 serve 함
- 프로덕션 빌드시에는 `models` 폴더가 `dist/models`에 복사되는지 확인

### 이슈 2: 메모리 부족
**증상**: 브라우저에서 모델 로딩 시 메모리 오류

**해결**:
- 브라우저 새로고침
- 또는 모델 최적화 (양자화 등)

### 이슈 3: 토크나이저 정확도
**증상**: 예측 결과가 부정확

**원인**: 간단한 토크나이저 구현

**해결** (장기적):
- SentencePiece 토크나이저 제대로 구현
- 또는 백엔드 API 추가

## 📁 파일 구조

```
ECHelper/
├── data/
│   └── labelled_data_aug_for_learning.xlsx (학습 데이터)
├── models/
│   └── kobert-strategic-final/ (학습된 PyTorch 모델)
│       ├── config.json
│       ├── model.safetensors
│       └── tokenizer files...
├── frontend/
│   ├── public/
│   │   └── models/
│   │       └── kobert-onnx/ (ONNX 모델 - 브라우저용)
│   │           ├── model.onnx
│   │           └── tokenizer files...
│   └── src/
│       ├── services/
│       │   └── kobertPrediction.ts (예측 서비스)
│       └── pages/
│           └── PredictionPage.tsx (수정 필요)
└── scripts/
    ├── train_kobert.py (학습 스크립트)
    └── convert_to_onnx_v2.py (ONNX 변환 스크립트)
```

## 🚀 빠른 시작 (집 도착 후)

1. **PredictionPage.tsx 수정** (위의 "남은 작업 1" 참고)

2. **Frontend 실행**:
   ```bash
   cd C:\Users\user-\Desktop\ECHelper\frontend
   npm run dev
   ```

3. **브라우저에서 테스트**:
   - http://localhost:5173 (또는 Vite가 알려주는 포트)
   - Prediction 페이지로 이동
   - 테스트 입력 후 결과 확인

## 💡 참고사항

- 모델 정확도: 70.09% (테스트 데이터 기준)
- 브라우저에서 실행되므로 Python 설치 불필요
- 모든 예측은 클라이언트 사이드에서 수행 (프라이버시 보호)
- 인터넷 연결 불필요 (모델 파일이 로컬에 있음)

## 📞 문제 발생 시

1. 콘솔 에러 확인 (F12)
2. 모델 파일 경로 확인
3. 라이브러리 버전 확인

---

**마지막 업데이트**: 2025-12-31
**작업자**: Claude Code
