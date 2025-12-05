# **Cursor IDE MCP Command Map**

| Command                   | Purpose                                                                                            | Prerequisites                                                              | Recommended Phase / Order                          |
| ------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------- |
| `#codemap`                | Generate a full structural and dependency map of the repo                                          | Filesystem, Sequential Thinking                                            | 1 — Always first; foundational overview            |
| `#audit`                  | Full multi-faceted codebase audit (structural, security, performance, docs, style, best practices) | Sequential Thinking, Filesystem, Brave Search, Firecrawl, Chrome Devtools  | 2 — After codemap; identify gaps/issues            |
| `#dependency_audit`       | Dependency version check, vulnerabilities, redundancy                                              | Filesystem, Brave Search, context7                                         | 3 — Before new features or migrations              |
| `#security_scan`          | Full repo security evaluation (secrets, unsafe patterns, library CVEs)                             | Filesystem, Brave Search, context7                                         | 4 — After audit; pre-feature or pre-release        |
| `#deadcode`               | Detect and remove unused code                                                                      | Filesystem, Sequential Thinking                                            | 5 — After audit; before refactor                   |
| `#refactor`               | Codebase-wide class/method refactoring                                                             | Filesystem, Playwright, Sequential Thinking                                | 6 — After dead code removal, pre-feature           |
| `#migrate`                | Full migration of libraries, frameworks, or patterns                                               | Filesystem, Sequential Thinking, Brave Search/context7                     | 7 — When moving technologies or patterns           |
| `#feature_blueprint`      | Pre-implementation planning for new features                                                       | Filesystem, Sequential Thinking                                            | 8 — Before implementation, after audit/mapping     |
| `#deepsearch`             | Research-driven feature implementation with testing and documentation                              | Filesystem, Playwright, Brave Search, context7, Sequential Thinking        | 9 — After blueprint; execution phase               |
| `#generate_tests`         | Automatically create unit, integration, and E2E tests                                              | Filesystem, Playwright, Sequential Thinking                                | 10 — After implementing features or refactors      |
| `#qa_review`              | Ensure code consistency, style, and quality                                                        | Filesystem, Sequential Thinking                                            | 11 — After implementation/refactor/migration       |
| `#docsupdate`             | Full repository documentation overhaul                                                             | Filesystem, Sequential Thinking                                            | 12 — After feature or refactor, before release     |
| `#api_validate`           | Validate API contracts between frontend and backend                                                | Filesystem, Sequential Thinking                                            | 13 — After implementation of features or refactors |
| `#cleanup`                | Remove temp, redundant, or outdated files                                                          | Filesystem, Sequential Thinking                                            | 14 — Final step before release or commit           |
| `#debugbrowser`           | Full browser-based debugging and performance analysis                                              | Filesystem, Chrome Devtools, Sequential Thinking                           | As-needed; whenever a bug arises                   |
| `#break_persistent_issue` | Full diagnostic reset for stubborn issues                                                          | Filesystem, Chrome Devtools, Brave Search, Playwright, Sequential Thinking | As-needed; for recurring issues or blockers        |

---

# **Suggested Typical Workflow**

1. `#codemap` → get full repo context
2. `#audit` → identify code quality/security/performance gaps
3. `#dependency_audit` → check for outdated/unsafe packages
4. `#security_scan` → ensure repo is secure
5. `#deadcode` → remove unused code safely
6. `#refactor` → apply large-scale, deterministic code improvements
7. `#migrate` → move to new libraries/frameworks if needed
8. `#feature_blueprint` → plan the next feature
9. `#deepsearch` → implement feature, research, and validate
10. `#generate_tests` → ensure testing coverage
11. `#qa_review` → sweep for style, consistency, complexity issues
12. `#docsupdate` → update and consolidate documentation
13. `#api_validate` → verify API contract correctness
14. `#cleanup` → remove temp or redundant files
15. `#debugbrowser` → run when specific issues arise
16. `#break_persistent_issue` → run when recurring bugs resist all prior attempts

---

This gives you a **complete, end-to-end workflow map**, ensuring:

* No steps are skipped
* All stages have prerequisites covered
* Debugging, security, and quality are fully integrated
* Feature implementation is research-driven and safe

---
