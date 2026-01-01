import pandas as pd

print("=" * 60)
print("Training Data Analysis")
print("=" * 60)

# Load data
df = pd.read_excel('../data/labelled_data_aug_for_learning.xlsx')

print(f"\nTotal rows: {len(df)}")
print(f"\nColumns: {df.columns.tolist()}")
print(f"\nFirst few rows:")
print(df.head())

print(f"\nData types:")
print(df.dtypes)

print(f"\nLabel distribution:")
if 'label' in df.columns:
    print(df['label'].value_counts())
    print(f"\nLabel ratio:")
    print(df['label'].value_counts(normalize=True))

print(f"\nNull values:")
print(df.isnull().sum())

print("\n" + "=" * 60)
