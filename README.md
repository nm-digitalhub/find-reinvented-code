# find-reinvented-code

An agent skill that scans an npm project for hand-written code that something
existing already covers, and reports each case with a verified replacement.

It looks for replacements in three tiers, in this order:

1. a built-in of the language, the runtime or the hosting platform;
2. a dependency the project already declares;
3. a healthy npm package, checked through the NPMScan MCP server.

It is a report. It edits no source file, installs nothing and changes no
manifest.

## Install

```bash
npx skills add nm-digitalhub/find-reinvented-code
```

## Requirements

- **NPMScan MCP server**, connected under the name `npmscan`. The skill uses it
  to check the health of declared dependencies and to vet any package it
  proposes. Without it the skill still reports the first two tiers and names
  no new package.
- git, and Node.js with npm.
- Network access.
- Optional: the **Serena MCP server**, connected under the name `serena`, for
  symbol lookups. The skill works without it.

The skill is written for Claude Code. Its frontmatter uses `context: fork`,
`agent`, `background` and `argument-hint`, which are Claude Code fields: there
the scan runs in a forked subagent and only the report returns. Other clients
ignore those fields and run the skill inline.

## Use

In Claude Code:

```
/find-reinvented-code
/find-reinvented-code src/utils
```

The optional argument narrows the scan to a path or a topic. Manifests are
still read from the project root.

## What the report contains

1. Scope: root, manifests, runtime, where versions came from, files read.
2. Findings, ranked, with location, replacement, tier, behaviour differences,
   call sites and confidence.
3. Declared dependencies that are flagged, never imported, or imported without
   being declared.
4. Candidates considered and dropped, each with its reason.
5. Dead helpers.
6. What was not covered or not verified.
7. A run log.

A written reason for hand-writing something (a comment, a commit, a plan) is
tested, not taken at its word.

## Evals

`evals/evals.json` holds three test cases in the
[Agent Skills eval format](https://agentskills.io/skill-creation/evaluating-skills),
with their fixtures under `evals/files/`:

- `full-scan`: a small project with planted cases.
- `narrowed-to-one-file`: the same project, one file.
- `not-an-npm-project`: a directory with no `package.json`.

`evals/files/fixture-app/package.json` declares the deprecated `request`
package on purpose: it is one of the planted cases. Nothing there is installed
or run. The evals live outside `skills/` so that installing the skill does not
copy them.
