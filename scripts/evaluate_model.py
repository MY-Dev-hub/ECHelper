import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import torch
from torch.utils.data import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import matplotlib.pyplot as plt
import seaborn as sns

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
print(f"\n✓ Overall Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")

# Classification report
print("\n✓ Detailed Classification Report:")
print("-" * 60)
target_names = ['Non-Strategic (0)', 'Strategic (1)']
report = classification_report(true_labels, predictions, target_names=target_names, digits=4)
print(report)

# Confusion Matrix
print("\n✓ Confusion Matrix:")
print("-" * 60)
cm = confusion_matrix(true_labels, predictions)
print(f"                  Predicted")
print(f"                  Non-Str   Strategic")
print(f"Actual Non-Str    {cm[0][0]:6d}    {cm[0][1]:6d}")
print(f"Actual Strategic  {cm[1][0]:6d}    {cm[1][1]:6d}")

# Calculate percentages
tn, fp, fn, tp = cm.ravel()
total = tn + fp + fn + tp
print(f"\nTrue Negatives:  {tn} ({tn/total*100:.1f}%)")
print(f"False Positives: {fp} ({fp/total*100:.1f}%)")
print(f"False Negatives: {fn} ({fn/total*100:.1f}%)")
print(f"True Positives:  {tp} ({tp/total*100:.1f}%)")

# Sensitivity and Specificity
sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0
specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
print(f"\nSensitivity (Recall for Strategic): {sensitivity:.4f} ({sensitivity*100:.2f}%)")
print(f"Specificity (Recall for Non-Strategic): {specificity:.4f} ({specificity*100:.2f}%)")

# Save confusion matrix plot
print("\n7. Saving confusion matrix plot...")
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Non-Strategic', 'Strategic'],
            yticklabels=['Non-Strategic', 'Strategic'])
plt.title('Confusion Matrix - KoBERT Model')
plt.ylabel('Actual')
plt.xlabel('Predicted')
plt.tight_layout()
plt.savefig('../models/confusion_matrix.png', dpi=300, bbox_inches='tight')
print("   Saved to: ../models/confusion_matrix.png")

# Sample predictions
print("\n8. Sample predictions (first 5 from validation set):")
print("=" * 60)
for i in range(min(5, len(val_texts))):
    print(f"\nSample {i+1}:")
    print(f"Text: {val_texts[i][:100]}...")
    print(f"Actual: {'Strategic' if val_labels[i] == 1 else 'Non-Strategic'}")
    print(f"Predicted: {'Strategic' if predictions[i] == 1 else 'Non-Strategic'}")
    print(f"Correct: {'✓' if predictions[i] == val_labels[i] else '✗'}")

print("\n" + "=" * 60)
print("Evaluation completed!")
print("=" * 60)
