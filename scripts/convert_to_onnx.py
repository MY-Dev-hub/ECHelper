from optimum.onnxruntime import ORTModelForSequenceClassification
from transformers import AutoTokenizer

print("=" * 60)
print("Converting KoBERT Model to ONNX")
print("=" * 60)

# Load the trained model
model_path = "../models/kobert-strategic-final"
output_path = "../frontend/public/models/kobert-onnx"

print(f"\n1. Loading model from: {model_path}")
print(f"2. Will save ONNX model to: {output_path}")

# Convert to ONNX
print("\n3. Converting to ONNX format...")
model = ORTModelForSequenceClassification.from_pretrained(
    model_path,
    export=True
)

# Load tokenizer
print("4. Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(model_path)

# Save ONNX model and tokenizer
print(f"\n5. Saving ONNX model to {output_path}...")
model.save_pretrained(output_path)
tokenizer.save_pretrained(output_path)

print("\n" + "=" * 60)
print("Conversion completed successfully!")
print(f"ONNX model saved to: {output_path}")
print("=" * 60)
