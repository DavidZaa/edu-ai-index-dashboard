from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from pathlib import Path

import pandas as pd


@dataclass(frozen=True)
class IndexWeights:
    """Weights for the prototype index formula."""

    math: float = 0.4
    english: float = 0.4
    tech: float = 0.2


def repo_root() -> Path:
    """Return the project root folder."""
    return Path(__file__).resolve().parents[1]


def require_columns(df: pd.DataFrame, cols: list[str]) -> None:
    """Raise an error if the CSV is missing required columns."""
    missing = [c for c in cols if c not in df.columns]
    if missing:
        raise ValueError(
            f"Missing required columns: {missing}. "
            f"Found columns: {list(df.columns)}"
        )


def coerce_numeric(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    """Convert score columns to numeric values; invalid values become NaN."""
    out = df.copy()
    for c in cols:
        out[c] = pd.to_numeric(out[c], errors="coerce")
    return out


def validate_ranges(
    df: pd.DataFrame,
    cols: list[str],
    lo: float = 0.0,
    hi: float = 100.0,
) -> None:

    bad_rows = df[df[cols].isna().any(axis=1)]
    if not bad_rows.empty:
        raise ValueError(
            "Some rows have non-numeric or missing scores. "
            f"Fix your CSV. Example bad rows:\n{bad_rows.head(10)}"
        )

    for c in cols:
        if (df[c] < lo).any() or (df[c] > hi).any():
            bad = df[(df[c] < lo) | (df[c] > hi)][["state", c]].head(10)
            raise ValueError(
                f"Column {c} has values outside [{lo}, {hi}] "
                f"(prototype expectation). Example bad rows:\n{bad}"
            )


def compute_index(df: pd.DataFrame, w: IndexWeights) -> pd.DataFrame:
    """Compute the overall EduCity AI Index."""
    out = df.copy()
    out["index"] = (
        w.math * out["math_score"]
        + w.english * out["english_score"]
        + w.tech * out["tech_score"]
    ).round(2)
    return out


def ensure_dir(p: Path) -> None:
    """Create a folder if it does not exist."""
    p.mkdir(parents=True, exist_ok=True)


def main() -> int:
    root = repo_root()

    raw_csv = root / "data" / "raw" / "state_metrics_sample.csv"
    processed_dir = root / "data" / "processed"
    frontend_public_json = root / "frontend" / "public" / "data" / "state_index.json"

    ensure_dir(processed_dir)
    ensure_dir(frontend_public_json.parent)

    if not raw_csv.exists():
        print(f"ERROR: Missing input file: {raw_csv}", file=sys.stderr)
        return 1

    df = pd.read_csv(raw_csv)

    required = ["state", "math_score", "english_score", "tech_score"]
    require_columns(df, required)

    df = coerce_numeric(df, ["math_score", "english_score", "tech_score"])
    validate_ranges(df, ["math_score", "english_score", "tech_score"])

    df_out = compute_index(df, IndexWeights())

    # Save processed CSV for auditing/debugging.
    processed_csv = processed_dir / "state_index.csv"
    df_out.to_csv(processed_csv, index=False)

    # Save JSON for the frontend.
    records = df_out.sort_values("index", ascending=False).to_dict(orient="records")
    with open(frontend_public_json, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    print("Build complete")
    print(f"- Wrote: {processed_csv}")
    print(f"- Wrote: {frontend_public_json}")
    print("\nTop 5 by index:")
    print(
        df_out.sort_values("index", ascending=False)[["state", "index"]]
        .head(5)
        .to_string(index=False)
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
