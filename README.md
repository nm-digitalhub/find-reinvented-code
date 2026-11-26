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

1. Connect the NPMScan MCP server to your agent under the name `npmscan`
   (see Requirements).
2. From the root of the project you want to scan, add the skill:

   ```bash
   npx skills add nm-digitalhub/find-reinvented-code
   ```

   Add `-g` to install it for every project instead of this one.
3. Reload skills in your agent (in Claude Code: `/reload-skills`, or start a
   new session).
4. Check that it is listed: `npx skills list`.

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

## Example

The findings table from a run on the fixture project in `evals/files/fixture-app`
(three source files; `zod`, `date-fns` and `request` declared, nothing
installed). Columns shortened here:

| # | Location | What it does | Replace with | Tier | Confidence |
|---|---|---|---|---|---|
| 1 | `src/utils/text.js:13` `verifySignature` | Checks a webhook signature with a 32-bit rolling hash and `===` | `createHmac` + `timingSafeEqual` from `node:crypto` | A (security) | High that it should be replaced; medium on migration, since the sender must change too |
| 2 | `src/utils/misc.js:1` `makeId` | Builds a v4 UUID from `Math.random()` | `crypto.randomUUID()` | A | High |
| 3 | `src/utils/misc.js:8` `copy` | Deep copy through a JSON round trip | `structuredClone(value)` | A | High for parsed JSON; medium in general |
| 4 | `src/utils/misc.js:12` `formatDay` | Formats a date as `YYYY-MM-DD` by hand | `format(d, 'yyyy-MM-dd')` from `date-fns` (declared, never imported) | B | Medium: export not verified locally |
| 5 | `src/utils/misc.js:26` `isEmail` | Loose email regex | `zod`, after upgrading to 4.6.6 (a major upgrade) | B | Low to medium |
| 6 | `src/utils/text.js:3` `toSlug` | Hand-kept transliteration map and slugging | `slugify` or `@sindresorhus/slugify` (tie) | C | Low |

The same report listed `request` as deprecated and never imported, dropped a
one-line `capitalize` as too small, and reported `chunkUnused` as a dead
helper. For finding 1 it ran the hand-written hash and showed two different
inputs that produce the same signature.

## What it costs

The skill does not save work; it adds verification. On three eval cases, each
run once with the skill and once without:

| | With the skill | Without |
|---|---|---|
| Assertions passed | 17 of 17 | 13 passed, 3 partly, 1 failed |
| Tokens, full scan | about 103,000 | about 65,000 |
| Time, full scan | 133 s | 34 s |

Without the skill the agent found the same functions. What the skill changed
was the evidence: installed versions told apart from declared ranges,
built-ins checked against the minimum runtime, new packages put through the
gates, and unverified claims labelled as such. These are single runs on a
small fixture, on one model, with an earlier version of the skill.

## Evals

`evals/evals.json` holds three test cases in the
[Agent Skills eval format](https://agentskills.io/skill-creation/evaluating-skills),
with their fixtures under `evals/files/`:

- `full-scan`: a small project with planted cases.
- `narrowed-to-one-file`: the same project, one file.
- `not-an-npm-project`: a directory with no `package.json`.

`evals/eval_queries.json` holds 21 queries for testing when the skill
triggers: 10 that should trigger it and 11 near-misses that should not.

`evals/files/fixture-app/package.json` declares the deprecated `request`
package on purpose: it is one of the planted cases. Nothing there is installed
or run. Installing the skill copies the `evals/` folder along with it, without
that `package.json`.

## License

MIT. See [LICENSE](LICENSE).
