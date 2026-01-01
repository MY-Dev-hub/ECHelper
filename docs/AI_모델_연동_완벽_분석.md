# ECHelper AI 모델 연동 완벽 분석

이 문서는 ECHelper 프로젝트에서 AI 모델이 어떻게 학습되고, 어떻게 프론트엔드와 백엔드에서 사용되는지를 **모든 변수와 함수의 연결**, **수학적 계산 과정**까지 포함하여 아주 자세히 설명합니다.

---

## 📋 목차
1. [전체 시스템 아키텍처](#1-전체-시스템-아키텍처)
2. [AI 모델 학습 과정 (train_kobert.py)](#2-ai-모델-학습-과정)
3. [백엔드 예측 서버 (app.py)](#3-백엔드-예측-서버)
4. [프론트엔드 통신 (kobertPrediction.ts)](#4-프론트엔드-통신)
5. [TF-IDF 유사 문서 검색 (tfidf.ts)](#5-tf-idf-유사-문서-검색)
6. [UI 렌더링 (PredictionPage.tsx → PredictionResult.tsx)](#6-ui-렌더링)
7. [전체 데이터 흐름 요약](#7-전체-데이터-흐름-요약)

---

## 1. 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                     사용자 브라우저                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │ PredictionPage.tsx                                  │     │
│  │   ├─ PredictionForm (사용자 입력 받기)             │     │
│  │   ├─ handlePredict() 함수 ──┬─────────────────┐   │     │
│  │   │                           │                 │   │     │
│  │   │                           ▼                 ▼   │     │
│  │   │              kobertPrediction.ts    tfidf.ts    │     │
│  │   │              (백엔드 API 호출)     (로컬 검색) │     │
│  │   │                    │                      │     │     │
│  │   └────────────────────┼──────────────────────┘     │     │
│  │                         │                            │     │
│  │   PredictionResult ◄───┴─ 결과 표시                 │     │
│  └────────────────────────────────────────────────────┘     │
└────────────────────────┬───────────────────────────────────┘
                         │ HTTP POST /predict
                         │ { text: "..." }
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   백엔드 서버 (Python)                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │ app.py (FastAPI)                                    │     │
│  │   ├─ /predict 엔드포인트                            │     │
│  │   ├─ tokenizer (텍스트 → 숫자)                     │     │
│  │   ├─ model (KoBERT) ───┐                           │     │
│  │   │                      │                          │     │
│  │   │      ┌───────────────┘                          │     │
│  │   │      ▼                                          │     │
│  │   │  [input_ids, attention_mask]                    │     │
│  │   │      │                                          │     │
│  │   │      ▼                                          │     │
│  │   │  Transformer Layers (12층)                      │     │
│  │   │      │                                          │     │
│  │   │      ▼                                          │     │
│  │   │  Classification Head                            │     │
│  │   │      │                                          │     │
│  │   │      ▼                                          │     │
│  │   │  logits [batch_size, 2]                         │     │
│  │   │      │                                          │     │
│  │   │      ▼                                          │     │
│  │   │  Softmax 함수                                   │     │
│  │   │      │                                          │     │
│  │   │      ▼                                          │     │
│  │   │  probs [0.15, 0.85] (확률)                      │     │
│  │   │                                                 │     │
│  │   └─ 결과 반환: { isStrategic, confidence, ... }   │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. AI 모델 학습 과정

### 파일: `scripts/train_kobert.py`

이 스크립트는 **KoBERT 모델을 전략물자 분류에 맞게 Fine-tuning**합니다.

---

### 2.1 데이터 로드 (1-33번 줄)

```python
# 25번 줄
df = pd.read_excel('../data/labelled_data_aug_for_learning.xlsx')

# 31-32번 줄: 데이터 추출
texts = df['data_total'].fillna('').astype(str).tolist()
labels = df['label'].tolist()
```

**변수 설명:**
- `df`: 판다스 DataFrame (엑셀 파일 내용)
  - 컬럼: `data_total` (텍스트 데이터), `label` (0 또는 1)
  - 0 = 비전략물자, 1 = 전략물자
- `texts`: 문자열 리스트 (예: ["원자로 부품", "일반 컴퓨터", ...])
- `labels`: 정수 리스트 (예: [1, 0, 1, ...])

---

### 2.2 데이터 분할 (36-40번 줄)

```python
train_texts, val_texts, train_labels, val_labels = train_test_split(
    texts, labels, test_size=0.2, random_state=42, stratify=labels
)
```

**설명:**
- 전체 데이터의 80%를 훈련용, 20%를 검증용으로 분할
- `stratify=labels`: 각 클래스(0, 1)의 비율을 유지하며 분할
- `random_state=42`: 재현 가능한 랜덤 분할

**변수:**
- `train_texts`: 훈련용 텍스트 (약 1,830개)
- `val_texts`: 검증용 텍스트 (약 457개)
- `train_labels`: 훈련용 라벨
- `val_labels`: 검증용 라벨

---

### 2.3 KoBERT 모델 및 토크나이저 로드 (44-51번 줄)

```python
model_name = "skt/kobert-base-v1"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(
    model_name,
    num_labels=2  # 0: 비전략물자, 1: 전략물자
)
```

**KoBERT 모델 구조:**
```
Input: "원자로 부품"
  ↓
Tokenizer: [2, 1234, 5678, 3]  (숫자로 변환)
  ↓
Embedding Layer: 각 숫자를 768차원 벡터로 변환
  ↓
Transformer Encoder (12층):
  - Self-Attention: 단어 간 관계 학습
  - Feed-Forward: 비선형 변환
  ↓
Classification Head: 768차원 → 2차원 (2개 클래스)
  ↓
Output: logits [batch_size, 2]
```

**변수:**
- `tokenizer`: 텍스트를 숫자(토큰)로 변환하는 도구
- `model`: KoBERT 신경망 모델 (약 1억 개의 파라미터)

---

### 2.4 Dataset 클래스 생성 (54-71번 줄)

```python
class StrategicItemDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=128):
        # 모든 텍스트를 한 번에 토크나이징
        self.encodings = tokenizer(
            texts,
            truncation=True,      # 128자 넘으면 자르기
            padding=True,         # 짧으면 패딩 추가
            max_length=max_length,
            return_tensors='pt'   # PyTorch 텐서로 반환
        )
        self.labels = labels

    def __getitem__(self, idx):
        # idx번째 샘플 반환
        item = {key: val[idx] for key, val in self.encodings.items()
                if key != 'token_type_ids'}
        item['labels'] = torch.tensor(self.labels[idx])
        return item
```

**토크나이징 과정 예시:**

```python
# 입력 텍스트
text = "원자로 부품"

# 토크나이징 결과
{
    'input_ids': tensor([  2, 1234, 5678, 3, 0, 0, ..., 0]),  # 128개
    'attention_mask': tensor([1, 1, 1, 1, 0, 0, ..., 0])      # 128개
}
```

**변수 설명:**
- `input_ids`: 토큰 ID (2=시작, 3=끝, 0=패딩)
- `attention_mask`: 실제 토큰은 1, 패딩은 0
- `labels`: 정답 라벨 (0 또는 1)

---

### 2.5 학습 설정 (83-96번 줄)

```python
training_args = TrainingArguments(
    output_dir='../models/kobert-strategic',
    num_train_epochs=3,                    # 3번 반복 학습
    per_device_train_batch_size=16,        # 한 번에 16개씩
    warmup_steps=100,                      # 처음 100스텝은 학습률 증가
    weight_decay=0.01,                     # 과적합 방지
    evaluation_strategy="epoch",           # 에포크마다 평가
)
```

**학습 과정:**
```
에포크 1:
  스텝 1-114: 배치 1-114 학습 (1,830개 / 16 ≈ 114)
  검증: 정확도 계산
에포크 2:
  스텝 115-228: 다시 처음부터 학습
  검증: 정확도 계산
에포크 3:
  스텝 229-342: 마지막 학습
  검증: 정확도 계산 → 최종 70.09%
```

---

### 2.6 학습 실행 (117번 줄)

```python
trainer.train()
```

**내부에서 일어나는 일:**

```python
for epoch in range(3):
    for batch in train_dataloader:
        # 1. Forward pass
        outputs = model(
            input_ids=batch['input_ids'],
            attention_mask=batch['attention_mask'],
            labels=batch['labels']
        )

        # outputs.loss: Cross-Entropy Loss 계산
        # loss = -log(P(정답 클래스))

        # 2. Backward pass
        loss.backward()  # 그래디언트 계산

        # 3. 파라미터 업데이트
        optimizer.step()  # 가중치 조정
        optimizer.zero_grad()
```

**Loss 계산 예시:**
```
예측: [0.2, 0.8]  (비전략물자 20%, 전략물자 80%)
정답: 1 (전략물자)

Cross-Entropy Loss = -log(0.8) = 0.223

만약 예측이 틀렸다면:
예측: [0.9, 0.1]
정답: 1
Loss = -log(0.1) = 2.303 (높은 손실)
```

---

### 2.7 모델 저장 (128-131번 줄)

```python
final_model_dir = '../models/kobert-strategic-final'
model.save_pretrained(final_model_dir)
tokenizer.save_pretrained(final_model_dir)
```

**저장되는 파일:**
- `config.json`: 모델 설정
- `model.safetensors`: 학습된 가중치 (약 400MB)
- `tokenizer_config.json`: 토크나이저 설정
- `vocab.txt`: 단어 사전 (약 8,000개 단어)

---

## 3. 백엔드 예측 서버

### 파일: `backend/app.py`

---

### 3.1 모델 로드 (19-25번 줄)

```python
model_path = "../models/kobert-strategic-final"
model = AutoModelForSequenceClassification.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)
model.eval()  # 평가 모드 (Dropout 비활성화)
```

**서버 시작 시 1회 실행:**
- 모델을 메모리에 로드 (약 400MB RAM 사용)
- GPU가 있으면 GPU로, 없으면 CPU로 실행

---

### 3.2 예측 엔드포인트 (32-93번 줄)

#### 입력 데이터 구조 (28-29번 줄)

```python
class PredictRequest(BaseModel):
    text: str  # 예: "원자로 부품 및 냉각 시스템"
```

#### 함수 호출 흐름

```
클라이언트 요청:
POST http://localhost:8000/predict
Body: { "text": "원자로 부품" }
  ↓
FastAPI: PredictRequest 객체 생성
  ↓
predict(request) 함수 실행
```

---

#### 3.2.1 토크나이징 (36-42번 줄)

```python
inputs = tokenizer(
    request.text,
    return_tensors="pt",      # PyTorch 텐서로 반환
    max_length=128,
    padding="max_length",      # 항상 128로 패딩
    truncation=True
)
```

**예시: "원자로 부품" 토크나이징**

```python
# 입력
request.text = "원자로 부품"

# 출력 (inputs 딕셔너리)
{
    'input_ids': tensor([[2, 1234, 5678, 3, 0, 0, ..., 0]]),  # shape: [1, 128]
    'attention_mask': tensor([[1, 1, 1, 1, 0, 0, ..., 0]]),   # shape: [1, 128]
    'token_type_ids': tensor([[0, 0, 0, 0, 0, 0, ..., 0]])    # (사용 안 함)
}
```

**변수 설명:**
- `input_ids`: 각 토큰의 ID (정수)
  - 2: [CLS] 토큰 (시작)
  - 1234: "원자로"의 ID
  - 5678: "부품"의 ID
  - 3: [SEP] 토큰 (끝)
  - 0: [PAD] 토큰 (패딩)

- `attention_mask`: 어느 토큰이 실제 단어인지 표시
  - 1: 실제 토큰
  - 0: 패딩 (무시)

---

#### 3.2.2 모델 예측 (45-58번 줄)

```python
with torch.no_grad():  # 그래디언트 계산 안 함 (예측만)
    # 필요한 입력만 추출
    model_inputs = {
        'input_ids': inputs['input_ids'],
        'attention_mask': inputs['attention_mask']
    }

    # 모델 실행
    outputs = model(**model_inputs)
    logits = outputs.logits  # shape: [1, 2]

    # Softmax로 확률 계산
    probs = F.softmax(logits, dim=1)[0]
    prob_non_strategic = probs[0].item()  # 비전략물자 확률
    prob_strategic = probs[1].item()      # 전략물자 확률
```

**모델 내부 계산 과정:**

```
Input: input_ids [1, 128], attention_mask [1, 128]
  ↓
Embedding Layer: [1, 128] → [1, 128, 768]
  (각 토큰을 768차원 벡터로)
  ↓
Transformer Layer 1-12: [1, 128, 768] → [1, 128, 768]
  각 층마다:
    1. Self-Attention: 단어 간 관계 계산
    2. Feed-Forward: 비선형 변환
  ↓
Pooling: [1, 128, 768] → [1, 768]
  (첫 번째 토큰 [CLS]의 벡터만 추출)
  ↓
Classification Head: [1, 768] → [1, 2]
  Linear(768, 2): 가중치 행렬 곱셈
  ↓
Logits: [1, 2]
  예: [[-2.5, 3.2]]
```

---

#### 3.2.3 Softmax 계산 (수학)

```python
probs = F.softmax(logits, dim=1)[0]
```

**Softmax 공식:**

```
logits = [logit_0, logit_1]

P(class_i) = exp(logit_i) / (exp(logit_0) + exp(logit_1))
```

**구체적 계산 예시:**

```python
# logits (모델 원시 출력)
logits = [[-2.5, 3.2]]

# Softmax 계산
exp_0 = exp(-2.5) = 0.0821
exp_1 = exp(3.2) = 24.53

sum_exp = 0.0821 + 24.53 = 24.61

prob_0 = 0.0821 / 24.61 = 0.0033 (0.33%)
prob_1 = 24.53 / 24.61 = 0.9967 (99.67%)
```

**결과:**
```python
probs = [0.0033, 0.9967]
prob_non_strategic = 0.0033  # 0.33%
prob_strategic = 0.9967      # 99.67%
```

---

#### 3.2.4 결과 반환 (61-84번 줄)

```python
# 전략물자 여부 판단
is_strategic = prob_strategic > 0.5
confidence = prob_strategic if is_strategic else prob_non_strategic

# 임시 ECCN/Class (랜덤)
import random
eccn = random.choice(['0A001', '0E001', '1C234', '2B231']) if is_strategic else 'N/A'
class_type = random.choice(['E1', 'E2', 'E3', 'A', 'B']) if is_strategic else 'N/A'

# 설명 생성
explanation = (
    f"KoBERT 분석 결과, 전략물자로 분류될 가능성이 {confidence*100:.1f}%입니다."
    if is_strategic
    else f"KoBERT 분석 결과, 일반 상업용 품목으로 판단됩니다. (신뢰도: {confidence*100:.1f}%)"
)

# JSON 반환
return {
    "isStrategic": is_strategic,    # True or False
    "confidence": confidence * 100,  # 99.67
    "eccn": eccn,                    # "1C234"
    "classType": class_type,         # "E2"
    "explanation": explanation       # "KoBERT 분석 결과..."
}
```

**반환 예시:**
```json
{
  "isStrategic": true,
  "confidence": 99.67,
  "eccn": "1C234",
  "classType": "E2",
  "explanation": "KoBERT 분석 결과, 전략물자로 분류될 가능성이 99.7%입니다."
}
```

---

## 4. 프론트엔드 통신

### 파일: `frontend/src/services/kobertPrediction.ts`

---

### 4.1 API 호출 함수 (5-38번 줄)

```typescript
const API_URL = 'http://localhost:8000';

export async function predictStrategicItem(text: string): Promise<{
  isStrategic: boolean;
  confidence: number;
  eccn: string;
  classType: string;
  explanation: string;
}> {
  // 백엔드에 HTTP POST 요청
  const response = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text })  // { text: "원자로 부품" }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  // JSON 응답을 객체로 파싱
  const result = await response.json();
  return result;
}
```

**호출 예시:**

```typescript
// PredictionPage.tsx에서 호출
const queryText = "원자로 부품 및 냉각 시스템";
const result = await predictStrategicItem(queryText);

// result 변수에 저장된 값
{
  isStrategic: true,
  confidence: 99.67,
  eccn: "1C234",
  classType: "E2",
  explanation: "KoBERT 분석 결과..."
}
```

---

## 5. TF-IDF 유사 문서 검색

### 파일: `frontend/src/utils/tfidf.ts`

이 파일은 **사용자 쿼리와 과거 데이터 중 가장 유사한 문서를 찾는** 기능을 담당합니다.

---

### 5.1 토크나이징 (9-20번 줄)

```typescript
export const tokenize = (text: string): string[] => {
  if (!text) return [];

  // 한글, 영문, 숫자만 추출
  const cleaned = text.toLowerCase()
    .replace(/[^\wㄱ-ㅎ가-힣a-z0-9\s]/g, ' ');

  // 공백으로 분리
  const tokens = cleaned.split(/\s+/).filter(t => t.length > 1);

  return tokens;
};
```

**예시:**

```typescript
// 입력
text = "원자로 부품 및 냉각 시스템!!!"

// 과정
1. 소문자 변환: "원자로 부품 및 냉각 시스템!!!"
2. 특수문자 제거: "원자로 부품 및 냉각 시스템   "
3. 분리: ["원자로", "부품", "및", "냉각", "시스템"]
4. 길이 필터 (>1): ["원자로", "부품", "및", "냉각", "시스템"]

// 출력
["원자로", "부품", "및", "냉각", "시스템"]
```

---

### 5.2 불용어 제거 (23-33번 줄)

```typescript
const stopWords = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', ...
  '이', '그', '저', '것', '수', '등', '및', ...
]);

export const removeStopWords = (tokens: string[]): string[] => {
  return tokens.filter(token => !stopWords.has(token));
};
```

**예시:**

```typescript
// 입력
tokens = ["원자로", "부품", "및", "냉각", "시스템"]

// "및"은 불용어
removeStopWords(tokens)

// 출력
["원자로", "부품", "냉각", "시스템"]
```

---

### 5.3 TF (Term Frequency) 계산 (36-50번 줄)

```typescript
export const calculateTF = (tokens: string[]): Map<string, number> => {
  const tf = new Map<string, number>();
  const totalTerms = tokens.length;

  // 각 단어 빈도 계산
  tokens.forEach(token => {
    tf.set(token, (tf.get(token) || 0) + 1);
  });

  // 정규화 (빈도 / 전체 단어 수)
  tf.forEach((count, term) => {
    tf.set(term, count / totalTerms);
  });

  return tf;
};
```

**TF 공식:**
```
TF(단어) = 문서 내 단어 등장 횟수 / 문서의 전체 단어 수
```

**예시:**

```typescript
// 입력
tokens = ["원자로", "부품", "원자로", "시스템"]
totalTerms = 4

// 빈도 계산
"원자로": 2번
"부품": 1번
"시스템": 1번

// 정규화
TF("원자로") = 2/4 = 0.5
TF("부품") = 1/4 = 0.25
TF("시스템") = 1/4 = 0.25

// 출력
Map {
  "원자로" => 0.5,
  "부품" => 0.25,
  "시스템" => 0.25
}
```

---

### 5.4 IDF (Inverse Document Frequency) 계산 (53-73번 줄)

```typescript
export const calculateIDF = (documents: string[][]): Map<string, number> => {
  const idf = new Map<string, number>();
  const totalDocs = documents.length;

  // 각 단어가 몇 개 문서에 등장하는지 계산
  const docFrequency = new Map<string, number>();

  documents.forEach(doc => {
    const uniqueTerms = new Set(doc);
    uniqueTerms.forEach(term => {
      docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
    });
  });

  // IDF = log(전체 문서 수 / 단어가 등장한 문서 수)
  docFrequency.forEach((freq, term) => {
    idf.set(term, Math.log(totalDocs / freq));
  });

  return idf;
};
```

**IDF 공식:**
```
IDF(단어) = log(전체 문서 수 / 단어가 등장한 문서 수)
```

**예시:**

```typescript
// 입력: 3개 문서
documents = [
  ["원자로", "부품"],      // 문서 1
  ["원자로", "시스템"],    // 문서 2
  ["컴퓨터", "부품"]       // 문서 3
]
totalDocs = 3

// 문서 빈도 계산
"원자로": 2개 문서에 등장 (문서 1, 2)
"부품": 2개 문서에 등장 (문서 1, 3)
"시스템": 1개 문서에 등장 (문서 2)
"컴퓨터": 1개 문서에 등장 (문서 3)

// IDF 계산
IDF("원자로") = log(3/2) = log(1.5) = 0.405
IDF("부품") = log(3/2) = 0.405
IDF("시스템") = log(3/1) = log(3) = 1.099
IDF("컴퓨터") = log(3/1) = 1.099

// 출력
Map {
  "원자로" => 0.405,
  "부품" => 0.405,
  "시스템" => 1.099,
  "컴퓨터" => 1.099
}
```

**의미:**
- IDF가 낮음 (0.405): 많은 문서에 등장 → 일반적인 단어
- IDF가 높음 (1.099): 적은 문서에 등장 → 특별한 단어

---

### 5.5 TF-IDF 계산 (76-88번 줄)

```typescript
export const calculateTFIDF = (
  tf: Map<string, number>,
  idf: Map<string, number>
): Map<string, number> => {
  const tfidf = new Map<string, number>();

  tf.forEach((tfValue, term) => {
    const idfValue = idf.get(term) || 0;
    tfidf.set(term, tfValue * idfValue);
  });

  return tfidf;
};
```

**TF-IDF 공식:**
```
TF-IDF(단어) = TF(단어) × IDF(단어)
```

**예시:**

```typescript
// 입력
tf = Map {
  "원자로" => 0.5,
  "부품" => 0.25
}

idf = Map {
  "원자로" => 0.405,
  "부품" => 0.405
}

// 계산
TF-IDF("원자로") = 0.5 × 0.405 = 0.2025
TF-IDF("부품") = 0.25 × 0.405 = 0.1013

// 출력
Map {
  "원자로" => 0.2025,
  "부품" => 0.1013
}
```

---

### 5.6 코사인 유사도 계산 (91-116번 줄)

```typescript
export const cosineSimilarity = (
  vec1: Map<string, number>,
  vec2: Map<string, number>
): number => {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  const allTerms = new Set([...vec1.keys(), ...vec2.keys()]);

  allTerms.forEach(term => {
    const v1 = vec1.get(term) || 0;
    const v2 = vec2.get(term) || 0;

    dotProduct += v1 * v2;
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  });

  if (norm1 === 0 || norm2 === 0) return 0;

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};
```

**코사인 유사도 공식:**

```
            A · B
cos(θ) = ─────────
          |A| |B|

A · B = Σ(a_i × b_i)  (내적)
|A| = √(Σ a_i²)       (크기)
```

**예시:**

```typescript
// 두 문서의 TF-IDF 벡터
vec1 = Map {  // 쿼리: "원자로 부품"
  "원자로" => 0.3,
  "부품" => 0.2
}

vec2 = Map {  // 문서 1: "원자로 시스템"
  "원자로" => 0.4,
  "시스템" => 0.1
}

// 모든 단어: ["원자로", "부품", "시스템"]
// 벡터로 표현:
// vec1 = [0.3, 0.2, 0]
// vec2 = [0.4, 0, 0.1]

// 내적 계산
dotProduct = (0.3×0.4) + (0.2×0) + (0×0.1)
           = 0.12 + 0 + 0
           = 0.12

// 크기 계산
norm1 = √(0.3² + 0.2² + 0²) = √(0.09 + 0.04) = √0.13 = 0.361
norm2 = √(0.4² + 0² + 0.1²) = √(0.16 + 0.01) = √0.17 = 0.412

// 코사인 유사도
similarity = 0.12 / (0.361 × 0.412)
           = 0.12 / 0.149
           = 0.806  (80.6%)

// 출력
0.806
```

**의미:**
- 1.0: 완전히 동일
- 0.8: 매우 유사
- 0.5: 어느 정도 유사
- 0.0: 전혀 다름

---

### 5.7 유사 문서 검색 메인 함수 (119-163번 줄)

```typescript
export const findSimilarDocuments = (
  query: string,
  documents: any[],
  topN: number = 5
): TFIDFResult[] => {
  // 1. 쿼리 토크나이징
  const queryTokens = removeStopWords(tokenize(query));

  // 2. 모든 문서 토크나이징
  const documentTexts = documents.map(doc => {
    const combined = `${doc.title || ''} ${doc.description || ''} ${doc.purpose || ''} ${doc.application || ''}`;
    return removeStopWords(tokenize(combined));
  });

  // 3. IDF 계산 (전체 문서 기준)
  const idf = calculateIDF([queryTokens, ...documentTexts]);

  // 4. 쿼리 TF-IDF 계산
  const queryTF = calculateTF(queryTokens);
  const queryTFIDF = calculateTFIDF(queryTF, idf);

  // 5. 각 문서와 유사도 계산
  const similarities: TFIDFResult[] = documents.map((doc, index) => {
    const docTokens = documentTexts[index];
    const docTF = calculateTF(docTokens);
    const docTFIDF = calculateTFIDF(docTF, idf);

    const similarity = cosineSimilarity(queryTFIDF, docTFIDF);

    return {
      itemId: index,
      similarity: similarity
    };
  });

  // 6. 유사도 순으로 정렬하고 상위 N개 반환
  return similarities
    .filter(s => s.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
};
```

**전체 과정 예시:**

```typescript
// 입력
query = "원자로 냉각 시스템"
documents = [
  { title: "원자로 부품", description: "냉각 장치" },     // 문서 0
  { title: "컴퓨터", description: "메모리" },             // 문서 1
  { title: "원자로", description: "시스템 설계" }         // 문서 2
]

// 1. 쿼리 토크나이징
queryTokens = ["원자로", "냉각", "시스템"]

// 2. 문서 토크나이징
documentTexts = [
  ["원자로", "부품", "냉각", "장치"],    // 문서 0
  ["컴퓨터", "메모리"],                   // 문서 1
  ["원자로", "시스템", "설계"]           // 문서 2
]

// 3. IDF 계산
idf = {
  "원자로": log(4/3) = 0.288,  // 쿼리 + 문서 0, 2
  "냉각": log(4/2) = 0.693,    // 쿼리 + 문서 0
  "시스템": log(4/2) = 0.693,  // 쿼리 + 문서 2
  "부품": log(4/1) = 1.386,
  "장치": log(4/1) = 1.386,
  "컴퓨터": log(4/1) = 1.386,
  "메모리": log(4/1) = 1.386,
  "설계": log(4/1) = 1.386
}

// 4. 쿼리 TF-IDF
queryTF = { "원자로": 1/3, "냉각": 1/3, "시스템": 1/3 }
queryTFIDF = {
  "원자로": 0.096,
  "냉각": 0.231,
  "시스템": 0.231
}

// 5. 각 문서 TF-IDF 및 유사도
문서 0 TF-IDF: { "원자로": 0.072, "부품": 0.347, "냉각": 0.173, "장치": 0.347 }
유사도 0: cos(query, doc0) = 0.78  (높음!)

문서 1 TF-IDF: { "컴퓨터": 0.693, "메모리": 0.693 }
유사도 1: cos(query, doc1) = 0.0  (낮음!)

문서 2 TF-IDF: { "원자로": 0.096, "시스템": 0.231, "설계": 0.462 }
유사도 2: cos(query, doc2) = 0.85  (매우 높음!)

// 6. 정렬 및 반환
[
  { itemId: 2, similarity: 0.85 },
  { itemId: 0, similarity: 0.78 }
]
```

---

## 6. UI 렌더링

### 파일: `frontend/src/pages/PredictionPage.tsx`

---

### 6.1 상태 관리 (12-14번 줄)

```typescript
const [predictionResult, setPredictionResult] = useState<any>(null);
const [similarCases, setSimilarCases] = useState<any[]>([]);
const [allData, setAllData] = useState<any[]>([]);
```

**변수 설명:**
- `predictionResult`: 백엔드로부터 받은 예측 결과
- `similarCases`: TF-IDF로 찾은 유사 문서들
- `allData`: export_history.json의 모든 과거 데이터

---

### 6.2 handlePredict 함수 (31-73번 줄)

```typescript
const handlePredict = async (formData: any) => {
  // 1. 쿼리 텍스트 생성
  const queryText = `${formData.title} ${formData.description || ''} ${formData.purpose || ''} ${formData.application || ''}`;

  // 2. KoBERT 모델로 예측
  try {
    const result = await predictStrategicItem(queryText);
    setPredictionResult(result);  // 상태 업데이트 → UI 자동 렌더링
  } catch (error) {
    console.error('Prediction error:', error);
    message.error('예측 중 오류가 발생했습니다.');
  }

  // 3. 유사 사례 찾기
  if (queryText.trim().length < 3) {
    setSimilarCases([]);
    message.warning('더 구체적인 내용을 입력해주세요.');
    return;
  }

  const similarResults = findSimilarDocuments(queryText, allData, 5);
  const filteredResults = similarResults.filter(result => result.similarity > 0.05);

  const cases = filteredResults.map(result => ({
    ...allData[result.itemId],
    similarity: result.similarity,
    rank: filteredResults.indexOf(result) + 1
  }));

  setSimilarCases(cases);  // 상태 업데이트
  message.success(`${cases.length}개의 유사 사례를 찾았습니다.`);
};
```

**변수 흐름:**

```
1. 사용자 입력 (PredictionForm)
   formData = {
     title: "원자로 부품",
     description: "냉각 시스템",
     purpose: "발전소 사용",
     application: ""
   }

2. queryText 생성
   queryText = "원자로 부품 냉각 시스템 발전소 사용 "

3. 백엔드 API 호출
   result = {
     isStrategic: true,
     confidence: 99.67,
     eccn: "1C234",
     classType: "E2",
     explanation: "..."
   }

4. TF-IDF 검색
   similarResults = [
     { itemId: 42, similarity: 0.85 },
     { itemId: 17, similarity: 0.72 }
   ]

5. 상세 정보 추가
   cases = [
     {
       ...allData[42],  // 원래 문서 정보
       similarity: 0.85,
       rank: 1
     },
     {
       ...allData[17],
       similarity: 0.72,
       rank: 2
     }
   ]

6. 상태 업데이트
   setPredictionResult(result)  → PredictionResult 컴포넌트 렌더링
   setSimilarCases(cases)        → SimilarCasesList 컴포넌트 렌더링
```

---

### 6.3 PredictionResult 컴포넌트

### 파일: `frontend/src/components/prediction/PredictionResult.tsx`

```typescript
const PredictionResult: React.FC<PredictionResultProps> = ({ result }) => {
  if (!result) {
    return <Empty />;  // 결과 없으면 빈 화면
  }

  return (
    <Card title="예측 결과">
      {/* 전략물자 여부 표시 */}
      <Tag color={result.isStrategic ? 'red' : 'green'}>
        {result.isStrategic ? '전략물자' : '비전략물자'}
      </Tag>

      {/* 신뢰도 Progress Bar */}
      <Progress percent={result.confidence} />

      {/* 상세 정보 */}
      <Descriptions>
        <Descriptions.Item label="ECCN">
          {result.eccn}
        </Descriptions.Item>
        <Descriptions.Item label="설명">
          {result.explanation}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
```

**렌더링 예시:**

```
입력: result = {
  isStrategic: true,
  confidence: 99.67,
  eccn: "1C234",
  explanation: "KoBERT 분석 결과..."
}

출력 (화면):
┌─────────────────────────────────┐
│ 예측 결과                        │
├─────────────────────────────────┤
│ [전략물자] 🔴                    │
│                                  │
│ 신뢰도: ███████████░ 99.7%      │
│                                  │
│ ECCN: 1C234                      │
│ 설명: KoBERT 분석 결과...        │
└─────────────────────────────────┘
```

---

## 7. 전체 데이터 흐름 요약

### 7.1 시간순 흐름

```
[T0] 사용자가 "원자로 부품"을 입력하고 버튼 클릭
  ↓
[T1] PredictionForm → handlePredict() 호출
  변수: formData = { title: "원자로 부품", description: "..." }
  ↓
[T2] queryText 생성
  변수: queryText = "원자로 부품 냉각 시스템"
  ↓
[T3] predictStrategicItem(queryText) 호출 (kobertPrediction.ts)
  ↓
[T4] HTTP POST → 백엔드 (http://localhost:8000/predict)
  Body: { text: "원자로 부품 냉각 시스템" }
  ↓
[T5] 백엔드: tokenizer(text)
  변수: inputs = {
    input_ids: [[2, 1234, 5678, ...]],
    attention_mask: [[1, 1, 1, ...]]
  }
  ↓
[T6] 백엔드: model(inputs)
  변수: logits = [[-2.5, 3.2]]
  ↓
[T7] 백엔드: softmax(logits)
  변수: probs = [0.0033, 0.9967]
  ↓
[T8] 백엔드: JSON 응답 반환
  {
    isStrategic: true,
    confidence: 99.67,
    eccn: "1C234",
    ...
  }
  ↓
[T9] 프론트엔드: setPredictionResult(result)
  → React 상태 업데이트
  ↓
[T10] PredictionResult 컴포넌트 자동 리렌더링
  → 화면에 결과 표시
  ↓
[T11] 동시에 findSimilarDocuments(queryText, allData, 5) 실행
  ↓
[T12] TF-IDF 계산 및 코사인 유사도 계산
  변수: similarities = [{ itemId: 42, similarity: 0.85 }, ...]
  ↓
[T13] setSimilarCases(cases)
  → React 상태 업데이트
  ↓
[T14] SimilarCasesList 컴포넌트 자동 리렌더링
  → 화면에 유사 사례 표시
```

---

### 7.2 핵심 변수 추적표

| 단계 | 변수 이름 | 타입 | 예시 값 |
|------|----------|------|---------|
| 사용자 입력 | `formData` | Object | `{ title: "원자로 부품", description: "..." }` |
| 쿼리 생성 | `queryText` | string | `"원자로 부품 냉각 시스템"` |
| 토크나이징 | `inputs.input_ids` | Tensor | `[[2, 1234, 5678, 3, 0, ...]]` |
| 모델 출력 | `logits` | Tensor | `[[-2.5, 3.2]]` |
| 확률 계산 | `probs` | Tensor | `[0.0033, 0.9967]` |
| 백엔드 응답 | `result` | Object | `{ isStrategic: true, confidence: 99.67, ... }` |
| React 상태 | `predictionResult` | Object | (동일) |
| TF-IDF | `queryTFIDF` | Map | `Map { "원자로" => 0.096, ... }` |
| 유사도 | `similarities` | Array | `[{ itemId: 42, similarity: 0.85 }, ...]` |
| React 상태 | `similarCases` | Array | (상세 정보 추가된 배열) |

---

### 7.3 수학 공식 총정리

#### 1. Softmax (백엔드)
```
P(class_i) = exp(logit_i) / Σ exp(logit_j)
```

#### 2. Cross-Entropy Loss (학습 시)
```
Loss = -log(P(정답 클래스))
```

#### 3. TF (Term Frequency)
```
TF(단어) = 문서 내 단어 등장 횟수 / 문서의 전체 단어 수
```

#### 4. IDF (Inverse Document Frequency)
```
IDF(단어) = log(전체 문서 수 / 단어가 등장한 문서 수)
```

#### 5. TF-IDF
```
TF-IDF(단어) = TF(단어) × IDF(단어)
```

#### 6. 코사인 유사도
```
similarity = (A · B) / (|A| × |B|)

A · B = Σ(a_i × b_i)
|A| = √(Σ a_i²)
```

---

## 8. 추가 설명: 왜 이렇게 복잡한가?

### 8.1 왜 KoBERT를 사용하나?

**전통적 방법 (키워드 매칭):**
```python
if "원자로" in text or "핵" in text:
    return "전략물자"
```
**문제:** 문맥을 이해 못함

**KoBERT 방법:**
- "원자로 모형 장난감" → 비전략물자 (장난감 문맥)
- "원자로 냉각 시스템" → 전략물자 (실제 부품 문맥)

→ **문맥을 이해하고 판단**

---

### 8.2 왜 TF-IDF를 사용하나?

**단순 단어 매칭:**
```python
if "원자로" in query and "원자로" in document:
    return True
```
**문제:** 얼마나 중요한 단어인지 모름

**TF-IDF:**
- "원자로": IDF 높음 → 중요 (적은 문서에 등장)
- "시스템": IDF 낮음 → 덜 중요 (많은 문서에 등장)

→ **중요한 단어에 가중치 부여**

---

### 8.3 왜 프론트/백엔드를 분리하나?

**모두 프론트엔드에서 실행하면?**
- KoBERT 모델 (400MB)을 브라우저에서 로드?
- 느리고, 메모리 부족

**백엔드 분리:**
- 서버에서 GPU로 빠르게 실행
- 프론트엔드는 가벼운 UI만 담당

---

## 9. 디버깅 가이드

### 9.1 예측 결과가 이상할 때

**체크리스트:**
1. 백엔드 서버가 실행 중인가? (`http://localhost:8000/health`)
2. 모델 파일이 존재하는가? (`models/kobert-strategic-final/`)
3. 콘솔에 에러가 있는가? (F12)

**디버깅:**
```python
# backend/app.py에 추가
print(f"Input text: {request.text}")
print(f"Logits: {logits}")
print(f"Probs: {probs}")
```

---

### 9.2 유사 사례가 안 나올 때

**체크리스트:**
1. `export_history.json` 파일이 있는가?
2. 쿼리가 너무 짧은가? (최소 3자)
3. 유사도 임계값이 너무 높은가? (0.05)

**디버깅:**
```typescript
// PredictionPage.tsx에 추가
console.log('Query tokens:', queryTokens);
console.log('Similarities:', similarResults);
```

---

## 10. 결론

이 프로젝트는 다음과 같은 기술 스택을 통합합니다:

1. **AI/ML**: KoBERT (Transformer), PyTorch
2. **백엔드**: FastAPI, Python
3. **프론트엔드**: React, TypeScript
4. **알고리즘**: TF-IDF, 코사인 유사도
5. **통신**: REST API, JSON

모든 부분이 유기적으로 연결되어 **텍스트 입력 → AI 분석 → 결과 표시**의 전체 파이프라인을 구성합니다.

---

**작성일**: 2026-01-01
**작성자**: Claude Code
