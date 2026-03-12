# Weekly Engineering Digest

## Tooling & Build System Updates

- AGP 9 upgrade updated convention plugins, Kotlin test libs, and CI task names.
- Snapshots Maven repo enabled for Conductor + UI toolkit snapshot builds.
- GitLab regression UI test job updated to new managed‑device task naming.

**Impact:** Tooling alignment needed across modules for stable builds.  
**Action Consideration:** Teams may want to confirm local IDE/Gradle sync stability.  
**Context Contact:** `wezley98`

---

## Environment / Developer Readiness

- Coroutine test setup modernised using `UnconfinedTestDispatcher`.
- Initial connectivity state added to connectivity flow.
- New theme/typography assets loaded at app startup for News.

**Impact:** Developers may see behaviour changes in test harnesses and theme init paths.  
**No Immediate Action.**  
**Context Contact:** `TomHyde1 / IcemarkUK`

---

## Feature Additions

- Added optional timestamp to video navigation + web widget data flows.
- Introduced personalisation CMP vendor gating analytics activation.
- Added runtime theming + News‑specific icon overrides.

**Impact:** New metadata and feature‑flag‑dependent flows may affect UI behaviour.  
**Action Consideration:** Awareness for teams integrating new video or News surfaces.  
**Context Contact:** `Lozzas-Teachest / TomHyde1 / IcemarkUK`

---

## Refactoring & Architecture

- Content‑grouping models moved from common to new dedicated modules with DI separation.
- Tracking architecture split into narrower interfaces (Video/Article/Followable).
- Tracking gating logic centralised into new `IsTrackingEnabledUseCase`.

**Impact:** Module boundaries tightened; imports/DI graphs updated.  
**Action Consideration:** Teams referencing these models or DI bindings should sync imports.  
**Context Contact:** `YorkMerrick / TomHyde1`

---

## Testing Changes

- Test migrations to JUnit5 via Kotlin’s JUnit5 integration.
- Updated test fakes for new session‑type parameters.
- Heartbeat + connectivity tests expanded for flow‑reaction behaviour.

**Impact:** Test infrastructure more consistent with new AGP/Kotlin ecosystem.  
**No Immediate Action.**  
**Context Contact:** `wezley98 / GinaHooton`

---

## Behavioural / Runtime Changes

- Heartbeat start/stop now reacts dynamically to connectivity changes.
- Session flows enriched with `sessionType` and `isLoginJourney` context.
- Tracking enablement now fully gated by personalisation + remote config.

**Impact:** Potential shifts in runtime tracking, session handling, and heartbeat stability.  
**Action Consideration:** Cross‑feature features should be aware of changed gating logic.  
**Context Contact:** `wezley98 / GinaHooton / TomHyde1`

---

## Risks, Dependencies & Cross‑Team Considerations

- Snapshot dependencies (Conductor + UI toolkit) may introduce variability.
- New CMP vendor and tracking gating behaviour may influence analytics pipelines.
- New theme/typography assets and bottom‑nav overrides affect UI consistency.

**Impact:** Coordination helpful when integrating tracking, theme, or session behaviour.  
**Action Consideration:** Monitor for regressions in areas consuming these cross‑module flows.

---

## TL;DR

- Snapshot‑based tooling + AGP 9 upgrades require ecosystem alignment.
- Tracking architecture refactored with new gating + CMP personalisation logic.
- Session flows updated with `sessionType` and login‑journey context.
- Runtime theming + News icons introduced with new assets and overrides.
- Content‑grouping models modularised, cleaning architecture boundaries.
