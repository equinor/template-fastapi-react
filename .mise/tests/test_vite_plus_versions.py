import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CHECK = ROOT / ".mise/tasks/github-actions/ensure-consistent-vite-plus-versions"


class PackageManagerConsistencyTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        for relative in (
            ".mise/config.toml",
            "web/package.json",
            "web/pnpm-workspace.yaml",
            "web/pnpm-lock.yaml",
            "openapi/package.json",
        ):
            target = self.root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / relative, target)

    def check(self):
        return subprocess.run(
            [sys.executable, str(CHECK)],
            env={**os.environ, "MISE_CONFIG_ROOT": str(self.root)},
            capture_output=True,
            text=True,
            check=False,
        )

    def set_package_manager(self, manifest, value):
        path = self.root / manifest
        contents = json.loads(path.read_text())
        if value is None:
            contents.pop("packageManager")
        else:
            contents["packageManager"] = value
        path.write_text(json.dumps(contents))

    def test_matching_package_managers_pass(self):
        result = self.check()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_mismatched_package_manager_reports_affected_manifest(self):
        for manifest in ("web/package.json", "openapi/package.json"):
            with self.subTest(manifest=manifest):
                original = (self.root / manifest).read_text()
                self.set_package_manager(manifest, "pnpm@99.0.0")
                result = self.check()
                self.assertEqual(result.returncode, 1)
                self.assertIn(f"{manifest} packageManager pnpm@99.0.0 differs", result.stderr)
                (self.root / manifest).write_text(original)

    def test_upgrading_web_and_mise_still_detects_generator_drift(self):
        self.set_package_manager("web/package.json", "pnpm@99.0.0")
        config = self.root / ".mise/config.toml"
        lines = config.read_text().splitlines()
        config.write_text("\n".join('pnpm = "99.0.0"' if line.startswith("pnpm = ") else line for line in lines))
        result = self.check()
        self.assertEqual(result.returncode, 1)
        self.assertIn("openapi/package.json packageManager", result.stderr)
        self.assertNotIn("web/package.json packageManager", result.stderr)

    def test_missing_or_non_pnpm_generator_pin_fails(self):
        for value in (None, "npm@99.0.0"):
            with self.subTest(value=value):
                self.set_package_manager("openapi/package.json", value)
                result = self.check()
                self.assertEqual(result.returncode, 1)
                self.assertIn("openapi/package.json must pin pnpm in packageManager", result.stderr)


if __name__ == "__main__":
    unittest.main()
