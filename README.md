# ECHelper v2

전략물자 판정 AI 시스템 - KoBERT 기반 전략물자 분류 및 유사 사례 검색

## 🎯 프로젝트 개요

ECHelper는 전략물자 여부를 AI로 자동 판정하고, 과거 유사 사례를 검색하는 웹 애플리케이션입니다.

### 주요 기능
- ✨ **AI 예측**: KoBERT 모델을 이용한 전략물자 분류 (정확도 70.09%)
- 🔍 **유사 사례 검색**: TF-IDF 알고리즘으로 과거 이력 검색
- 📊 **데이터 분석**: 국가별, 연도별 통계 및 시각화
- 🗺️ **지도 시각화**: 국가별 수출 현황 지도
- 📝 **데이터베이스**: 과거 수출 이력 관리

## 🏗️ 시스템 아키텍처

```
ECHelper/
├── frontend/          # React + TypeScript 프론트엔드
│   ├── src/
│   │   ├── pages/      # 페이지 컴포넌트
│   │   ├── components/ # 재사용 컴포넌트
│   │   ├── services/   # API 통신
│   │   └── utils/      # TF-IDF 등 유틸리티
│   └── public/
│
├── backend/           # FastAPI 백엔드
│   └── app.py         # KoBERT 예측 API 서버
│
├── scripts/           # 데이터 처리 및 모델 학습
│   ├── train_kobert.py          # KoBERT 학습
│   ├── convert_to_onnx_v2.py    # ONNX 변환
│   └── convert_excel_to_json.py # 데이터 변환
│
└── docs/              # 문서
    ├── ECHelper_완벽_가이드.md
    └── AI_모델_연동_완벽_분석.md
```

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/MY-Dev-hub/ECHelper.git
cd ECHelper
```

### 2. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

프론트엔드는 `http://localhost:5173`에서 실행됩니다.

### 3. 백엔드 실행 (선택사항 - AI 예측 사용 시)

#### 3.1 Python 환경 설정

```bash
# Python 3.8 이상 필요
pip install fastapi uvicorn torch transformers
```

#### 3.2 모델 학습

```bash
# 학습 데이터 준비 (data/labelled_data_aug_for_learning.xlsx)
cd scripts
python train_kobert.py
```

학습이 완료되면 `models/kobert-strategic-final/` 폴더에 모델이 저장됩니다.

#### 3.3 백엔드 서버 실행

```bash
cd backend
python app.py
```

백엔드는 `http://localhost:8000`에서 실행됩니다.

## 📚 기술 스택

### Frontend
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Ant Design** - UI 컴포넌트
- **Leaflet** - 지도 시각화
- **Chart.js** - 차트 시각화

### Backend
- **FastAPI** - 웹 프레임워크
- **PyTorch** - 딥러닝 프레임워크
- **Transformers** - KoBERT 모델
- **KoBERT** - SKT 한국어 BERT (skt/kobert-base-v1)

### AI/ML
- **KoBERT** - 전략물자 분류 (Fine-tuned)
- **TF-IDF** - 문서 유사도 검색
- **Cosine Similarity** - 유사도 계산

## 📖 문서

자세한 설명은 `docs/` 폴더를 참고하세요:

- **[ECHelper 완벽 가이드](docs/ECHelper_완벽_가이드.md)**
  - 프로젝트 전체 구조
  - 프론트엔드/백엔드 분리 이유
  - npm 사용법
  - 초보자 학습 가이드

- **[AI 모델 연동 완벽 분석](docs/AI_모델_연동_완벽_분석.md)**
  - KoBERT 학습 과정 상세 분석
  - 백엔드 예측 로직 (변수 추적)
  - TF-IDF 알고리즘 수학 공식
  - 전체 데이터 흐름

## 🎓 학습용 프로젝트

이 프로젝트는 다음을 배우는 데 적합합니다:

- ✅ React + TypeScript 기반 SPA 개발
- ✅ REST API 통신 (Frontend ↔ Backend)
- ✅ AI 모델 통합 (KoBERT Fine-tuning)
- ✅ TF-IDF 문서 검색 알고리즘
- ✅ 프론트엔드/백엔드 분리 아키텍처

## ⚙️ 환경 요구사항

- **Node.js**: 18.x 이상
- **Python**: 3.8 이상
- **RAM**: 최소 8GB (모델 학습 시 16GB 권장)
- **디스크**: 최소 5GB (모델 파일 포함)

## 📝 주요 페이지

- **Database** - 과거 수출 이력 조회/검색
- **Prediction** - AI 기반 전략물자 예측
- **Search** - 통제품목 검색
- **Analytics** - 통계 분석 및 시각화
- **Settings** - 시스템 설정

## 🤝 기여

이슈와 PR은 언제나 환영합니다!

## 📄 라이선스

MIT License

## 👥 제작

- **AI Model**: KoBERT (SKT)

---

**Version**: 2.0
**Last Updated**: 2026-01-01
