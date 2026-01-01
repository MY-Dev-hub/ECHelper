import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import torch
from torch.utils.data import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification

print("=" * 60)
print("KoBERT Model Performance Evaluation")
print("=" * 60)

# Set device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"\nUsing device: {device}")

# Load data
print("\n1. Loading data...")
df = pd.read_excel('../data/labelled_data_aug_for_learning.xlsx')
print(f"   Total samples: {len(df)}")

# Prepare texts and labels
texts = df['data_total'].fillna('').astype(str).tolist()
labels = df['label'].tolist()

# Same train/validation split as training
print("\n2. Splitting data (same as training)...")
train_texts, val_texts, train_labels, val_labels = train_test_split(
    texts, labels, test_size=0.2, random_state=42, stratify=labels
)
print(f"   Validation samples: {len(val_texts)}")

# Load model and tokenizer
print("\n3. Loading trained model...")
model_path = "../models/kobert-strategic-final"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)
model.to(device)
model.eval()
print("   Model loaded successfully!")

# Dataset class
class EvalDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=128):
        self.encodings = tokenizer(
            texts,
            truncation=True,
            padding=True,
            max_length=max_length,
            return_tensors='pt'
        )
        self.labels = labels

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {key: val[idx] for key, val in self.encodings.items() if key != 'token_type_ids'}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

# Create dataset
print("\n4. Preparing validation dataset...")
val_dataset = EvalDataset(val_texts, val_labels, tokenizer)

# Predict on validation set
print("\n5. Running predictions on validation set...")
predictions = []
true_labels = []

with torch.no_grad():
    for i in range(len(val_dataset)):
        item = val_dataset[i]
        inputs = {k: v.unsqueeze(0).to(device) for k, v in item.items() if k != 'labels'}
        outputs = model(**inputs)
        logits = outputs.logits
        pred = torch.argmax(logits, dim=-1).item()
        predictions.append(pred)
        true_labels.append(item['labels'].item())

        if (i + 1) % 50 == 0:
            print(f"   Processed {i + 1}/{len(val_dataset)} samples...")

# Calculate metrics
print("\n" + "=" * 60)
print("6. Performance Metrics")
print("=" * 60)

accuracy = accuracy_score(true_labels, predictions)
print(f"\n>> Overall Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")

# Classification report
print("\n>> Detailed Classification Report:")
print("-" * 60)
target_names = ['Non-Strategic (0)', 'Strategic (1)']
report = classification_report(true_labels, predictions, target_names=target_names, digits=4)
print(report)

# Confusion Matrix
print("\n>> Confusion Matrix:")
print("-" * 60)
cm = confusion_matrix(true_labels, predictions)
print(f"                  Predicted")
print(f"                  Non-Str   Strategic")
print(f"Actual Non-Str    {cm[0][0]:6d}    {cm[0][1]:6d}")
print(f"Actual Strategic  {cm[1][0]:6d}    {cm[1][1]:6d}")

# Calculate percentages
tn, fp, fn, tp = cm.ravel()
total = tn + fp + fn + tp
print(f"\nTrue Negatives:  {tn:3d} ({tn/total*100:.1f}%) - Correctly identified as Non-Strategic")
print(f"False Positives: {fp:3d} ({fp/total*100:.1f}%) - Wrongly identified as Strategic")
print(f"False Negatives: {fn:3d} ({fn/total*100:.1f}%) - Wrongly identified as Non-Strategic")
print(f"True Positives:  {tp:3d} ({tp/total*100:.1f}%) - Correctly identified as Strategic")

# Sensitivity and Specificity
sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0
specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
print(f"\nSensitivity (Recall for Strategic): {sensitivity:.4f} ({sensitivity*100:.2f}%)")
print(f"Specificity (Recall for Non-Strategic): {specificity:.4f} ({specificity*100:.2f}%)")

# Sample predictions
print("\n" + "=" * 60)
print("7. Sample predictions from validation set:")
print("=" * 60)
for i in range(min(10, len(val_texts))):
    text_preview = val_texts[i][:80] + "..." if len(val_texts[i]) > 80 else val_texts[i]
    actual_label = 'Strategic' if val_labels[i] == 1 else 'Non-Strategic'
    pred_label = 'Strategic' if predictions[i] == 1 else 'Non-Strategic'
    correct = '[OK]' if predictions[i] == val_labels[i] else '[WRONG]'

    print(f"\nSample {i+1}: {correct}")
    print(f"  Text: {text_preview}")
    print(f"  Actual: {actual_label:15s} | Predicted: {pred_label}")

print("\n" + "=" * 60)
print("Evaluation completed!")
print("=" * 60)

# Save results to JSON
print("\n8. Saving results to JSON...")
import json
from datetime import datetime

# Calculate class-wise metrics
report_dict = classification_report(true_labels, predictions, target_names=['Non-Strategic', 'Strategic'], output_dict=True)

model_info = {
    "modelName": "KoBERT Strategic Item Classifier",
    "modelType": "KoBERT (skt/kobert-base-v1)",
    "version": "1.0.0",
    "trainedDate": datetime.now().strftime("%Y-%m-%d"),
    "evaluatedDate": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "trainingData": {
        "totalSamples": len(df),
        "trainSamples": len(train_texts),
        "validationSamples": len(val_texts),
        "classes": {
            "nonStrategic": labels.count(0),
            "strategic": labels.count(1)
        }
    },
    "performance": {
        "overall": {
            "accuracy": float(accuracy),
            "accuracyPercent": f"{accuracy*100:.2f}%"
        },
        "nonStrategic": {
            "precision": float(report_dict['Non-Strategic']['precision']),
            "recall": float(report_dict['Non-Strategic']['recall']),
            "f1Score": float(report_dict['Non-Strategic']['f1-score']),
            "support": int(report_dict['Non-Strategic']['support'])
        },
        "strategic": {
            "precision": float(report_dict['Strategic']['precision']),
            "recall": float(report_dict['Strategic']['recall']),
            "f1Score": float(report_dict['Strategic']['f1-score']),
            "support": int(report_dict['Strategic']['support'])
        },
        "confusionMatrix": {
            "trueNegatives": int(tn),
            "falsePositives": int(fp),
            "falseNegatives": int(fn),
            "truePositives": int(tp),
            "tnPercent": f"{tn/total*100:.1f}%",
            "fpPercent": f"{fp/total*100:.1f}%",
            "fnPercent": f"{fn/total*100:.1f}%",
            "tpPercent": f"{tp/total*100:.1f}%"
        },
        "metrics": {
            "sensitivity": float(sensitivity),
            "sensitivityPercent": f"{sensitivity*100:.2f}%",
            "specificity": float(specificity),
            "specificityPercent": f"{specificity*100:.2f}%"
        }
    },
    "modelConfig": {
        "maxLength": 128,
        "epochs": 3,
        "batchSize": 16,
        "learningRate": "2e-5 with warmup",
        "optimizer": "AdamW"
    },
    "notes": "모델은 전략물자 판별에 보수적입니다. 비전략물자 식별에 강하며 ({:.2f}% Specificity), 전략물자 탐지율은 {:.2f}%입니다. 초기 스크리닝용으로 적합하며 사람의 최종 검토가 필요합니다.".format(specificity*100, sensitivity*100)
}

# Save to frontend public folder
output_path = "../frontend/public/models/kobert-onnx/model_info.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(model_info, f, ensure_ascii=False, indent=2)

print(f"   Results saved to: {output_path}")
print("\n" + "=" * 60)
