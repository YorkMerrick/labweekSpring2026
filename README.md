# labweekSpring2026

### Setup

1. Clone the repo
2. Install dependencies
```bash
npm install
```
3. Create the env variables and populate

```bash 
cp .env.example .env
```

4. Create input.json and populate with relevant repos

```bash 
cp input.example.json input.json
```

5. After setting up aws profile using

```bash 
aws configure sso
```
- note the PROFILE name and run
```bash 
cdk bootstrap --profile PROFILE
cdk synthesize
cdk deploy 
```

This will deploy the CDK stack to AWS, creating the appropriate secrets, s3 and lambda.

### Example output Android

```
Weekly Engineering Digest
Tooling & Build System Updates

AGP 9 upgrade updated convention plugins, Kotlin test libs, and CI task names.
Snapshots Maven repo enabled for Conductor + UI toolkit snapshot builds.
GitLab regression UI test job updated to new managed‑device task naming.
Impact: Tooling alignment needed across modules for stable builds.
Action Consideration: Teams may want to confirm local IDE/Gradle sync stability.
Context Contact: wezley98

Environment / Developer Readiness

Coroutine test setup modernised using UnconfinedTestDispatcher.
Initial connectivity state added to connectivity flow.
New theme/typography assets loaded at app startup for News.
Impact: Developers may see behaviour changes in test harnesses and theme init paths.
No Immediate Action.
Context Contact: TomHyde1 / IcemarkUK

Feature Additions

Added optional timestamp to video navigation + web widget data flows.
Introduced personalisation CMP vendor gating analytics activation.
Added runtime theming + News‑specific icon overrides.
Impact: New metadata and feature‑flag‑dependent flows may affect UI behaviour.
Action Consideration: Awareness for teams integrating new video or News surfaces.
Context Contact: Lozzas-Teachest / TomHyde1 / IcemarkUK

Refactoring & Architecture

Content‑grouping models moved from common to new dedicated modules with DI separation.
Tracking architecture split into narrower interfaces (Video/Article/Followable).
Tracking gating logic centralised into new IsTrackingEnabledUseCase.
Impact: Module boundaries tightened; imports/DI graphs updated.
Action Consideration: Teams referencing these models or DI bindings should sync imports.
Context Contact: YorkMerrick / TomHyde1

Testing Changes

Test migrations to JUnit5 via Kotlin’s JUnit5 integration.
Updated test fakes for new session‑type parameters.
Heartbeat + connectivity tests expanded for flow‑reaction behaviour.
Impact: Test infrastructure more consistent with new AGP/Kotlin ecosystem.
No Immediate Action.
Context Contact: wezley98 / GinaHooton

Behavioural / Runtime Changes

Heartbeat start/stop now reacts dynamically to connectivity changes.
Session flows enriched with sessionType and isLoginJourney context.
Tracking enablement now fully gated by personalisation + remote config.
Impact: Potential shifts in runtime tracking, session handling, and heartbeat stability.
Action Consideration: Cross‑feature features should be aware of changed gating logic.
Context Contact: wezley98 / GinaHooton / TomHyde1

Risks, Dependencies & Cross‑Team Considerations

Snapshot dependencies (Conductor + UI toolkit) may introduce variability.
New CMP vendor and tracking gating behaviour may influence analytics pipelines.
New theme/typography assets and bottom‑nav overrides affect UI consistency.
Impact: Coordination helpful when integrating tracking, theme, or session behaviour.
Action Consideration: Monitor for regressions in areas consuming these cross‑module flows.


TL;DR

Snapshot‑based tooling + AGP 9 upgrades require ecosystem alignment.
Tracking architecture refactored with new gating + CMP personalisation logic.
Session flows updated with sessionType and login‑journey context.
Runtime theming + News icons introduced with new assets and overrides.
Content‑grouping models modularised, cleaning architecture boundaries.
```

### Example output iOS

```
Weekly Engineering Digest
Tooling & Build System Updates

Restored missing NewsGB launch‑screen asset catalog to fix local News build failures.
Updated Xcode project references across multiple PRs, mainly adding new files and relocating feature‑toggle sources.
Bumped gdp‑streaming‑auth‑framework-ios to 4.1.0 with updated transitive security dependency.
Impact: Improves build stability and aligns project structure.
Action Consideration: Awareness only; no immediate workflow change.
Context Contact: AndyNattrass, ryangibson-sky

Environment / Developer Readiness

Feature‑toggle keys migrated to consistent snake_case across the codebase.
Deep‑link toggle handling updated with safer production gating.
UI tests restructured with new F1StreamSelector screen objects.
Impact: Reduces ambiguity and improves local debugging and test reliability.
Action Consideration: Teams may want to ensure local tooling recognises updated toggle names.
Context Contact: roryobryan-sky, TKN02

Feature Additions

Added SubscriptionService and ProductService wired into app startup via Remote Config.
Introduced profile name display via JWT decoding for More Menu.
Added MoreMenuHeaderTitle domain model and use case for dynamic header resolution.
Impact: Lays groundwork for subscriptions and enhances personalised UI.
Action Consideration: Awareness of new app‑level dependencies and JWT‑based name flows.
Context Contact: tonyzhou-merapar, ClaudiaDanciu

Refactoring & Architecture

Consolidated feature‑toggle logic into FeatureToggleService, removing ad‑hoc helpers.
Reorganised related files in Xcode project for clearer module boundaries.
Removed legacy StreamSelector tests and replaced with focused F1 variants.
Impact: Simplifies toggle management and improves test maintainability.
Action Consideration: No immediate action; architectural clarity improved.
Context Contact: roryobryan-sky, TKN02

Testing Changes

Added new unit tests for toggle deep‑linking, subscription flows, and More Menu name decoding.
UI test plans updated to register F1‑specific selectors.
Multiple PRs introduced small test fixture updates for renamed toggle keys.
Impact: Strengthens regression protection in new and refactored areas.
Action Consideration: Watch for renamed fixtures when updating downstream tests.
Context Contact: roryobryan-sky, tonyzhou-merapar, TKN02

Behavioural / Runtime Changes

Updated link handling so webLink vs externalWebLink actions preserve true routing semantics.
Applied baseline offset to fix clipped UINavigationBar titles.
More Menu title now updates reactively based on login state and ID token changes.
Impact: User‑visible behavioural correctness improvements across navigation and link routing.
Action Consideration: Awareness for QA when validating link flows and navigation titles.
Context Contact: ScruffyHipster, sergeyandreev, ClaudiaDanciu

Risks, Dependencies & Cross‑Team Considerations

Introduction of JWT‑based name decoding adds dependency on ID token stability.
Subscription flows now integrate with backend responses and Remote Config.
Updated security frameworks may affect downstream platform integrations.
Impact: Cross‑team awareness beneficial around auth, subscriptions, and security alignment.
Action Consideration: No immediate action; monitor for token schema or backend contract changes.
Context Contact: tonyzhou-merapar, ryangibson-sky


TL;DR

Feature‑toggle system consolidated and renamed for consistency.
New subscription and profile‑name flows integrated into app startup.
Multiple asset, routing, and UI correctness fixes applied.
Significant test restructuring, especially for F1 selectors.
Dependency bumps and project reorganisation improve build stability.
```

### Prompt

```
Please generate a clear, structured weekly digest based on the following dataset.
Summarise all key themes, changes, and insights, and prioritise actionable items, ensuring stakeholders understand where awareness, alignment, or follow‑up may be needed — without giving prescriptive instructions about day‑to‑day developer or tester responsibilities.
The digest must be short and concise, even if the dataset is long.
Length Constraints

The digest must be noticeably shorter than the dataset.
Each section may contain no more than 3 bullet points.
Each bullet point must be a single short sentence.
Avoid verbosity, duplication, filler wording, or over‑explanation.
Use only essential information.

Output Formatting Requirements
The entire output must be valid Markdown, using:

Markdown section headers (e.g., ## Tooling & Build Updates)
Markdown bullet points (- only)
Short, high‑signal bullets
A Markdown TL;DR section at the end

No long paragraphs should appear anywhere in the digest.
Digest Structure (Markdown Sections)
The digest must be organised into the following Markdown sections:


Tooling & Build System Updates


Environment / Developer Readiness


Feature Additions


Refactoring & Architecture


Testing Changes


Behavioural / Runtime Changes


Risks, Dependencies & Cross‑Team Considerations


Within each section, include:

Bullet‑point summaries of the most important changes (max 3)
A brief impact bullet (1 short sentence)
An Action Consideration or No Immediate Action bullet
PR author bullet formatted as:
- **Context Contact:** <author name>
(only when meaningful)

PR Author Awareness

Include PR authors only for significant changes.
Do not imply responsibility, escalation, or instruction.
Use authorship solely for traceability.

Non‑Obvious Considerations (include when relevant)
If present in the dataset, include short Markdown bullets about:

Tooling or IDE/plugin alignment due to AGP, Kotlin, Compose, or Gradle changes
Newly added repositories or snapshot dependencies
Module, dependency, DI, or serialization changes
Remote Config or feature‑flag impacts
CI task renames or variant changes
New JSON/assets/icons/fonts/themes
API header or JS bridge updates
Behavioural, async, lifecycle, or gating changes

These must be framed as awareness, not instruction.
TL;DR Section
At the end of the digest, include:

## TL;DR
3–5 extremely concise Markdown bullets summarising the most critical takeaways

Goal
Produce a compact, skimmable Markdown digest suitable for engineering leadership and cross‑team consumption, enabling them to quickly understand:

What changed
Why it matters
Where awareness or alignment may help
Any workflow/environment/tooling considerations
Who authored each change
Emerging risks or dependencies
```
