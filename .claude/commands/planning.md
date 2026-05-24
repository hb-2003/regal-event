---
name: planning-guidelines
description: Use when starting any new feature, integration, or significant change in MediaScale. Guides research, problem definition, solution design, and plan documentation.
---

# Planning Guidelines

Use this skill when starting any new feature, integration, or significant change in MediaScale. Good planning makes implementation and review faster and more accurate.

## When to Use

- Before implementing any feature that touches more than 2-3 files
- Before any database schema changes
- Before any new API endpoint or external integration
- Before any cross-platform work (Facebook + TikTok)

## The Planning Process

### Step 1: Research First — Understand Before Proposing

Before writing a single line of plan, research what already exists:

1. **Read the relevant ARCHITECTURE.md** (backend or frontend) to understand how the system works today
2. **Read backend/LEARNINGS.md** to check for known gotchas related to this area
3. **Search the codebase** for similar patterns — if we've done something like this before, follow the same approach
4. **Read existing plan docs** in `docs/plans/` to see if related work has been planned or completed
5. **Check the reference docs** listed in CLAUDE.md (model-reference.md, commands-reference.md, integrations-reference.md, soft-delete.md) if the work touches those areas

Do NOT skip this step. Most planning mistakes come from not understanding what already exists.

**Verification rule:** Every claim about current state must be backed by a file path where it was verified. "The campaign model has a budget_type field" is not good enough — "RemoteCampaign.budget_type (campaign/models.py)" is. If you can't point to a file path, you haven't verified it — go read the code first.

### Step 2: Define the Problem Clearly

Write a clear problem statement that answers:
- What is the current state? (what exists today)
- What is the desired state? (what we want)
- Why does this matter? (business reason or technical necessity)

### Step 3: Understand Current State and Design the Solution

Research what exists and propose the solution together — these happen as one step because you can't design well without understanding the current state, and documenting the current state without a solution direction is wasted work.

**Current state — document:**
- Which apps/modules are involved
- How data currently flows through the relevant parts
- What models, ViewSets, serializers, and services exist in this area
- What the frontend currently does for this feature area

**Frontend state management — specifically check:**
- What data already lives in Redux (ad accounts, offers, landing pages — these are globally shared)
- What data is already fetched via React Query hooks
- What data is already available from URL params or context
- Do NOT propose new data fetching without first confirming the data isn't already available somewhere

**Solution — propose:**
- What changes at each layer (models, serializers, ViewSets, services, frontend components)
- Which existing patterns to follow (name the specific files/classes as reference)
- What new files need to be created vs what existing files get modified
- How this interacts with existing features (multi-tenancy, automation rules, insights, etc.)

**Before writing the plan file**, follow this discipline:
1. Present a numbered list of ONLY the decisions the user explicitly approved during the conversation
2. Separately flag anything that is an inference or carried from existing code — do not silently include it as decided
3. Get user confirmation that the decision list is complete and correct
4. Write the plan from that confirmed list, plus verified current-state details that are clearly labeled as existing code. Do not add new decisions or inferences that the user has not approved.

### Step 4: Break Into Implementation Steps

Create numbered steps that can be implemented and tested independently:
- Each step should be small enough to review in one session
- Each step should leave the system in a working state
- Order steps so earlier ones don't need rework when later ones are implemented
- Flag steps that depend on other steps being complete first

### Step 5: Identify Risks and Open Questions

List anything that might go wrong or needs further investigation:
- Performance concerns (large tables, expensive queries)
- Edge cases (what happens when X is empty, null, or unexpected)
- Migration concerns (existing data that needs handling)
- API compatibility (will this break existing frontend code)

## Plan Scope Rules

These rules exist because past plans have included unapproved items, unverified assumptions, and language from discarded discussions. They are not optional.

- **Only include what was agreed.** Every item in the plan must trace to something the user explicitly approved. If something wasn't discussed, ask before including it.
- **Never blend sources silently.** There are three sources of information during planning: (1) what the user decided, (2) what existing code does, (3) your own inferences. Never mix these without labeling which is which.
- **A shorter plan with only verified decisions is better** than a comprehensive one with assumptions mixed in. When in doubt, leave it out and ask.

## Plan File Format

Save plans to `docs/plans/` following the format of existing plans. Required structure:

- **Problem statement** — current state, desired state, why it matters
- **Current architecture** — what exists, with file paths for every reference
- **What changes vs what stays** — explicitly list files and behaviors that are NOT modified, not just what is. This prevents scope creep and makes it clear what the implementation should not touch.
- **Implementation steps** — numbered, each with the files it touches and a verification step
- **Risks and open questions**
- **Acceptance criteria** — a checkboxed list of concrete, verifiable statements of what "done" looks like. Each item should be testable — not "works correctly" but "dropdown shows both platforms with icons, URL contains composite IDs after selection"

Do NOT add code blocks to plan files — this is a project rule for the docs/ folder.

## During Implementation

After completing each implementation step:
- Invoke the **plan-doc-updater** agent in the foreground (not background — it needs Edit permission which requires user approval), passing the plan file path and what was just completed (step number, any decisions made, any deviations from the plan).
- If a decision was made during implementation that changes the plan (different approach, skipped step, new edge case discovered), include that in the plan-doc-updater invocation so it gets recorded in the Decisions Log.

Do this after EVERY completed step, not just at the end. A plan that only gets updated at the end is useless for context if the session gets interrupted or compacted mid-work.

## After All Steps Are Complete

Once all implementation steps from the plan are done, invoke the **ms-code-reviewer** agent with the plan file path. Do NOT consider the work mergeable until the ms-code-reviewer has run and returned APPROVE or WARNING with all issues addressed.

## Common Planning Mistakes to Avoid

- Proposing a solution without reading existing code first
- Duplicating logic that already exists in a helper or service
- Forgetting that TikTok is parallel to Facebook, not layered on top
- Not checking if the feature needs changes in both platforms (Facebook AND TikTok)
- Adding new data fetching on the frontend without checking if the data is already in Redux or fetched elsewhere
- Including items in the plan that were not explicitly discussed and approved
