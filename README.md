# InsightML #2 – Prediction of Employee Burnout Score

Comprehensive, end-to-end implementation for the ABES InsightML #2 competition. The repository hosts a production-grade Next.js workspace (`burnout-predictor/`) with an interactive predictor, exploratory dashboards, and a deployable TypeScript inference core. A complementary Python pipeline (`burnout-predictor/ml/`) delivers feature engineering, Optuna-driven model training, and Kaggle-ready submission generation.

## Repository layout

```
├── README.md                  # High-level summary (this file)
└── burnout-predictor/         # Main project workspace
    ├── src/                   # Next.js app, UI, inference API
    ├── public/                # Static assets & sample datasets
    ├── ml/                    # Python training pipeline & feature engineering
    ├── submissions/           # (generated) Kaggle submission files
    └── artifacts/             # (generated) trained models & manifests
```

## Quick start

```bash
cd burnout-predictor
npm install
npm run dev
# visit http://localhost:3000 for the interactive workspace
```

## Model training

```bash
cd burnout-predictor
python3 -m venv .venv
source .venv/bin/activate
pip install -r ml/requirements.txt
python -m ml.pipeline.train \
  --train data/train.csv \
  --test data/test.csv \
  --artifacts artifacts \
  --submissions submissions \
  --trials 40
```

Place the official Kaggle datasets inside `burnout-predictor/data/` before executing the pipeline.
