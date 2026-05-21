# OpenSpec Agent Notes

Use this directory as the source of truth for product behavior.

## Workflow

- Read `openspec/project.md` before planning non-trivial changes.
- Read relevant files under `openspec/specs/` before changing behavior.
- For new behavior, create a focused change under `openspec/changes/<change-id>/`.
- After implementation, update the affected source-of-truth spec.
- Keep specs behavioral. Avoid restating implementation details unless they affect observable behavior.

## Spec Style

- Use `### Requirement: <name>` for each behavior.
- Use `#### Scenario: <description>` for concrete cases.
- Use `GIVEN`, `WHEN`, `THEN`, and `AND` bullets.
- Prefer one focused capability per folder.
- Keep wording stable and testable.
