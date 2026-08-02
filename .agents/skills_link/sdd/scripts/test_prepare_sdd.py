from __future__ import annotations

import io
import json
import tempfile
import unittest
from datetime import date
from pathlib import Path
from unittest.mock import patch

from prepare_sdd import (
    REQUIRED_SKILLS,
    PreparationError,
    detect_speckit,
    ensure_speckit,
    main,
    prepare_task,
    resolve_project_root,
    slugify,
)


def scaffold_speckit(root: Path) -> None:
    (root / ".specify" / "scripts" / "powershell").mkdir(parents=True)
    (root / ".specify" / "integration.json").write_text(
        json.dumps(
            {
                "default_integration": "codex",
                "installed_integrations": ["codex"],
            }
        ),
        encoding="utf-8",
    )
    for name in REQUIRED_SKILLS:
        path = root / ".agents" / "skills" / name
        path.mkdir(parents=True)
        (path / "SKILL.md").write_text(
            f"---\nname: {name}\ndescription: test\n---\n",
            encoding="utf-8",
        )


class PreparationTests(unittest.TestCase):
    def test_slugify_normalizes_portuguese(self) -> None:
        self.assertEqual(slugify("Criação do Catálogo"), "criacao-do-catalogo")

    def test_slugify_limits_to_forty_characters_by_default(self) -> None:
        self.assertEqual(
            slugify("Criar uma nova funcionalidade de busca e filtro para produtos"),
            "criar-uma-nova-funcionalidade-de-busca-e",
        )
        self.assertLessEqual(
            len(slugify("Criar uma nova funcionalidade de busca e filtro")),
            40,
        )

    def test_slugify_does_not_limit_the_number_of_words(self) -> None:
        self.assertEqual(
            slugify("a b c d e f g h i j k l m n o"),
            "a-b-c-d-e-f-g-h-i-j-k-l-m-n-o",
        )

    def test_slugify_allows_custom_max_characters(self) -> None:
        self.assertEqual(slugify("Criar nova busca", max_chars=10), "criar-nova")

    def test_slugify_preserves_semantic_slug_within_limit(self) -> None:
        slug = slugify("implementacao-sdd-design-system")

        self.assertEqual(slug, "implementacao-sdd-design-system")
        self.assertEqual(len(slug), 31)

    def test_resolve_project_root_prefers_explicit_root(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            self.assertEqual(
                resolve_project_root(Path(tmp), Path(".")),
                Path(tmp).resolve(),
            )

    def test_prepare_creates_expected_dated_directory(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "pyproject.toml").write_text(
                "[project]\nname='demo'\n",
                encoding="utf-8",
            )

            result = prepare_task(root, "Criar API", date(2026, 7, 22))

            self.assertEqual(
                result.task_dir,
                root / "specs" / "22-07-26-criar-api",
            )
            self.assertEqual(result.feature_dir, Path("specs/22-07-26-criar-api"))
            self.assertTrue((result.task_dir / ".sdd-context.json").is_file())

    def test_prepare_resumes_only_the_same_task(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)

            first = prepare_task(root, "Criar API", date(2026, 7, 22))
            second = prepare_task(root, "Criar API", date(2026, 7, 22))

            self.assertFalse(first.resumed)
            self.assertTrue(second.resumed)
            context = json.loads(
                (second.task_dir / ".sdd-context.json").read_text(encoding="utf-8")
            )
            self.assertEqual(context["task"], "Criar API")

            with self.assertRaises(PreparationError):
                prepare_task(
                    root,
                    "Outra tarefa",
                    date(2026, 7, 22),
                    slug="criar-api",
                )

    def test_detect_speckit_reports_every_missing_component(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            status = detect_speckit(Path(tmp))

            self.assertFalse(status.configured)
            self.assertIn(".specify", status.missing)
            self.assertIn("codex integration", status.missing)
            self.assertIn("speckit-analyze", status.missing)
            self.assertIn("Spec Kit scripts", status.missing)

    def test_detect_speckit_accepts_complete_codex_installation(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            scaffold_speckit(root)

            status = detect_speckit(root)

            self.assertTrue(status.configured)
            self.assertEqual(status.missing, ())

    def test_bootstrap_uses_uvx_when_specify_is_absent(self) -> None:
        calls: list[tuple[list[str], Path]] = []
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)

            def runner(command: list[str], cwd: Path) -> None:
                calls.append((command, cwd))
                scaffold_speckit(root)

            status = ensure_speckit(
                root,
                runner=runner,
                which=lambda name: "uvx" if name == "uvx" else None,
            )

            self.assertTrue(status.configured)
            self.assertEqual(
                calls[0][0][:3],
                ["uvx", "--from", "git+https://github.com/github/spec-kit.git"],
            )
            self.assertIn("codex", calls[0][0])
            self.assertEqual(calls[0][1], root)
            self.assertEqual(status.launcher, "uvx")

    def test_bootstrap_fails_without_specify_or_uvx(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaisesRegex(PreparationError, "neither specify nor uvx"):
                ensure_speckit(
                    Path(tmp),
                    runner=lambda command, cwd: None,
                    which=lambda name: None,
                )

    def test_main_prints_machine_readable_context(self) -> None:
        with tempfile.TemporaryDirectory() as tmp, patch(
            "sys.stdout",
            new_callable=io.StringIO,
        ) as output:
            exit_code = main(
                [
                    "--project-root",
                    tmp,
                    "--task",
                    "Criar API",
                    "--date",
                    "2026-07-22",
                    "--skip-bootstrap",
                ]
            )

            payload = json.loads(output.getvalue())
            self.assertEqual(exit_code, 0)
            self.assertEqual(payload["feature_dir"], "specs/22-07-26-criar-api")
            self.assertFalse(payload["speckit"]["configured"])


if __name__ == "__main__":
    unittest.main()
