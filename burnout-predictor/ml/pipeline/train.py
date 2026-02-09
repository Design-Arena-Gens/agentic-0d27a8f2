from __future__ import annotations

import argparse
import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import joblib
import numpy as np
import optuna
import pandas as pd
from optuna import Trial
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import KFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, RobustScaler

from .feature_engineering import (
    DEFAULT_GROUPS,
    apply_domain_transforms,
    export_feature_groups,
    FeatureGroups,
)


TARGET = "burnout_score"


@dataclass
class TrainingArtifacts:
    model_path: Path
    submission_path: Path
    feature_groups_path: Path
    feature_importance_path: Path

    def to_dict(self) -> Dict[str, str]:
        return {k: str(v) for k, v in asdict(self).items()}


def load_dataset(train_path: Path, test_path: Path) -> Tuple[pd.DataFrame, pd.DataFrame]:
    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)
    return train_df, test_df


def build_preprocessor(
    numeric_columns: List[str],
    categorical_columns: List[str],
) -> ColumnTransformer:
    numeric_pipeline = Pipeline(
        steps=[
            ("scaler", RobustScaler(with_centering=False)),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            (
                "encoder",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=False,
                    min_frequency=0.01,
                ),
            ),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, numeric_columns),
            ("cat", categorical_pipeline, categorical_columns),
        ],
        remainder="drop",
    )

    return preprocessor


def objective(
    trial: Trial,
    frame: pd.DataFrame,
    features: List[str],
    target: pd.Series,
    categorical_columns: List[str],
    fold: KFold,
) -> float:
    learning_rate = trial.suggest_float("learning_rate", 0.01, 0.2, log=True)
    max_depth = trial.suggest_int("max_depth", 3, 8)
    max_iter = trial.suggest_int("max_iter", 150, 500)
    l2 = trial.suggest_float("l2_regularization", 1e-4, 10.0, log=True)

    preprocessor = build_preprocessor(
        numeric_columns=[col for col in features if col not in categorical_columns],
        categorical_columns=categorical_columns,
    )

    estimator = HistGradientBoostingRegressor(
        learning_rate=learning_rate,
        max_depth=max_depth,
        max_iter=max_iter,
        l2_regularization=l2,
        min_samples_leaf=trial.suggest_int("min_samples_leaf", 15, 120),
        max_bins=trial.suggest_int("max_bins", 128, 255),
        random_state=42,
    )

    pipeline = Pipeline(
        steps=[
            ("pre", preprocessor),
            ("regressor", estimator),
        ]
    )

    oof_predictions = np.zeros(len(frame))

    for fold_idx, (train_index, valid_index) in enumerate(fold.split(frame, target)):
        x_train, x_valid = frame.iloc[train_index], frame.iloc[valid_index]
        y_train, y_valid = target.iloc[train_index], target.iloc[valid_index]

        pipeline.fit(x_train, y_train)
        preds = pipeline.predict(x_valid)

        oof_predictions[valid_index] = preds

        rmse = mean_squared_error(y_valid, preds, squared=False)
        trial.set_user_attr(f"fold_{fold_idx}_rmse", rmse)

    overall_rmse = mean_squared_error(target, oof_predictions, squared=False)
    return overall_rmse


def tune_hyperparameters(
    frame: pd.DataFrame,
    features: List[str],
    categorical_columns: List[str],
    target: pd.Series,
    n_trials: int,
) -> Dict[str, float]:
    fold = KFold(n_splits=5, shuffle=True, random_state=42)

    study = optuna.create_study(
        direction="minimize",
        study_name="burnout_hgbt",
        sampler=optuna.samplers.TPESampler(seed=42),
    )
    study.optimize(
        lambda trial: objective(
            trial=trial,
            frame=frame[features],
            features=features,
            target=target,
            categorical_columns=categorical_columns,
            fold=fold,
        ),
        n_trials=n_trials,
        show_progress_bar=False,
    )
    return study.best_trial.params


def train_model(
    frame: pd.DataFrame,
    features: List[str],
    categorical_columns: List[str],
    target: pd.Series,
    params: Dict[str, float],
) -> Pipeline:
    estimator = HistGradientBoostingRegressor(
        random_state=42,
        **params,
    )

    pipeline = Pipeline(
        steps=[
            (
                "preprocessor",
                build_preprocessor(
                    numeric_columns=[col for col in features if col not in categorical_columns],
                    categorical_columns=categorical_columns,
                ),
            ),
            ("regressor", estimator),
        ]
    )

    pipeline.fit(frame[features], target)
    return pipeline


def compute_feature_importance(pipeline: Pipeline, feature_names: List[str]) -> List[Dict[str, float]]:
    encoder = pipeline.named_steps["preprocessor"]
    regressor = pipeline.named_steps["regressor"]

    transformed_feature_names: List[str] = []
    if hasattr(encoder, "get_feature_names_out"):
        transformed_feature_names = list(encoder.get_feature_names_out())
    else:
        transformed_feature_names = feature_names

    if hasattr(regressor, "feature_importances_"):
        importances = regressor.feature_importances_
    elif hasattr(regressor, "feature_importances_"):
        importances = regressor.feature_importances_
    else:
        importances = np.zeros(len(transformed_feature_names))

    scores = (
        pd.DataFrame({"feature": transformed_feature_names, "importance": importances})
        .sort_values(by="importance", ascending=False)
        .head(40)
    )

    return scores.to_dict(orient="records")


def generate_submission(
    pipeline: Pipeline,
    test_frame: pd.DataFrame,
    features: List[str],
) -> np.ndarray:
    predictions = pipeline.predict(test_frame[features])
    return predictions


def save_submission(predictions: np.ndarray, payload: pd.DataFrame, output_path: Path) -> None:
    submission = pd.DataFrame(
        {
            "employee_id": payload["employee_id"],
            "burnout_score": predictions.clip(0.0, 1.0),
        }
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    submission.to_csv(output_path, index=False)


def persist_feature_importance(importance: List[Dict[str, float]], destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(importance, indent=2), encoding="utf-8")


def run_training(
    train_path: Path,
    test_path: Path,
    artifacts_dir: Path,
    submission_dir: Path,
    n_trials: int,
    feature_groups: FeatureGroups,
) -> TrainingArtifacts:
    train_df, test_df = load_dataset(train_path, test_path)

    train_augmented = apply_domain_transforms(train_df)
    test_augmented = apply_domain_transforms(test_df)

    feature_columns = list(
        {col for cols in asdict(feature_groups).values() for col in cols if col in train_augmented.columns}
    )

    missing_columns = sorted(set(feature_columns) - set(train_augmented.columns))
    if missing_columns:
        raise ValueError(f"Missing expected features: {missing_columns}")

    categorical_columns = [
        col
        for col in feature_columns
        if train_augmented[col].dtype == "object"
    ]

    params = tune_hyperparameters(
        frame=train_augmented,
        features=feature_columns,
        categorical_columns=categorical_columns,
        target=train_augmented[TARGET],
        n_trials=n_trials,
    )

    pipeline = train_model(
        frame=train_augmented,
        features=feature_columns,
        categorical_columns=categorical_columns,
        target=train_augmented[TARGET],
        params=params,
    )

    predictions = generate_submission(
        pipeline=pipeline,
        test_frame=test_augmented,
        features=feature_columns,
    )

    artifacts_dir.mkdir(parents=True, exist_ok=True)

    model_path = artifacts_dir / "burnout_pipeline.joblib"
    joblib.dump(pipeline, model_path)

    submission_path = submission_dir / "submission.csv"
    save_submission(predictions, payload=test_df, output_path=submission_path)

    feature_groups_path = export_feature_groups(
        target_dir=artifacts_dir,
        groups=feature_groups,
    )

    importance = compute_feature_importance(pipeline, feature_columns)
    feature_importance_path = artifacts_dir / "feature_importance.json"
    persist_feature_importance(importance, feature_importance_path)

    return TrainingArtifacts(
        model_path=model_path,
        submission_path=submission_path,
        feature_groups_path=feature_groups_path,
        feature_importance_path=feature_importance_path,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train burnout regression model.")
    parser.add_argument("--train", type=Path, default=Path("data/train.csv"))
    parser.add_argument("--test", type=Path, default=Path("data/test.csv"))
    parser.add_argument("--artifacts", type=Path, default=Path("artifacts"))
    parser.add_argument("--submissions", type=Path, default=Path("submissions"))
    parser.add_argument("--trials", type=int, default=30)
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    artifacts = run_training(
        train_path=args.train,
        test_path=args.test,
        artifacts_dir=args.artifacts,
        submission_dir=args.submissions,
        n_trials=args.trials,
        feature_groups=DEFAULT_GROUPS,
    )

    manifest_path = args.artifacts / "manifest.json"
    manifest_path.write_text(json.dumps(artifacts.to_dict(), indent=2), encoding="utf-8")
    print(json.dumps({"status": "ok", **artifacts.to_dict()}, indent=2))


if __name__ == "__main__":
    main()
