import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer
)
import os

print("=" * 60)
print("KoBERT Fine-tuning for Strategic Item Classification")
print("=" * 60)

# Set device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"\nUsing device: {device}")

# Load data
print("\n1. Loading data...")
df = pd.read_excel('../data/labelled_data_aug_for_learning.xlsx')
print(f"   Total samples: {len(df)}")
print(f"   Label 0 (Non-strategic): {(df['label'] == 0).sum()}")
print(f"   Label 1 (Strategic): {(df['label'] == 1).sum()}")

# Prepare texts and labels
texts = df['data_total'].fillna('').astype(str).tolist()
labels = df['label'].tolist()

# Train/validation split
print("\n2. Splitting data...")
train_texts, val_texts, train_labels, val_labels = train_test_split(
    texts, labels, test_size=0.2, random_state=42, stratify=labels
)
print(f"   Training samples: {len(train_texts)}")
print(f"   Validation samples: {len(val_texts)}")

# Load KoBERT tokenizer and model
print("\n3. Loading KoBERT model...")
model_name = "skt/kobert-base-v1"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(
    model_name,
    num_labels=2
)
model.to(device)
print(f"   Model loaded: {model_name}")

# Create dataset class
class StrategicItemDataset(Dataset):
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

# Create datasets
print("\n4. Creating datasets...")
train_dataset = StrategicItemDataset(train_texts, train_labels, tokenizer)
val_dataset = StrategicItemDataset(val_texts, val_labels, tokenizer)

# Training arguments
print("\n5. Setting up training...")
output_dir = '../models/kobert-strategic'
os.makedirs(output_dir, exist_ok=True)

training_args = TrainingArguments(
    output_dir=output_dir,
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    warmup_steps=100,
    weight_decay=0.01,
    logging_dir='../logs',
    logging_steps=50,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
)

# Compute metrics function
def compute_metrics(eval_pred):
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=1)
    acc = accuracy_score(labels, predictions)
    return {"accuracy": acc}

# Create Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    compute_metrics=compute_metrics,
)

# Train
print("\n6. Training started...")
print("=" * 60)
trainer.train()

# Evaluate
print("\n" + "=" * 60)
print("7. Evaluation")
print("=" * 60)
eval_results = trainer.evaluate()
print(f"\nValidation Accuracy: {eval_results['eval_accuracy']:.4f}")

# Save model
print("\n8. Saving model...")
final_model_dir = '../models/kobert-strategic-final'
model.save_pretrained(final_model_dir)
tokenizer.save_pretrained(final_model_dir)
print(f"   Model saved to: {final_model_dir}")

# Test predictions
print("\n9. Testing predictions...")
test_samples = [
    "원자로 및 그 용도로 특별히 설계 또는 준비된 장비와 부품",
    "일반 사무용 컴퓨터 및 주변기기"
]

model.eval()
with torch.no_grad():
    for text in test_samples:
        inputs = tokenizer(text, return_tensors='pt', truncation=True, max_length=128)
        inputs = {k: v.to(device) for k, v in inputs.items() if k != 'token_type_ids'}
        outputs = model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
        pred_label = torch.argmax(probs, dim=-1).item()
        confidence = probs[0][pred_label].item()

        print(f"\nText: {text}")
        print(f"Prediction: {'Strategic' if pred_label == 1 else 'Non-strategic'}")
        print(f"Confidence: {confidence:.4f}")

print("\n" + "=" * 60)
print("Training completed successfully!")
print("=" * 60)
