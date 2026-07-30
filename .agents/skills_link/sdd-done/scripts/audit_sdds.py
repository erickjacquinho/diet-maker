#!/usr/bin/env python3
"""Audit and optionally archive completed Spec Kit feature directories."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from dataclasses import asdict, dataclass
from pathlib import Path


TASK_CHECKBOX = re.compile(r"^\s*(?:[-*+]\s+|\d+[.)]\s+)\[([^\]])\]\s+\S")


@dataclass
class FeatureStatus:
    name: str
    status: str
    completed_tasks: int = 0
    open_tasks: int = 0
    unsupported_tasks: int = 0
    reason: str | None = None


def inspect_feature(feature_dir: Path, archive_dir: Path) -> FeatureStatus:
    tasks_path = feature_dir / "tasks.md"
    if not tasks_path.is_file():
        return FeatureStatus(feature_dir.name, "invalid", reason="missing tasks.md")

    completed_tasks = 0
    open_tasks = 0
    unsupported_tasks = 0
    for line in tasks_path.read_text(encoding="utf-8").splitlines():
        match = TASK_CHECKBOX.match(line)
        if match is None:
            continue

        marker = match.group(1)
        if marker in {"X", "x"}:
            completed_tasks += 1
        elif marker == " ":
            open_tasks += 1
        else:
            unsupported_tasks += 1

    total_tasks = completed_tasks + open_tasks + unsupported_tasks
    if total_tasks == 0:
        return FeatureStatus(feature_dir.name, "invalid", reason="tasks.md has no task checkboxes")
    if open_tasks or unsupported_tasks:
        reason = "has open tasks" if open_tasks else "has unsupported checkbox markers"
        return FeatureStatus(
            feature_dir.name,
            "pending",
            completed_tasks,
            open_tasks,
            unsupported_tasks,
            reason,
        )
    if (archive_dir / feature_dir.name).exists():
        return FeatureStatus(
            feature_dir.name,
            "blocked",
            completed_tasks,
            reason="archive destination already exists",
        )
    return FeatureStatus(feature_dir.name, "complete", completed_tasks)


def audit(specs_dir: Path) -> list[FeatureStatus]:
    archive_dir = specs_dir / "completed"
    features = sorted(
        (path for path in specs_dir.iterdir() if path.is_dir() and path.name != "completed"),
        key=lambda path: path.name.lower(),
    )
    return [inspect_feature(feature, archive_dir) for feature in features]


def apply_archive(specs_dir: Path, statuses: list[FeatureStatus]) -> None:
    archive_dir = specs_dir / "completed"
    for status in statuses:
        if status.status != "complete":
            continue

        source = specs_dir / status.name
        destination = archive_dir / status.name
        if destination.exists():
            status.status = "blocked"
            status.reason = "archive destination already exists"
            continue
        if not source.is_dir():
            status.status = "failed"
            status.reason = "source directory no longer exists"
            continue

        try:
            archive_dir.mkdir(exist_ok=True)
            shutil.move(str(source), str(destination))
            status.status = "moved"
        except OSError as error:
            status.status = "failed"
            status.reason = str(error)


def render_text(statuses: list[FeatureStatus], applied: bool) -> None:
    action = "Archive applied" if applied else "Preview"
    print(action)
    for status in statuses:
        counts = (
            f"completed={status.completed_tasks}, open={status.open_tasks}, "
            f"unsupported={status.unsupported_tasks}"
        )
        suffix = f" — {status.reason}" if status.reason else ""
        print(f"{status.name}: {status.status} ({counts}){suffix}")

    summary: dict[str, int] = {}
    for status in statuses:
        summary[status.status] = summary.get(status.status, 0) + 1
    print("Summary: " + ", ".join(f"{name}={count}" for name, count in sorted(summary.items())))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Audit Spec Kit feature folders and optionally archive completed ones."
    )
    parser.add_argument(
        "--specs-dir",
        type=Path,
        default=Path.cwd() / "specs",
        help="Path to the specs directory (default: ./specs).",
    )
    parser.add_argument("--apply", action="store_true", help="Move eligible features to specs/completed.")
    parser.add_argument("--json", action="store_true", help="Emit statuses as JSON.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    specs_dir = args.specs_dir.resolve()
    if not specs_dir.is_dir():
        print(f"error: specs directory does not exist: {specs_dir}", file=sys.stderr)
        return 2

    statuses = audit(specs_dir)
    if args.apply:
        apply_archive(specs_dir, statuses)

    if args.json:
        print(json.dumps([asdict(status) for status in statuses], ensure_ascii=False, indent=2))
    else:
        render_text(statuses, args.apply)

    return 1 if any(status.status == "failed" for status in statuses) else 0


if __name__ == "__main__":
    sys.exit(main())
