# EIX 2.0 Rev 0.2 Verification Record

> Verification date: 2026-07-25  
> Subject: Markdown document suite and deterministic static reference site  
> Runtime boundary: local static files only; no LLM, API, database, permission service, policy engine, or external action

## 1. Automated browser result

Test source: [`test_eix_rev02.py`](./test_eix_rev02.py)

| Area | Result | Verified behavior |
|---|---|---|
| Hash routes | PASS | Five routes render, refresh correctly, and invalid routes normalize to `#/brief` |
| Reader density | PASS | Brief / Deep persists locally and does not change the active Revision |
| Intent Patch | PASS | Preview, Apply, Revert Revision, and Branch preserve parent history |
| Evidence & Publication | PASS | Stale invalidates the Gate; Passed does not imply Published |
| Plan degradation | PASS | Higher-order Partial preserves Verified base results |
| Controlled Action | PASS | Permission can block; Approved is distinct from Queued, Executing, and Outcome |
| Rule Change | PASS | Rejected Candidate has no effect; Active is reached only after validation, approval, and stage |
| Typed Handoff | PASS | Collaborative and Process Journeys use linked, typed Work Objects |
| Markdown reader | PASS | UTF-8 Chinese, GFM tables, document TOC, internal document links, and source-route Back control |
| Keyboard | PASS | Tab sets and Pattern list support keyboard selection and stable focus |
| Touch targets | PASS | Visible controls meet the 44px target |
| Semantic labels | PASS | State badges contain text and do not rely on color alone |
| Contrast | PASS | Foundation and semantic text tokens meet WCAG AA on Paper |
| Responsive | PASS | 1440, 1280, 1024, and 390 have no document-level horizontal overflow |
| Runtime quality | PASS | Console errors: 0; page errors: 0 |

## 2. Governance invariant result

| Invariant | Result |
|---|---|
| High confidence cannot override Permission | PASS |
| Verified does not imply Allowed or Auto | PASS |
| Approved does not imply Executed | PASS |
| Rule Proposal does not affect the current Case | PASS |
| Evidence change invalidates the prior Gate | PASS |
| Publication, Action, and Rule Change use separate lifecycles | PASS |
| Partial failure preserves Verified work | PASS |
| Revert creates a new Revision instead of deleting history | PASS |
| Cross-Contract movement creates a typed link instead of mutating object type | PASS |

## 3. Content governance result

The following structural checks passed:

- one Canonical Charter and two non-authoritative Companions;
- exact Shared Kernel sequence;
- seven orthogonal semantic axes with stable IDs;
- three governed lifecycles;
- six Experience Promises;
- two seven-step Reference Journeys;
- eight shared Patterns and six reference Compositions;
- five required Hash routes;
- Markdown relative links resolve;
- Rev 0.1 remains available under `archive/rev-0.1/`.

## 4. Visual review

Reviewed screenshots:

- [`brief-1440.png`](./rev-0.2/brief-1440.png);
- [`architecture-1280.png`](./rev-0.2/architecture-1280.png);
- [`patterns-1024.png`](./rev-0.2/patterns-1024.png);
- [`brief-390.png`](./rev-0.2/brief-390.png);
- [`journeys-390.png`](./rev-0.2/journeys-390.png);
- [`document-charter-top-1440.png`](./rev-0.2/document-charter-top-1440.png);
- [`document-charter-top-390.png`](./rev-0.2/document-charter-top-390.png).

The visual review confirms:

- Editorial Architecture / Finance Working Paper direction is preserved;
- `Kernel Trace` remains the cross-page visual signature;
- Canonical / Companion / Candidate identity stays visible;
- mobile removes complex editing surfaces while preserving reading, Journey state, Evidence, and controls;
- semantic color is always accompanied by an axis name, text, or symbol.
- Markdown is rendered as a structured reading surface rather than exposed as raw source, with explicit UTF-8 decoding.

## 5. Reader Testing status

The test protocol and answer key are defined in [`READER_TEST_PROTOCOL.md`](./READER_TEST_PROTOCOL.md). A structural dry run passed, but the percentage targets remain acceptance thresholds until real no-context participants complete the study. This record does not claim human comprehension percentages without participants.
