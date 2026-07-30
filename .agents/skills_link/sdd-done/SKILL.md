---
name: sdd-done
description: Audit Spec Kit SDD folders under `specs/` and archive every completed feature to `specs/completed`. Use when the user invokes `$sdd-done`, asks which SDDs are complete or pending, or asks to clean up completed `tasks.md` feature folders.
---

# SDD Done

Run a strict archive: a feature is complete only when its `tasks.md` contains
at least one task checkbox and every task checkbox is marked `[X]` or `[x]`.

1. Resolve the repository root and confirm that `specs/` exists.

2. Run the audit in preview mode:

   ```powershell
   python "C:\Users\Jacques\Skills\sdd-done\scripts\audit_sdds.py" --specs-dir .\specs
   ```

3. Report every feature's status. Explain invalid or blocked entries; keep
   pending features in place.

4. When the user requested archival or invoked `$sdd-done`, apply the verified
   archive:

   ```powershell
   python "C:\Users\Jacques\Skills\sdd-done\scripts\audit_sdds.py" --specs-dir .\specs --apply
   ```

5. Report the moved directories and the remaining pending, invalid, or blocked
   features. The script excludes `specs/completed/` and never overwrites an
   existing archive directory.

Use the script output as the source of truth. Do not manually move directories.
