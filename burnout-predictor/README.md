# Burnout Prediction Workspace

Production-ready InsightML #2 solution built on Next.js 16 with a deterministic TypeScript inference engine and supporting Python training pipeline.

## Development

```bash
npm install
npm run dev
# http://localhost:3000
```

## Production build

```bash
npm run build
npm run start
```

## Inference API

`POST /api/predict` accepts the engineered feature payload (see `src/lib/featureMetadata.ts`) and returns a burnout score, feature contributions, and the sanitized feature vector.

## Python training pipeline

Reusable feature engineering and model training code lives under `ml/`.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r ml/requirements.txt
python -m ml.pipeline.train --train data/train.csv --test data/test.csv --trials 40
```

Artifacts (trained pipeline, feature groups, feature importances) are emitted into `artifacts/` while Kaggle-ready predictions are written to `submissions/submission.csv`.

## Data

Place the official Kaggle CSV files in `data/`. A synthetic sample dataset is available at `public/data/sample_records.json` and is also consumed by the UI for interactive exploration.
