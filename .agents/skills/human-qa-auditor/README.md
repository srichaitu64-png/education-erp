# Human QA Auditor — Antigravity Skill

This workspace skill makes Antigravity perform evidence-backed, persona-based end-to-end QA.

## Install in the current project

From the project root, extract/copy this folder to:

`.agents/skills/human-qa-auditor/SKILL.md`

Then restart/reload Antigravity or refresh its Customizations/Skills view. The skill is workspace-scoped.

## Install globally (Antigravity IDE)

Copy the `human-qa-auditor` folder to:

`~/.gemini/config/skills/human-qa-auditor/`

For Antigravity CLI, the global skills directory is:

`~/.gemini/antigravity-cli/skills/human-qa-auditor/`

Workspace scope is recommended for a project-specific audit.

## Invoke

In Antigravity, use `/human-qa-auditor` if slash commands are supported, or paste the prompt in `RUN_THIS_IN_ANTIGRAVITY.md`.

## Important

The skill is an instruction package; it does not magically provide credentials, browser access, or a running application. Antigravity must use available browser/computer-use capabilities or configure a compatible test runner such as Playwright. Use a staging/test tenant and synthetic data. Do not run destructive tests against production.
