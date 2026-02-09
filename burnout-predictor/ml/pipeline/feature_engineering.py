from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, Iterable, List

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin


@dataclass
class FeatureGroups:
    """Logical feature groupings aligned with the TypeScript inference layer."""

    workload: List[str]
    wellbeing: List[str]
    support: List[str]
    demographics: List[str]
    behaviour: List[str]

    def to_json(self, path: Path) -> None:
        path.write_text(json.dumps(asdict(self), indent=2), encoding="utf-8")


DEFAULT_GROUPS = FeatureGroups(
    workload=[
        "avg_hours_per_week",
        "overtime_hours",
        "work_pressure_score",
        "project_complexity",
        "resource_allocation",
    ],
    wellbeing=[
        "mental_fatigue_score",
        "sleep_quality",
        "work_life_balance",
        "physical_activity",
        "stress_level",
    ],
    support=[
        "manager_support",
        "peer_support",
        "job_satisfaction",
        "recent_leaves",
    ],
    demographics=[
        "department",
        "role",
        "work_location",
        "wfh_setup",
        "gender",
        "age",
        "tenure_years",
    ],
    behaviour=[
        "promotion_last_24m",
        "training_hours",
        "context_switches",
    ],
)


class RatioBuilder(BaseEstimator, TransformerMixin):
    """Constructs domain-specific ratio features to capture balance between signals."""

    def __init__(self, numerator: str, denominator: str, output_col: str) -> None:
        self.numerator = numerator
        self.denominator = denominator
        self.output_col = output_col

    def fit(self, _: pd.DataFrame, __: Iterable[str] | None = None) -> "RatioBuilder":
        return self

    def transform(self, frame: pd.DataFrame) -> pd.DataFrame:
        denom = frame[self.denominator].replace({0: np.nan})
        ratio = frame[self.numerator] / denom
        frame[self.output_col] = ratio.replace([np.inf, -np.inf], np.nan).fillna(0)
        return frame


class RollingStressSignals(BaseEstimator, TransformerMixin):
    """Aggregates fatigue & stress measures to emphasise prolonged burnout risk."""

    def __init__(self, fatigue_col: str, stress_col: str, output_col: str) -> None:
        self.fatigue_col = fatigue_col
        self.stress_col = stress_col
        self.output_col = output_col

    def fit(self, _: pd.DataFrame, __: Iterable[str] | None = None) -> "RollingStressSignals":
        return self

    def transform(self, frame: pd.DataFrame) -> pd.DataFrame:
        frame[self.output_col] = (
            0.6 * frame[self.fatigue_col] + 0.4 * frame[self.stress_col]
        ) ** 1.2
        return frame


class BinaryFlagEncoder(BaseEstimator, TransformerMixin):
    """Encodes textual binary flags into numerical counterparts."""

    def __init__(self, mapping: Dict[str, float], output_col: str) -> None:
        self.mapping = mapping
        self.output_col = output_col

    def fit(self, _: pd.DataFrame, __: Iterable[str] | None = None) -> "BinaryFlagEncoder":
        return self

    def transform(self, frame: pd.DataFrame) -> pd.DataFrame:
        frame[self.output_col] = (
            frame[self.output_col]
            .astype(str)
            .str.lower()
            .map(self.mapping)
            .fillna(0.0)
        )
        return frame


def apply_domain_transforms(frame: pd.DataFrame) -> pd.DataFrame:
    augmented = frame.copy()

    RatioBuilder(
        numerator="overtime_hours",
        denominator="avg_hours_per_week",
        output_col="overtime_ratio",
    ).transform(augmented)

    RatioBuilder(
        numerator="recent_leaves",
        denominator="tenure_years",
        output_col="leave_frequency",
    ).transform(augmented)

    RollingStressSignals(
        fatigue_col="mental_fatigue_score",
        stress_col="stress_level",
        output_col="chronic_stress_signal",
    ).transform(augmented)

    BinaryFlagEncoder(
        mapping={"yes": 1.0, "true": 1.0, "available": 1.0, "y": 1.0},
        output_col="wfh_setup",
    ).transform(augmented)

    augmented["productivity_reserve"] = (
        augmented["job_satisfaction"] + augmented["peer_support"] + augmented["manager_support"]
    ) / 3

    augmented["recovery_buffer_index"] = (
        augmented["sleep_quality"] + augmented["work_life_balance"] + augmented["physical_activity"] / 2
    )

    return augmented


def export_feature_groups(target_dir: Path, groups: FeatureGroups = DEFAULT_GROUPS) -> Path:
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / "feature_groups.json"
    groups.to_json(target_path)
    return target_path
