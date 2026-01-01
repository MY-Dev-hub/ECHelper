import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os

print("=" * 60)
print("Converting KoBERT Model to ONNX (Simple Method)")
print("=" * 60)

# Paths
model_path = "../models/kobert-strategic-final"
output_dir = "../frontend/public/models/kobert-onnx"
os.makedirs(output_dir, exist_ok=True)

print(f"\n1. Loading model from: {model_path}")
model = AutoModelForSequenceClassification.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)

print("2. Preparing dummy input...")
dummy_text = "테스트 샘플"
inputs = tokenizer(dummy_text, return_tensors='pt', truncation=True, max_length=128)
# Remove token_type_ids if present
if 'token_type_ids' in inputs:
    del inputs['token_type_ids']

print("3. Converting to ONNX...")
torch.onnx.export(
    model,
    (inputs['input_ids'], inputs['attention_mask']),
    os.path.join(output_dir, "model.onnx"),
    input_names=['input_ids', 'attention_mask'],
    output_names=['logits'],
    dynamic_axes={
        'input_ids': {0: 'batch_size', 1: 'sequence'},
        'attention_mask': {0: 'batch_size', 1: 'sequence'},
        'logits': {0: 'batch_size'}
    },
    opset_version=14,
    do_constant_folding=True
)

print("4. Saving tokenizer...")
tokenizer.save_pretrained(output_dir)

print("\n" + "=" * 60)
print("Conversion completed successfully!")
print(f"ONNX model saved to: {output_dir}")
print("=" * 60)
