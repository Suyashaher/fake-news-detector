"""
Fake News Detection — DistilBERT Training Script
=================================================
Loads true.csv / fake.csv, processes, tokenizes, trains DistilBERT,
evaluates, and saves the model to ./ai_service/fake_news_model/.
"""

import os
import sys
import argparse
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    DistilBertTokenizer,
    DistilBertForSequenceClassification,
    get_linear_schedule_with_warmup,
)
from torch.optim import AdamW

# ─── Configuration ────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
DATASET_DIR = os.path.join(PROJECT_ROOT, "dataset")
MODEL_SAVE_DIR = os.path.join(BASE_DIR, "fake_news_model")

# Parse CLI arguments
parser = argparse.ArgumentParser(description="Train DistilBERT fake news detector")
parser.add_argument("--quick", action="store_true",
                    help="Quick training mode: 2000 samples, max_length=128 (~30 min on CPU)")
args = parser.parse_args()

QUICK_MODE = args.quick

# Adjust settings based on mode
if QUICK_MODE:
    MAX_LENGTH = 128
    EPOCHS = 2
    BATCH_SIZE = 16
    SAMPLE_SIZE = 2000
    LOG_EVERY = 10
    print("⚡ QUICK MODE: Training on 2000 samples, max_length=128, 2 epochs")
    print("   Use this for fast testing. Remove --quick for full training.\n")
else:
    MAX_LENGTH = 512
    EPOCHS = 3
    BATCH_SIZE = 8
    SAMPLE_SIZE = None  # use all data
    LOG_EVERY = 50

LEARNING_RATE = 5e-5
MODEL_NAME = "distilbert-base-uncased"


# ─── Dataset class ────────────────────────────────────────────────────────────
class NewsDataset(Dataset):
    """PyTorch Dataset for tokenized news articles."""

    def __init__(self, texts, labels, tokenizer, max_length):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]

        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            padding="max_length",
            truncation=True,
            return_attention_mask=True,
            return_tensors="pt",
        )

        return {
            "input_ids": encoding["input_ids"].flatten(),
            "attention_mask": encoding["attention_mask"].flatten(),
            "labels": torch.tensor(label, dtype=torch.long),
        }


# ─── Data Processing Pipeline ─────────────────────────────────────────────────
def load_and_process_data():
    """
    1. Load true.csv and fake.csv
    2. Add label column (true → 0, fake → 1)
    3. Merge both datasets
    4. Combine title + text into a single input column
    5. Drop null values
    6. Convert date to datetime format
    7. Split 80 / 20
    """
    print("📂 Loading datasets...")
    true_df = pd.read_csv(os.path.join(DATASET_DIR, "True.csv"))
    fake_df = pd.read_csv(os.path.join(DATASET_DIR, "Fake.csv"))

    # Step 2 — labels
    true_df["label"] = 0
    fake_df["label"] = 1

    # Step 3 — merge
    df = pd.concat([true_df, fake_df], ignore_index=True)
    print(f"   Total samples: {len(df)}")

    # Step 4 — combine title + text
    df["content"] = df["title"] + " " + df["text"]

    # Step 5 — drop nulls
    df.dropna(subset=["content", "label"], inplace=True)

    # Step 6 — date conversion (best-effort)
    try:
        df["date"] = pd.to_datetime(df["date"], infer_datetime_format=True, errors="coerce")
    except Exception:
        pass

    # Shuffle
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # Subsample for quick mode
    if QUICK_MODE and SAMPLE_SIZE and len(df) > SAMPLE_SIZE:
        df = df.head(SAMPLE_SIZE)
        print(f"   ⚡ Quick mode: using {len(df)} samples")

    # Step 7 — split
    X_train, X_test, y_train, y_test = train_test_split(
        df["content"].values,
        df["label"].values,
        test_size=0.2,
        random_state=42,
        stratify=df["label"].values,
    )
    print(f"   Train size: {len(X_train)}  |  Test size: {len(X_test)}")
    return X_train, X_test, y_train, y_test


# ─── Training Loop ────────────────────────────────────────────────────────────
def train_model():
    """Train DistilBERT on the fake-news dataset."""

    X_train, X_test, y_train, y_test = load_and_process_data()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🖥️  Using device: {device}")

    # Tokenizer & model
    tokenizer = DistilBertTokenizer.from_pretrained(MODEL_NAME)
    model = DistilBertForSequenceClassification.from_pretrained(
        MODEL_NAME, num_labels=2
    )
    model.to(device)

    # Data loaders
    train_dataset = NewsDataset(X_train, y_train, tokenizer, MAX_LENGTH)
    test_dataset = NewsDataset(X_test, y_test, tokenizer, MAX_LENGTH)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE)

    # Optimizer & scheduler
    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE)
    total_steps = len(train_loader) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(
        optimizer, num_warmup_steps=0, num_training_steps=total_steps
    )

    # ── Training ──
    total_batches = len(train_loader)
    print(f"\n🚀 Starting training... ({total_batches} batches/epoch, logging every {LOG_EVERY} steps)")
    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0
        for step, batch in enumerate(train_loader):
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss
            total_loss += loss.item()

            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            scheduler.step()
            optimizer.zero_grad()

            if (step + 1) % LOG_EVERY == 0:
                pct = ((step + 1) / total_batches) * 100
                print(f"   Epoch {epoch+1}/{EPOCHS}  Step {step+1}/{total_batches}  ({pct:.1f}%)  Loss: {loss.item():.4f}")

        avg_loss = total_loss / total_batches
        print(f"   ✅ Epoch {epoch+1} complete — average loss: {avg_loss:.4f}")

    # ── Evaluation ──
    print("\n📊 Evaluating model...")
    model.eval()
    all_preds, all_labels = [], []

    with torch.no_grad():
        for batch in test_loader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            preds = torch.argmax(outputs.logits, dim=1)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    # Step 8 — metrics
    accuracy = accuracy_score(all_labels, all_preds)
    precision = precision_score(all_labels, all_preds)
    recall = recall_score(all_labels, all_preds)
    f1 = f1_score(all_labels, all_preds)
    cm = confusion_matrix(all_labels, all_preds)

    print("\n" + "=" * 50)
    print("          EVALUATION RESULTS")
    print("=" * 50)
    print(f"  Accuracy  : {accuracy:.4f}")
    print(f"  Precision : {precision:.4f}")
    print(f"  Recall    : {recall:.4f}")
    print(f"  F1 Score  : {f1:.4f}")
    print(f"\n  Confusion Matrix:")
    print(f"  {cm}")
    print("\n" + classification_report(all_labels, all_preds, target_names=["True", "Fake"]))
    print("=" * 50)

    # ── Save model ──
    os.makedirs(MODEL_SAVE_DIR, exist_ok=True)
    model.save_pretrained(MODEL_SAVE_DIR)
    tokenizer.save_pretrained(MODEL_SAVE_DIR)
    print(f"\n✅ Model saved to {MODEL_SAVE_DIR}")


if __name__ == "__main__":
    train_model()
