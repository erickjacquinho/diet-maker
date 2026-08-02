#!/usr/bin/env python3
"""Prepare a deterministic task directory for the sdd skill."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata
from dataclasses import dataclass, replace
from datetime import date
from pathlib import Path
from typing import Sequence


PROJECT_MARKERS = (
    ".git",
    ".specify",
    "AGENTS.md",
    "pyproject.toml",
    "package.json",
    "Cargo.toml",
    "go.mod",
    "pom.xml",
    "build.gradle",
)

REQUIRED_SKILLS = (
    "speckit-specify",
    "speckit-clarify",
    "speckit-checklist",
    "speckit-plan",
    "speckit-tasks",
    "speckit-analyze",
)


class PreparationError(RuntimeError):
    """Raised when deterministic preparation cannot safely continue."""


@dataclass(frozen=True)
class PreparationResult:
    project_root: Path
    task_dir: Path
    feature_dir: Path
    slug: str
    resumed: bool

    def to_dict(self, status: "SpecKitStatus") -> dict[str, object]:
        return {
            "project_root": str(self.project_root),
            "task_dir": str(self.task_dir),
            "feature_dir": self.feature_dir.as_posix(),
            "slug": self.slug,
            "resumed": self.resumed,
            "speckit": {
                "configured": status.configured,
                "missing": list(status.missing),
                "launcher": status.launcher,
            },
        }


@dataclass(frozen=True)
class SpecKitStatus:
    configured: bool
    missing: tuple[str, ...]
    launcher: str | None = None


def slugify(value: str, max_chars: int = 40) -> str:
    """Convert free text to a lowercase ASCII hyphenated slug limited by length."""
    ascii_value = (
        unicodedata.normalize("NFKD", value)
        .encode("ascii", "ignore")
        .decode("ascii")
    )
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_value.lower())
    slug = re.sub(r"-+", "-", slug).strip("-")
    if not slug:
        return ""
    if max_chars < 1:
        return ""
    return slug[:max_chars].rstrip("-")


def resolve_project_root(explicit: Path | None, start: Path) -> Path:
    """Resolve an explicit root or the nearest ancestor with a project marker."""
    if explicit is not None:
        root = explicit.resolve()
        if not root.is_dir():
            raise PreparationError(f"Project root does not exist: {root}")
        return root

    current = start.resolve()
    for candidate in (current, *current.parents):
        if any((candidate / marker).exists() for marker in PROJECT_MARKERS):
            return candidate

    raise PreparationError(
        "Could not identify a project root; rerun with --project-root."
    )


def prepare_task(
    root: Path,
    task: str,
    task_date: date,
    slug: str | None = None,
) -> PreparationResult:
    """Create or safely resume specs/dd-mm-yy-task-slug."""
    root = root.resolve()
    resolved_slug = slugify(slug or task)
    if not resolved_slug:
        raise PreparationError("Task does not produce a usable slug.")

    feature_dir = Path("specs") / f"{task_date:%d-%m-%y}-{resolved_slug}"
    task_dir = root / feature_dir
    context_file = task_dir / ".sdd-context.json"
    resumed = task_dir.exists()

    if resumed and not task_dir.is_dir():
        raise PreparationError(f"Task path is not a directory: {task_dir}")

    if context_file.is_file():
        try:
            previous = json.loads(context_file.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise PreparationError(
                f"Task context is unreadable: {context_file}"
            ) from error
        if previous.get("task") != task:
            raise PreparationError(
                f"Slug collision with a different task: {task_dir}"
            )
    elif resumed and any(task_dir.iterdir()):
        raise PreparationError(
            f"Existing directory is not an SDD task: {task_dir}"
        )

    task_dir.mkdir(parents=True, exist_ok=True)
    context = {
        "task": task,
        "slug": resolved_slug,
        "feature_dir": feature_dir.as_posix(),
        "date": task_date.isoformat(),
    }
    context_file.write_text(
        json.dumps(context, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    return PreparationResult(
        project_root=root,
        task_dir=task_dir,
        feature_dir=feature_dir,
        slug=resolved_slug,
        resumed=resumed,
    )


def _installed_integrations(data: dict[str, object]) -> set[str]:
    """Read current and legacy Spec Kit integration state shapes."""
    installed: set[str] = set()
    raw = data.get("installed_integrations", [])
    if isinstance(raw, list):
        for item in raw:
            if isinstance(item, str):
                installed.add(item)
            elif isinstance(item, dict):
                for key in ("id", "key", "integration"):
                    value = item.get(key)
                    if isinstance(value, str):
                        installed.add(value)
                        break
    for key in ("default_integration", "integration"):
        value = data.get(key)
        if isinstance(value, str):
            installed.add(value)
    return installed


def detect_speckit(root: Path) -> SpecKitStatus:
    """Verify every Spec Kit component required by the sdd flow."""
    root = root.resolve()
    missing: list[str] = []
    specify_dir = root / ".specify"
    if not specify_dir.is_dir():
        missing.append(".specify")

    integration_file = specify_dir / "integration.json"
    try:
        integration_data = json.loads(integration_file.read_text(encoding="utf-8"))
        if not isinstance(integration_data, dict):
            integration_data = {}
    except (OSError, json.JSONDecodeError):
        integration_data = {}
    if "codex" not in _installed_integrations(integration_data):
        missing.append("codex integration")

    skills_root = root / ".agents" / "skills"
    for name in REQUIRED_SKILLS:
        if not (skills_root / name / "SKILL.md").is_file():
            missing.append(name)

    scripts_root = specify_dir / "scripts"
    if not any((scripts_root / kind).is_dir() for kind in ("powershell", "bash")):
        missing.append("Spec Kit scripts")

    return SpecKitStatus(configured=not missing, missing=tuple(missing))


def run_command(command: list[str], cwd: Path) -> None:
    """Run a bootstrap command and convert process failures to preparation errors."""
    try:
        subprocess.run(
            command,
            cwd=cwd,
            check=True,
            stdout=sys.stderr,
            stderr=sys.stderr,
        )
    except (OSError, subprocess.CalledProcessError) as error:
        rendered = subprocess.list2cmdline(command)
        raise PreparationError(f"Spec Kit bootstrap failed: {rendered}") from error


def ensure_speckit(
    root: Path,
    runner=run_command,
    which=shutil.which,
) -> SpecKitStatus:
    """Bootstrap the official Codex integration and verify it afterwards."""
    root = root.resolve()
    current = detect_speckit(root)
    if current.configured:
        return current

    script_type = "ps" if os.name == "nt" else "sh"
    init_args = [
        "init",
        "--here",
        "--force",
        "--integration",
        "codex",
        "--script",
        script_type,
        "--ignore-agent-tools",
    ]
    if which("specify"):
        command = ["specify", *init_args]
    elif which("uvx"):
        command = [
            "uvx",
            "--from",
            "git+https://github.com/github/spec-kit.git",
            "specify",
            *init_args,
        ]
    else:
        raise PreparationError(
            "Spec Kit is missing and neither specify nor uvx is available. "
            "Install uv from https://docs.astral.sh/uv/ and retry."
        )

    runner(command, root)
    verified = detect_speckit(root)
    if not verified.configured:
        raise PreparationError(
            "Spec Kit bootstrap incomplete: " + ", ".join(verified.missing)
        )
    return replace(verified, launcher=command[0])


def main(argv: Sequence[str] | None = None) -> int:
    """Prepare a task and print the machine-readable execution context."""
    parser = argparse.ArgumentParser(
        description="Prepare an SDD task directory and its Spec Kit integration."
    )
    parser.add_argument("--task", required=True, help="Complete task request")
    parser.add_argument("--project-root", type=Path)
    parser.add_argument("--slug", help="Optional explicit task slug")
    parser.add_argument("--date", type=date.fromisoformat, help="ISO date override")
    parser.add_argument(
        "--skip-bootstrap",
        action="store_true",
        help="Report Spec Kit status without changing the project",
    )
    args = parser.parse_args(argv)

    try:
        root = resolve_project_root(args.project_root, Path.cwd())
        result = prepare_task(root, args.task, args.date or date.today(), args.slug)
        status = (
            detect_speckit(root)
            if args.skip_bootstrap
            else ensure_speckit(root)
        )
        print(json.dumps(result.to_dict(status), ensure_ascii=False, indent=2))
        return 0
    except PreparationError as error:
        print(
            json.dumps({"error": str(error)}, ensure_ascii=False),
            file=sys.stderr,
        )
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
