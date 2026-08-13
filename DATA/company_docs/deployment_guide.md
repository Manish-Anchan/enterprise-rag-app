# NovaTech Solutions — Deployment & Infrastructure Guide

**Last Updated:** April 15, 2025
**Document Owner:** Infrastructure Team

---

## 1. Overview

This guide describes NovaTech Solutions' infrastructure architecture, deployment processes, monitoring stack, and disaster recovery procedures. All engineers deploying services or managing infrastructure should be familiar with this document. For questions, reach out to the Infrastructure team via the #infra Slack channel.

## 2. Infrastructure Overview

NovaTech's production infrastructure runs entirely on **Amazon Web Services (AWS)** across two regions:

| Region | Purpose | Services |
|--------|---------|----------|
| **us-west-2 (Oregon)** | Primary region | All production workloads, primary databases |
| **us-east-1 (N. Virginia)** | Secondary / DR region | Hot standby, read replicas, CDN origin |

All infrastructure is managed as code using **Terraform**. Infrastructure changes follow the same PR process as application code (branch, PR, review, merge). The Terraform state is stored in S3 with DynamoDB locking.

## 3. Kubernetes Architecture

NovaTech runs **Amazon EKS (Elastic Kubernetes Service)** with three separate clusters:

| Cluster | Region | Purpose | Node Types |
|---------|--------|---------|-----------|
| **nova-dev** | us-west-2 | Development and integration testing | m6i.large (4 vCPU, 16GB) |
| **nova-staging** | us-west-2 | Pre-production, performance testing | m6i.xlarge (8 vCPU, 32GB) |
| **nova-prod** | us-west-2 + us-east-1 | Production traffic | m6i.2xlarge (16 vCPU, 64GB) |

### Node Groups
Each cluster has two managed node groups:
- **General workloads:** Standard compute instances for API servers, web services, and background workers.
- **Memory-intensive workloads:** r6i instances for services requiring large memory (caching layers, ML inference, search indexing).

### Autoscaling
- **Cluster Autoscaler** automatically adjusts the number of nodes based on pending pod requests.
- **Horizontal Pod Autoscaler (HPA)** scales pods based on CPU utilization (target: 70%) and custom metrics (request rate, queue depth).

## 4. Deployment Process

NovaTech uses **Helm charts** for Kubernetes packaging and **ArgoCD** for GitOps-based continuous deployment.

### Deployment Flow

```
Developer merges PR to main
    → GitHub Actions builds Docker image
    → Image pushed to ECR (Elastic Container Registry)
    → Helm chart values updated with new image tag
    → ArgoCD detects change and syncs to target cluster
    → Rolling update with health checks
```

### Helm Chart Structure
Every service has a Helm chart in the `deploy/` directory of its repository:
- `Chart.yaml` — Chart metadata and version.
- `values.yaml` — Default configuration values.
- `values-dev.yaml`, `values-staging.yaml`, `values-prod.yaml` — Environment-specific overrides.
- `templates/` — Kubernetes manifests (Deployment, Service, Ingress, HPA, PDB).

### ArgoCD
- ArgoCD runs in the nova-prod cluster and manages deployments across all three clusters.
- Applications are defined declaratively in the `argocd-apps` repository.
- ArgoCD dashboard: argocd.internal.novatech.io (accessible via VPN).
- Sync policy: Auto-sync for dev, manual sync for staging and production.

## 5. Monitoring and Observability

### Metrics — Datadog
- All services emit metrics to **Datadog** via the Datadog agent running as a DaemonSet on every node.
- Standard metrics: request rate, latency (p50, p95, p99), error rate, CPU/memory utilization.
- Custom dashboards per team are maintained in Datadog with Terraform.
- Datadog URL: app.datadoghq.com (SSO via Okta).

### Alerting — PagerDuty
- Alerts are routed from Datadog to **PagerDuty** based on severity.
- Critical alerts (error rate > 5%, latency p99 > 5s, pod crash loops) trigger immediate page to on-call.
- Warning alerts trigger Slack notification to team channel.
- Alert routing is defined in the `monitoring/` directory of each service repository.

### Dashboards — Grafana
- **Grafana** is used for infrastructure-level dashboards (Kubernetes cluster health, node utilization, network I/O).
- Grafana URL: grafana.internal.novatech.io (accessible via VPN).
- Data source: Prometheus (scraped from Kubernetes metrics server and node exporters).

### Logging
- Application logs are shipped to **Datadog Logs** via Fluentd.
- Log format: Structured JSON with fields for `timestamp`, `level`, `service`, `trace_id`, `message`.
- Log retention: 30 days in Datadog, 90 days in S3 (compressed).

## 6. Database and Storage

| Service | Technology | Purpose |
|---------|-----------|---------|
| **Primary Database** | PostgreSQL 15 on RDS | Transactional data, user data, application state |
| **Cache** | Redis 7 (ElastiCache) | Session storage, rate limiting, hot data caching |
| **Object Storage** | S3 | File uploads, backups, logs, static assets |
| **Search** | OpenSearch | Full-text search, log analytics |

### Database Standards
- All databases run in **Multi-AZ** configuration for high availability.
- Read replicas are provisioned for read-heavy workloads (reporting, analytics).
- Connection pooling via PgBouncer (max 200 connections per service).
- Schema migrations are managed with Alembic (Python) or golang-migrate (Go) and run as part of the deployment pipeline.

## 7. Secrets Management

- All secrets (API keys, database credentials, TLS certificates) are stored in **AWS Secrets Manager**.
- Secrets are rotated **quarterly**. Automated rotation is configured for database credentials.
- Applications access secrets via the **External Secrets Operator** which syncs AWS Secrets Manager values to Kubernetes Secrets.
- Never commit secrets to Git. Pre-commit hooks scan for accidental secret commits using `detect-secrets`.

## 8. Cost Management

- Monthly infrastructure budget reviews are conducted by the Infrastructure team and Finance.
- All AWS resources must be tagged with: `team`, `service`, `environment`, and `cost-center`.
- Untagged resources are flagged weekly and owners are notified via Slack.
- Auto-scaling policies are tuned quarterly to optimize cost-performance ratio.
- Dev and staging clusters scale down to minimum capacity outside business hours (7 PM - 7 AM PT) and on weekends.
- Monthly AWS spend target: $180,000 (as of Q1 2025).

## 9. Disaster Recovery

| Metric | Target |
|--------|--------|
| **Recovery Time Objective (RTO)** | 4 hours |
| **Recovery Point Objective (RPO)** | 1 hour |

### Backup Strategy
- **Database:** Automated daily snapshots with 30-day retention. Point-in-time recovery (PITR) enabled with 1-hour granularity.
- **Object Storage:** S3 versioning enabled with cross-region replication to us-east-1.
- **Kubernetes State:** Cluster state backed up daily using Velero to S3.

### Failover Procedure
- DNS failover to us-east-1 is managed by Route 53 health checks.
- In the event of a full us-west-2 outage, the Infrastructure team initiates regional failover following the DR runbook in Confluence.
- DR drills are conducted **quarterly** to validate failover procedures.

For questions or access requests, contact the Infrastructure team at infra@novatech.io or in #infra on Slack.
