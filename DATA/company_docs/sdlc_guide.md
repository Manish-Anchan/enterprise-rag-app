# NovaTech Solutions — Software Development Lifecycle (SDLC)

**Last Updated:** May 1, 2025
**Document Owner:** Engineering Platform Team

---

## 1. Overview

This document outlines the software development lifecycle at NovaTech Solutions. All engineering teams are expected to follow these standards to ensure code quality, security, reliability, and a consistent developer experience across our codebase. Deviations from this process require approval from the VP of Engineering, Priya Patel.

## 2. Git Workflow

NovaTech follows a **trunk-based development** model with short-lived feature branches.

### Branching Strategy
- **Main branch (`main`):** The primary branch. Always deployable. Direct commits to `main` are blocked.
- **Feature branches:** Created from `main` for each piece of work. Branch naming convention: `<type>/<ticket-id>-<short-description>`. Example: `feat/NOVA-1234-add-user-auth` or `fix/NOVA-5678-null-pointer-crash`.
- **Branch types:** `feat/` (new features), `fix/` (bug fixes), `chore/` (maintenance), `docs/` (documentation), `refactor/` (code restructuring).
- **Branch lifespan:** Feature branches should be merged within **3 business days**. Long-lived branches create merge conflicts and integration risk. If a feature takes longer, break it into smaller PRs behind a feature flag.

### Merge Strategy
All merges to `main` use **squash merge**. This keeps the commit history clean and makes reverting changes straightforward. The squash commit message should follow Conventional Commits format: `feat(auth): add SSO login flow (NOVA-1234)`.

## 3. Pull Request (PR) Process

### Requirements for Merging
Every PR to `main` must satisfy the following before merge:

1. **Minimum 2 reviewers** must approve the PR.
2. **At least 1 reviewer must be a Code Owner** for the files being changed. Code owners are defined in the `CODEOWNERS` file in each repository.
3. **All CI checks must pass** (build, tests, lint, security scan).
4. **No unresolved review comments** — all conversations must be resolved.
5. **PR description** must include: what changed, why it changed, how to test it, and a link to the Jira ticket.

### Code Review Standards
- **PR size:** Keep PRs under **400 lines of changed code** (excluding generated files and tests). Larger PRs are harder to review and more likely to introduce bugs.
- **Review turnaround:** Reviewers are expected to provide initial feedback within **24 hours** of being requested. If you cannot review in time, reassign to another qualified reviewer.
- **Review quality:** Reviews should focus on correctness, maintainability, security, and edge cases. Stylistic preferences should be enforced by automated linters, not humans.

## 4. CI/CD Pipeline

Our CI/CD pipeline is built on **GitHub Actions** and runs automatically on every PR and merge to `main`.

### Pipeline Stages

```
Push/PR → Build → Unit Tests → Integration Tests → Lint → Security Scan → Deploy
```

| Stage | Tool | Failure Action |
|-------|------|---------------|
| **Build** | Docker / Go build | PR blocked |
| **Unit Tests** | pytest / go test | PR blocked |
| **Integration Tests** | pytest + TestContainers | PR blocked |
| **Lint** | ruff (Python), golangci-lint (Go), ESLint (JS) | PR blocked |
| **Security Scan** | Snyk (dependencies) + Semgrep (SAST) | PR blocked for Critical/High, warning for Medium |
| **Deploy** | ArgoCD + Helm | Varies by environment |

### Pipeline Performance
- Target: Full CI pipeline completes in under **10 minutes**.
- Flaky tests: If a test fails intermittently 3 or more times in a week, it is quarantined and an issue is filed. The owning team has 5 business days to fix or remove the flaky test.

## 5. Environments

| Environment | Deployment | Access | Purpose |
|------------|------------|--------|---------|
| **Development (`dev`)** | Auto-deploy on merge to `main` | All engineers | Integration testing, feature validation |
| **Staging (`staging`)** | Manual promotion from dev | All engineers (read), SRE team (deploy) | Pre-production testing, performance testing, customer demo |
| **Production (`prod`)** | Release train (Tuesdays) | SRE team only | Live customer traffic |

### Release Train
- Production deployments happen every **Tuesday at 10:00 AM PT** ("Release Train Tuesday").
- A release branch is cut from `main` on Monday afternoon.
- The release is validated in staging Monday evening.
- The SRE team deploys to production Tuesday morning using a canary deployment strategy.
- **No production deployments on Fridays** unless it is a critical hotfix (SEV1/SEV2).

## 6. Testing Requirements

### Unit Tests
- **Minimum 80% code coverage** for all services. Coverage is measured by Codecov and reported on every PR.
- New code must include tests. PRs that decrease coverage below 80% will be blocked.
- Unit tests should be fast (entire suite under 2 minutes) and deterministic (no external dependencies).

### Integration Tests
- Required for all API endpoints, database interactions, and external service integrations.
- Use TestContainers for database and message queue dependencies.
- Integration tests run in the CI pipeline against ephemeral containers.

### End-to-End (E2E) Tests
- Maintained for critical user flows (authentication, payment, core product workflows).
- Run nightly against the staging environment. Failures trigger a Slack notification to the owning team.

## 7. Feature Flags

All user-facing features must be deployed behind a **feature flag** using our LaunchDarkly integration.

- Feature flags allow gradual rollout: 1% → 10% → 50% → 100% of users.
- Flags must be cleaned up (removed from code) within **30 days** of reaching 100% rollout.
- Flag naming convention: `enable-<feature-name>` (e.g., `enable-sso-login`).

## 8. Rollback Procedures

### Automated Rollback
- If the error rate for a deployment exceeds **1%** (measured by Datadog over a 5-minute window), the deployment is automatically rolled back by ArgoCD.
- Automated rollback triggers a SEV3 incident and a PagerDuty alert.

### Manual Rollback
For situations requiring manual intervention:

```bash
# Rollback to the previous deployment
kubectl rollout undo deployment/<service-name> -n production

# Verify the rollback
kubectl rollout status deployment/<service-name> -n production
```

After any rollback, a post-mortem is required within 48 hours to identify root cause and preventive measures.

For questions about SDLC processes, contact the Engineering Platform team in the #eng-platform Slack channel.
