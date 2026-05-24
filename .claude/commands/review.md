---
name: ms-code-reviewer
description: Three-pass parallel code review. Spawns 3 independent agents (quality, blast radius, adversarial) that run simultaneously, then consolidates findings. Use before merging any branch. Plan file is optional.
effort: high
---

# MS Code Reviewer

Three-pass implementation reviewer. Each pass runs as an independent agent in parallel.

## Why a Skill, Not an Agent

Subagents in Claude Code cannot spawn other agents (the Agent tool is stripped from subagent toolsets). This skill runs in the main conversation so it CAN spawn the 3 parallel agents.

## How to Run This Review

Follow these steps exactly. Do not skip the fan-out.

### Step 1: Collect Context

Run these commands and save the results:

1. `git diff development...HEAD --name-only` — list of changed files
2. `git diff development...HEAD` — full diff (fall back to `git diff --staged` or `git diff` if no branch diff)
3. Read `backend/LEARNINGS.md`
4. If the user provided a plan file path, read it

Catalog changed files into: models, serializers, ViewSets, helpers/services, commands, frontend components, hooks, services, other.

### Step 2: Spawn 3 Agents in a Single Message

Send exactly ONE message containing THREE Agent tool calls (subagent_type: general-purpose). All three run in parallel. Each receives the full diff, changed file list, LEARNINGS.md content, and plan file content (if provided).

Use model: sonnet for each pass.

The prompts for each pass are defined below in the PASS sections. Paste the full diff and context into each prompt — do not ask the subagent to fetch it.

### Step 3: Consolidate After All 3 Return

Wait for all three to complete, then produce the consolidated report using the format in the "Consolidation Template" section below.

---

## PASS 1 PROMPT: Code Quality

Use this as the prompt for the Pass 1 agent:

"You are reviewing changed code for quality, conventions, and known pitfalls. You are ONLY looking at the changed files themselves — not their consumers or callers (that is a separate pass).

### Plan Compliance (only if plan file provided)

For each item in the plan:
- Was it implemented? Mark as DONE, PARTIAL, or MISSING
- Does the implementation match what the plan described?
- Are there changes to files NOT in the plan? Flag as scope violations

### Naming Quality

Read each changed file and check naming against the project naming philosophy — code should read like a story in plain English:
- Variable names should make sense when read out loud in a sentence
- No abbreviations (facebook not fb, organization not org)
- Booleans should read as questions (is_, has_, needs_, should_)
- Constants should include their unit (DELAY_MS, BUDGET_CENTS)
- Function names should use the right verb (ensure = idempotent, resolve = figure out the answer, process = multi-step pipeline)

### Convention Checks

For each changed file, apply checks based on file type:

Models: timestamps on new models use created_at/updated_at, CheckConstraint for critical invariants, nullable FKs handled safely, choices as class-level constants, custom managers before model class, signals after model class.

Serializers: read/write split when shapes differ, validate() handles partial updates, nested writes wrapped in transaction.atomic, no sensitive fields exposed, insight serializers use getattr(obj, field, 0) or 0 pattern.

ViewSets: get_queryset() is org-scoped, permission class matches sensitivity, draft/non-CTE actions skip CTE attachment, select_related/prefetch_related present where needed.

Helpers/Services: services are classes with staticmethod methods, helpers are standalone functions, errors bubble up, querysets evaluated only once.

Management Commands: follow the template (module constants, logger init, job_monitor, lock file), subscription validation guard, rate limit check, thin wrappers delegating to helpers.

Frontend Components: Shadcn UI + Tailwind only, state at top in useState block, React Query for server data, new API calls in services/*.js not service/index.js, mutations have onSuccess with invalidateQueries.

Frontend Hooks: React Query wrappers return clean destructured properties, staleTime set explicitly, keepPreviousData for paginated tables.

### LEARNINGS.md Pitfall Checks

Check every changed file against these specific pitfalls:
- .first() on large tables — adds ORDER BY pk, defeats index usage. Use .order_by(indexed_field).first() or [:1] with explicit ordering
- update_or_create + pre_save signal — on Django 5.x, pre_save modifications to fields NOT in defaults dict are silently dropped on UPDATE path
- Any other items found in LEARNINGS.md

### Security Checks

- No hardcoded credentials, API keys, or tokens
- No SQL injection via string concatenation or f-string interpolation
- No user input in SQL table/column names without allowlist
- No cross-organization data leakage
- Permission checks are active (not commented out)
- No sensitive data in logs, error messages, or API responses

### Comment Quality

- Plain English, no tech jargon
- Self-contained — never references other comments or code
- Multi-step processes use # --- pass name --- format
- No comments that just restate what the code does

Report findings with severity (CRITICAL/HIGH/MEDIUM/LOW), file path, line number, and specific fix recommendation."

---

## PASS 2 PROMPT: Blast Radius

Use this as the prompt for the Pass 2 agent:

"You are analyzing how the changed code affects the REST of the system — everything OUTSIDE the changed files. Your job is to find things that will break because of these changes.

### Consumer Analysis

For EVERY changed function, class, model field, mixin, component, or hook:

1. Grep the ENTIRE project for all consumers/callers/importers
2. Read each consumer file
3. Verify the consumer still works correctly with the change
4. Pay special attention to: management commands, email templates, admin.py, notification helpers — these are commonly missed

For every renamed field, class, function, or import path — grep for the OLD name. Any remaining references are broken.

For every deleted file — grep for imports of that file.

Report a blast radius map: Changed item -> list of consumers found -> compatibility status (OK / BROKEN / NEEDS UPDATE)

### Cross-Platform Parity

When Facebook code changed: find the TikTok equivalent, check if it needs the same change. When TikTok code changed: same in reverse. When unified code changed: verify both platform paths still work. When a shared mixin changed (MsInsightFieldsMixin), check TikTokInsightFieldsMixin for matching changes.

### CTE Pipeline Impact

If any insight-related code changed (CTE builders, dashboard querysets, sort annotations, insight mixins):
- Verify the chain: CTE builder annotation names -> dashboard queryset -> sort annotation field references -> serializer mixin getattr field names
- If a derived metric formula changed, check sort_annotations.py has matching SQL expression
- Check that unified_stats_viewset.py hand-rolled formulas still match the mixin formulas

### React Query Cache Consistency

If frontend queries or mutations changed:
- Verify every useMutation has onSuccess with invalidateQueries
- Verify invalidated query keys match actual query keys
- Check query keys are hierarchical and consistent

### Soft Delete Edge Cases

If code touches soft-deletable models (RuleTemplate, ActiveRule, CapiConfig):
- Check unique constraint conflicts with soft-deleted records
- Verify restore paths use all_objects, not objects
- Verify bulk operations manually cascade

Report findings with the blast radius map and severity grades."

---

## PASS 3 PROMPT: Break It

Use this as the prompt for the Pass 3 agent:

"You are a QA engineer trying to break this code. You have NOT seen any previous review findings. Your only job is to find inputs, scenarios, and edge cases that make this code fail.

### ENFORCED EVIDENCE RULES (READ TWICE)

Past Pass-3 runs have produced finding text that sounded reasonable but did not correspond to actual code in the files. The user flagged this as fake-checkpoint behavior. Your output WILL be verified line-by-line against the real files before being accepted.

To prove you read the code, EVERY finding MUST include all five of these fields:

1. **File path + line numbers** — absolute path and the exact line range of the suspect code.
2. **Verbatim snippet** — a 1-4 line copy-paste from the file, matching whitespace exactly. Not paraphrased. Not summarized.
3. **Triggering input or scenario** — concrete and reproducible. Examples: "POST body with `shop=''`", "Shopify returns 200 with body `{\"error\": \"invalid_grant\"}`", "two concurrent OAuth completions for the same shop".
4. **Actual behavior** — the specific failure mode (exception type + where it lands, wrong row written, leaked data, silent skip, etc).
5. **Expected behavior + minimal fix** — what should happen and the smallest code change that gets there.

If you cannot produce all 5 fields for a finding, **DROP THE FINDING**. Generic statements like "missing input validation" or "could fail under load" without a concrete trigger are rejected. Quality over quantity — three real bugs beats ten theoretical ones.

### Input Edge Cases
For every function, method, validation gate, or conditional:
- What happens with None/null?
- What happens with empty list, empty string, empty dict?
- What happens with zero?
- What happens with a missing dictionary key?
- What happens with a type mismatch (string where int expected)?
- What happens with partial data (PATCH with only one field)?

### Assumption Audit
For every piece of code:
- What assumptions does it make about its inputs? Are those enforced or just hoped for?
- What assumptions does it make about database state? Could a race condition violate them?
- What assumptions does it make about external API responses? What if the response is malformed?

### Performance Edge Cases
- Any .first() calls on potentially large tables?
- Any endpoints with pagination_class=None that could return unbounded results?
- Any N+1 queries (iterating a queryset and accessing related objects without prefetch)?
- Any queryset evaluated multiple times (.exists() then .filter() then iteration)?

### Security Probes
- Can a user from Organization A access Organization B's data through this code?
- Is there any user-controlled input that reaches raw SQL, file paths, or shell commands?
- Are there any endpoints where permissions are checked at class level but bypassed at action level?

### Required Output Format

Use this EXACT structure for every finding — no prose between findings:

[SEVERITY: CRITICAL | HIGH | MEDIUM | LOW] Short title
File: <absolute path>:<line range>
Snippet:
```
<copy-pasted verbatim from the file — must match exactly, including indentation>
```
Triggering input/scenario: <concrete and reproducible>
Actual behavior: <what fails — exception type, wrong DB write, leaked data, etc>
Expected behavior: <what should happen instead>
Fix: <minimal code change>

End with a count line: `Total findings: N (Critical: x, High: y, Medium: z, Low: w)`.

If you find fewer than 3 real bugs after reading every file, say so explicitly. Do not pad with theoretical issues."

---

## Consolidation Template

After all 3 passes return, produce this report:

### Plan Completion (if plan was provided)

| Plan Item | Status | Notes |
|-----------|--------|-------|
| Step 1: ... | DONE / PARTIAL / MISSING | Details |

### Blast Radius Map (from Pass 2)

| Changed Item | Consumers Found | Status |
|---|---|---|
| Example | 3 direct, 2 via mixin | OK / BROKEN / NEEDS UPDATE |

### Findings by Pass

Group each pass's findings using this format:

[SEVERITY] Short description
File: path/to/file.py:line_number
Issue: What is wrong and why it matters
Fix: Specific fix recommendation

### Scope Violations (if plan was provided)
List any changes that fall outside the plan scope.

### Review Summary

| Category | CRITICAL | HIGH | MEDIUM | LOW |
|----------|----------|------|--------|-----|
| Pass 1   | 0        | 0    | 0      | 0   |
| Pass 2   | 0        | 0    | 0      | 0   |
| Pass 3   | 0        | 0    | 0      | 0   |

Severity levels:
- CRITICAL — Will cause bugs, data loss, or security vulnerabilities. Must fix before merge.
- HIGH — Pattern violation or missing functionality that will cause problems. Should fix before merge.
- MEDIUM — Could cause issues under certain conditions. Fix recommended.
- LOW — Convention or quality issue. Note for awareness.

Verdict: APPROVE / WARNING / BLOCK
- APPROVE — No CRITICAL or HIGH in any pass
- WARNING — HIGH issues exist, can merge after fixing them
- BLOCK — CRITICAL issues, must fix before merge

### Confidence Rule

- Report ONLY issues you are more than 80% confident about
- Do NOT fabricate issues or flag things that do not exist
- CONSOLIDATE similar issues (e.g., "3 ViewSets missing org-scoping" not 3 separate findings)
- SKIP stylistic preferences unless they violate project conventions
