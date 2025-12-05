# **Cursor IDE MCP Commands Cheatsheet**

| Command                   | Purpose                                                                     | When to Run / Notes                                                |
| ------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `#codemap`                | Generate a full repo structure & dependency map                             | First step in any project or major refactor; get complete overview |
| `#audit`                  | Multi-phase codebase audit (structural, security, performance, docs, style) | After codemap; identify weaknesses, code smells, gaps              |
| `#dependency_audit`       | Check dependencies for versions, CVEs, obsolescence                         | Before starting new features or migrations                         |
| `#security_scan`          | Detect hardcoded secrets, unsafe patterns, vulnerable libraries             | Pre-release or pre-feature to ensure security baseline             |
| `#deadcode`               | Find and remove unused code, functions, classes                             | After audit, before refactor; keep codebase clean                  |
| `#refactor`               | Rename/migrate classes, methods, large-scale code changes                   | After dead code removal, before feature implementation             |
| `#migrate`                | Full migration of a library, framework, or pattern                          | When switching technologies or patterns project-wide               |
| `#feature_blueprint`      | Plan new features: components, state, API, risks                            | Before coding; ensures structured implementation                   |
| `#deepsearch`             | Research-driven feature implementation + E2E testing                        | After blueprint; execute and validate new features                 |
| `#generate_tests`         | Automatically create unit, integration, and E2E tests                       | After implementing new code or refactors                           |
| `#qa_review`              | Check code consistency, style, and complexity                               | After implementation or refactor; maintain standards               |
| `#docsupdate`             | Overhaul and consolidate documentation                                      | After major changes or feature additions                           |
| `#api_validate`           | Verify frontend/backend API contract compliance                             | After new features, refactors, or backend changes                  |
| `#cleanup`                | Remove temporary, redundant, or outdated files                              | Final step before release or commit                                |
| `#debugbrowser`           | Full browser debugging, performance, and network analysis                   | When a specific bug occurs; ad hoc                                 |
| `#break_persistent_issue` | Full diagnostic reset for recurring or stubborn issues                      | When a bug persists after multiple fixes; escalation               |

---

### **Quick Usage Tips**

* **Planning / Pre-work:** `#codemap` → `#audit` → `#dependency_audit` → `#security_scan`
* **Code improvements:** `#deadcode` → `#refactor` → `#migrate` → `#generate_tests`
* **Feature work:** `#feature_blueprint` → `#deepsearch` → `#api_validate` → `#qa_review`
* **Documentation / housekeeping:** `#docsupdate` → `#cleanup`
* **Debugging / urgent issues:** `#debugbrowser` → `#break_persistent_issue`

---
