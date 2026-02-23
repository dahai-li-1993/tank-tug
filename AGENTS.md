# Agent Instructions

## Highest Priority: `architecture.md`
`architecture.md` is a required source of truth for the program architecture, especially systems and classes.

All agents must treat architectural consistency as a hard requirement.

## `architecture.md` Format Rules
- Keep `architecture.md` concise and simple.
- Use a tree view to show system and class structure.
- Keep it as a current-state snapshot only.
- Do not add changelog/history sections to `architecture.md`.

## Feature Planning Docs Are Mandatory
All feature planning must be documented as Markdown files under the root `planning/` folder.

For each feature, create or update one file in `planning/` that includes:
- Feature description (what is being built and why)
- Related references (files, systems, classes, docs, tickets, links)
- Fine-grained implementation task breakdown (small actionable tasks)

## Required Workflow For Any New Feature
1. Before planning, designing, or implementing, read `architecture.md`.
2. Create or update the feature plan Markdown file in `planning/` before implementation.
3. If the feature changes architecture (systems, class responsibilities, ownership, lifecycle, or dependencies), update `architecture.md` during planning/design.
4. Implement the feature using the fine-grained task breakdown from the planning file.
5. After implementation, update the feature planning file to reflect final scope/status.
6. After implementation, update `architecture.md` again so it matches the final code exactly (snapshot only, no changelog/history).
7. Do not consider work complete if `planning/` docs or `architecture.md` are stale.

## Definition Of Done
A feature is only done when all are true:
- Code changes are complete.
- `architecture.md` reflects the current architecture in terms of systems and classes.
- A corresponding `planning/*.md` file exists and contains description, references, and granular implementation tasks.
