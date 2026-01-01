# ECHelper 웹 애플리케이션 완벽 가이드

## 📁 1. 프로젝트 전체 구조

```
ECHelper/
├── frontend/           # 프론트엔드 (사용자가 보는 화면)
│   ├── src/
│   │   ├── pages/      # 각 화면 (Database, Prediction, Search 등)
│   │   ├── components/ # 재사용 가능한 UI 조각들
│   │   ├── services/   # 백엔드와 통신하는 코드
│   │   └── utils/      # 유틸리티 함수들
│   ├── public/         # 정적 파일 (이미지, 데이터 등)
│   ├── package.json    # 프론트엔드 의존성 관리
│   └── index.html      # 진입점 HTML
│
├── backend/            # 백엔드 (AI 모델 서버)
│   └── app.py          # FastAPI 서버 (Python)
│
├── scripts/            # 데이터 처리 및 모델 학습 스크립트
│   ├── train_kobert.py
│   └── convert_to_onnx.py
│
├── models/             # 학습된 AI 모델
└── data/               # 데이터 파일
```

---

## 🤔 2. 왜 프론트엔드/백엔드를 나눴을까?

### 전통적인 HTML/CSS/JS 웹페이지의 한계

```html
<!-- 전통적인 방식: 모든 게 한 파일에 -->
<html>
<head>
  <style>/* CSS */</style>
</head>
<body>
  <div id="content">...</div>
  <script>
    // 모든 로직이 여기에
    // 복잡한 계산도 브라우저에서 직접
  </script>
</body>
</html>
```

**문제점:**
- 페이지가 복잡해지면 코드가 엉망이 됨
- AI 모델같은 무거운 작업은 브라우저에서 불가능
- 코드 재사용이 어려움
- 여러 명이 협업하기 어려움

### 프론트엔드/백엔드 분리의 장점

```
사용자 브라우저 (Frontend)          서버 (Backend)
    ┌─────────────┐                  ┌─────────────┐
    │  React App  │ ─── API 요청 ──→ │  FastAPI    │
    │  (UI 담당)  │ ←── JSON 응답 ─  │  (AI 모델)  │
    └─────────────┘                  └─────────────┘
```

**장점:**
1. **역할 분리**: UI는 프론트엔드, 복잡한 계산은 백엔드
2. **성능**: 무거운 AI 모델은 서버에서 실행
3. **보안**: 중요한 로직을 서버에 숨김
4. **확장성**: 프론트엔드와 백엔드를 독립적으로 개발/배포
5. **협업**: 디자이너는 프론트엔드, 데이터 과학자는 백엔드

---

## 🔧 3. npm이 필요한 이유

### HTML/CSS/JS만 사용했을 때
```html
<!-- 라이브러리를 일일이 다운로드하고 링크 -->
<script src="jquery-3.6.0.min.js"></script>
<script src="bootstrap.min.js"></script>
<script src="chart.js"></script>
<!-- 버전 관리? 수동으로... -->
```

### npm을 사용하면
```json
// package.json - 필요한 라이브러리 목록
{
  "dependencies": {
    "react": "^19.2.0",           // UI 라이브러리
    "axios": "^1.13.2",           // HTTP 통신
    "antd": "^6.1.1"              // UI 컴포넌트
  }
}
```

```bash
# 한 번에 모든 라이브러리 설치
npm install
```

**npm의 역할:**
1. **패키지 관리자**: 라이브러리들을 자동으로 다운로드/설치
2. **버전 관리**: 라이브러리 버전을 자동으로 관리
3. **의존성 해결**: A 라이브러리가 B를 필요로 하면 자동으로 설치
4. **빌드 도구**: TypeScript → JavaScript 변환, 코드 압축 등

**왜 필요한가?**
- React, TypeScript 같은 최신 기술은 브라우저가 직접 이해 못함
- npm이 코드를 "번역"해서 브라우저가 이해할 수 있는 형태로 변환

---

## 💻 4. 프로젝트의 핵심 코드 분석

### 4.1 프론트엔드 (React + TypeScript)

#### **main.tsx** - 앱의 시작점
```typescript
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// HTML의 <div id="root">에 React 앱을 삽입
createRoot(document.getElementById('root')!).render(
  <App />
)
```
**설명**: HTML에는 빈 `<div id="root">`만 있고, React가 여기에 전체 앱을 그림

---

#### **App.tsx** - 라우팅 설정
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* URL에 따라 다른 페이지 표시 */}
        <Route path="/database" element={<DatabasePage />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  );
};
```
**설명**:
- URL이 `/prediction`이면 PredictionPage 표시
- 페이지 새로고침 없이 화면 전환 (Single Page Application)

---

#### **PredictionPage.tsx** - 핵심 로직
```typescript
const PredictionPage = () => {
  // 상태 관리 (데이터 저장)
  const [predictionResult, setPredictionResult] = useState(null);
  const [similarCases, setSimilarCases] = useState([]);

  const handlePredict = async (formData) => {
    // 1. 사용자 입력을 텍스트로 조합
    const queryText = `${formData.title} ${formData.description}`;

    // 2. 백엔드 API 호출 (AI 예측)
    const result = await predictStrategicItem(queryText);
    setPredictionResult(result);

    // 3. 유사 사례 검색 (프론트엔드에서 실행)
    const similarResults = findSimilarDocuments(queryText, allData, 5);
    setSimilarCases(similarResults);
  };

  return (
    <div>
      {/* 컴포넌트 조립 */}
      <PredictionForm onPredict={handlePredict} />
      <PredictionResult result={predictionResult} />
      <SimilarCasesList cases={similarCases} />
    </div>
  );
};
```

**핵심 개념:**
- **useState**: 데이터가 변경되면 화면 자동 업데이트
- **async/await**: 백엔드 응답을 기다림
- **컴포넌트 조립**: 레고처럼 작은 컴포넌트를 조합

---

#### **kobertPrediction.ts** - 백엔드 통신
```typescript
const API_URL = 'http://localhost:8000';

export async function predictStrategicItem(text: string) {
  // 백엔드에 POST 요청
  const response = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })  // 데이터를 JSON으로 전송
  });

  const result = await response.json();  // JSON 응답을 객체로 변환
  return result;
}
```

**데이터 흐름:**
```
프론트엔드                    백엔드
"원자로 부품" ──────────→ FastAPI 서버
               (JSON)
                          ↓
                       AI 모델 분석
                          ↓
{ isStrategic: true, ←─────────┘
  confidence: 85.3% }
  (JSON)
```

---

### 4.2 백엔드 (Python + FastAPI)

#### **app.py** - AI 모델 서버
```python
from fastapi import FastAPI
from transformers import AutoModelForSequenceClassification, AutoTokenizer

app = FastAPI()

# 서버 시작 시 AI 모델 로드 (한 번만)
model = AutoModelForSequenceClassification.from_pretrained("../models/kobert-strategic-final")
tokenizer = AutoTokenizer.from_pretrained("../models/kobert-strategic-final")

# API 엔드포인트: /predict
@app.post("/predict")
def predict(request: PredictRequest):
    # 1. 텍스트를 숫자로 변환 (토크나이징)
    inputs = tokenizer(request.text, return_tensors="pt", max_length=128)

    # 2. AI 모델로 예측
    outputs = model(**inputs)
    probs = softmax(outputs.logits)

    # 3. 결과 반환
    is_strategic = probs[1] > 0.5  # 전략물자 확률
    confidence = probs[1] * 100

    return {
        "isStrategic": is_strategic,
        "confidence": confidence,
        "explanation": f"전략물자로 분류될 가능성이 {confidence:.1f}%입니다."
    }
```

**왜 백엔드에서 AI 모델 실행?**
1. **모델 크기**: KoBERT 모델은 수백 MB → 브라우저에서 로드 불가
2. **성능**: GPU를 사용한 빠른 연산
3. **보안**: 모델을 외부에 노출하지 않음

---

## 🎨 5. React와 컴포넌트 구조

### 전통적인 HTML vs React

#### 전통적인 방식
```html
<!-- 중복 코드가 많음 -->
<div class="card">
  <h3>카드 1</h3>
  <p>내용 1</p>
</div>
<div class="card">
  <h3>카드 2</h3>
  <p>내용 2</p>
</div>
```

#### React 방식
```typescript
// Card 컴포넌트 정의 (재사용 가능)
const Card = ({ title, content }) => (
  <div className="card">
    <h3>{title}</h3>
    <p>{content}</p>
  </div>
);

// 사용
<Card title="카드 1" content="내용 1" />
<Card title="카드 2" content="내용 2" />
```

**장점:**
- 코드 재사용
- 유지보수 쉬움
- 데이터가 변경되면 자동으로 UI 업데이트

---

## 🔄 6. 전체 데이터 흐름

```
1. 사용자 입력
   ↓
2. PredictionForm 컴포넌트
   ↓
3. handlePredict 함수
   ├─→ kobertPrediction.ts (fetch API)
   │   ↓
   │   백엔드 FastAPI (/predict 엔드포인트)
   │   ↓
   │   AI 모델 (KoBERT)
   │   ↓
   │   JSON 응답 반환
   │   ↓
   └─→ setPredictionResult (상태 업데이트)
       ↓
4. PredictionResult 컴포넌트 (화면 자동 업데이트)
```

---

## 📦 7. 주요 라이브러리 설명

### 프론트엔드
```json
{
  "react": "UI 라이브러리 - 컴포넌트 기반 개발",
  "react-router-dom": "페이지 라우팅 (URL 관리)",
  "antd": "UI 컴포넌트 라이브러리 (버튼, 테이블 등)",
  "axios": "HTTP 통신 (백엔드 API 호출)",
  "typescript": "JavaScript에 타입 추가 (버그 감소)",
  "vite": "빌드 도구 (TypeScript → JavaScript 변환)"
}
```

### 백엔드
```python
fastapi       # 현대적인 웹 프레임워크
transformers  # Hugging Face의 AI 모델 라이브러리
torch         # PyTorch (딥러닝 프레임워크)
uvicorn       # ASGI 서버 (FastAPI 실행)
```

---

## 🚀 8. 실행 과정

### 개발 환경 실행
```bash
# 1. 프론트엔드 실행
cd frontend
npm install          # 라이브러리 설치 (최초 1회)
npm run dev          # 개발 서버 시작 → http://localhost:5173

# 2. 백엔드 실행
cd backend
python app.py        # FastAPI 서버 시작 → http://localhost:8000
```

### npm run dev가 하는 일
1. TypeScript 코드를 JavaScript로 변환
2. 개발 서버 실행
3. 코드 변경 감지 → 자동 새로고침
4. 브라우저에서 접속 가능하도록 설정

---

## 🎯 9. 핵심 개념 정리

### HTML/CSS/JS vs React/TypeScript

| 구분 | 전통 방식 | 현대 방식 (ECHelper) |
|------|----------|---------------------|
| 구조 | 모든 코드가 한 파일 | 컴포넌트로 분리 |
| 데이터 변경 | 수동으로 DOM 조작 | 자동 UI 업데이트 |
| 타입 체크 | 없음 (런타임 에러) | TypeScript (개발 중 에러 감지) |
| 빌드 | 필요 없음 | npm run build (최적화) |
| 의존성 관리 | 수동 다운로드 | npm (자동) |

### 왜 복잡한 방식을 선택?

**간단한 프로젝트**: HTML/CSS/JS만으로 충분
**복잡한 프로젝트** (ECHelper 같은):
- 수십 개의 화면
- AI 모델 통합
- 실시간 데이터 업데이트
- 여러 명이 협업

→ **React/TypeScript + 프론트엔드/백엔드 분리 필수**

---

## 📚 10. 초보자를 위한 학습 순서

1. **HTML/CSS/JS 기초** ✓ (이미 완료)
2. **JavaScript 심화** (async/await, fetch API)
3. **React 기초** (컴포넌트, useState, useEffect)
4. **TypeScript 기초** (타입 시스템)
5. **Node.js와 npm** (패키지 관리)
6. **API 통신** (REST API, JSON)
7. **백엔드 기초** (FastAPI 또는 Express)

---

## 💡 요약

**ECHelper는:**
- **프론트엔드**: React + TypeScript로 사용자 화면 구성
- **백엔드**: Python FastAPI로 AI 모델 서버 운영
- **통신**: JSON 기반 REST API
- **빌드**: npm과 Vite로 개발 환경 구성

**왜 이렇게 만들었나?**
- AI 모델은 백엔드에서만 실행 가능
- 복잡한 UI는 React 컴포넌트로 관리
- TypeScript로 버그 최소화
- 프론트/백엔드 독립 개발 가능

초보자들에게 설명할 때는 **"레고 블록처럼 작은 컴포넌트를 조립하고, 무거운 계산은 서버에 맡긴다"** 는 비유를 사용하면 좋습니다!
