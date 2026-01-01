from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch.nn.functional as F

app = FastAPI()

# CORS 설정 (프론트엔드에서 접근 가능하도록)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모델 로드 (서버 시작 시 한 번만)
print("Loading KoBERT model...")
model_path = "../models/kobert-strategic-final"
model = AutoModelForSequenceClassification.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)
model.eval()
print("Model loaded successfully!")

# 요청 데이터 구조
class PredictRequest(BaseModel):
    text: str

# 예측 엔드포인트
@app.post("/predict")
def predict(request: PredictRequest):
    try:
        # 토크나이징
        inputs = tokenizer(
            request.text,
            return_tensors="pt",
            max_length=128,
            padding="max_length",
            truncation=True
        )

        # 예측
        with torch.no_grad():
            # Only use input_ids and attention_mask
            model_inputs = {
                'input_ids': inputs['input_ids'],
                'attention_mask': inputs['attention_mask']
            }

            outputs = model(**model_inputs)
            logits = outputs.logits  # Shape: [batch_size, num_classes]

            # Softmax로 확률 계산
            probs = F.softmax(logits, dim=1)[0]  # Get first (and only) batch item
            prob_non_strategic = probs[0].item()
            prob_strategic = probs[1].item()

        # 결과 반환
        is_strategic = prob_strategic > 0.5
        confidence = prob_strategic if is_strategic else prob_non_strategic

        # 임시 ECCN/Class (실제로는 더 정교한 로직 필요)
        eccn_options = ['0A001', '0E001', '1C234', '2B231']
        class_options = ['E1', 'E2', 'E3', 'A', 'B']

        import random
        eccn = random.choice(eccn_options) if is_strategic else 'N/A'
        class_type = random.choice(class_options) if is_strategic else 'N/A'

        explanation = (
            f"KoBERT 분석 결과, 전략물자로 분류될 가능성이 {confidence*100:.1f}%입니다."
            if is_strategic
            else f"KoBERT 분석 결과, 일반 상업용 품목으로 판단됩니다. (신뢰도: {confidence*100:.1f}%)"
        )

        return {
            "isStrategic": is_strategic,
            "confidence": confidence * 100,
            "eccn": eccn,
            "classType": class_type,
            "explanation": explanation
        }

    except Exception as e:
        return {
            "isStrategic": False,
            "confidence": 0,
            "eccn": "Error",
            "classType": "Error",
            "explanation": f"예측 중 오류 발생: {str(e)}"
        }

@app.get("/health")
def health():
    return {"status": "ok", "model": "kobert-strategic-final"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
