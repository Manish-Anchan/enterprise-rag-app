# NovaTech Solutions - On-Call & Incident Response Playbook
**Last Updated:** March 20, 2025
**Document Owner:** Site Reliability Engineering (SRE)

## 1. Introduction
System outages and degradations are inevitable in complex distributed systems. The purpose of this playbook is to outline the NovaTech Solutions standardized approach to managing production incidents. This process, governed by the Site Reliability Engineering (SRE) team, ensures that when things go wrong, we respond rapidly, communicate effectively, resolve the issue safely, and learn blamelessly from the event.

This playbook applies to all engineering teams participating in on-call rotations.

## 2. On-Call Rotations and Compensation
At NovaTech, we believe in "you build it, you run it." Every major engineering team maintains an on-call rotation to support their services in production.
- **Schedule:** Rotations last for **1 week**, transitioning on Wednesdays at 12:00 PM PST. This mid-week handoff ensures that engineers are fresh and fully supported by the wider team during regular hours.
- **Coverage:** Each rotation consists of a **Primary** on-call engineer and a **Secondary** on-call engineer. The primary is the first line of defense; if the primary does not acknowledge a PagerDuty alert within 5 minutes, it automatically escalates to the secondary.
- **Tooling:** All alerts and schedules are managed centrally in **PagerDuty**.
- **Compensation:** We recognize the personal disruption caused by being on-call. Engineers receive an on-call stipend of **$500 per week**. Additionally, if an engineer is paged for a legitimate incident outside of standard business hours (after 6 PM or on weekends), they receive an extra **$200 per incident** bonus.

## 3. Incident Severity Levels (SEV)
When an incident is declared, it must be assigned a Severity (SEV) level. This dictates the required response time and the level of executive escalation.

- **SEV1 (Critical):** A full systemic outage or massive customer impact (e.g., core database down, login completely broken, massive data breach). 
  - **Expected Response Time:** < 15 minutes, 24/7.
  - **Action:** All hands on deck. Immediate executive notification.
- **SEV2 (Major):** Severe degradation of a critical feature, but a workaround exists, or only a subset of users is affected. (e.g., payment processing is slow, search functionality is degraded).
  - **Expected Response Time:** < 30 minutes, 24/7.
- **SEV3 (Minor):** A minor issue affecting non-critical paths or internal tools. Limited customer impact.
  - **Expected Response Time:** < 2 hours, during business hours only. (Pages map to next business day if triggered at night).
- **SEV4 (Trivial/Cosmetic):** Minor cosmetic bugs or localized issues with zero impact on core functionality.
  - **Expected Response Time:** Addressed during the next sprint planning; no immediate paging required.

## 4. Incident Roles
During a SEV1 or SEV2 incident, explicit roles must be assumed to maintain order and clear communication.
- **Incident Commander (IC):** The IC is in charge of the incident. They do not debug or write code. Their job is to coordinate responders, ensure communication, make high-level decisions (e.g., "we need to failover to `us-east-1`"), and track state.
- **Responder (Subject Matter Expert):** The engineers actively looking at logs, metrics, and executing commands to mitigate the issue. There can be multiple responders.
- **Communications Lead:** For high-visibility incidents, this person handles internal executive updates and external public status page updates.

## 5. Communication Protocols
Effective communication is the lifeblood of incident resolution.
- **War Room:** The moment a SEV1 or SEV2 is declared, an automated Slack workflow creates a dedicated channel (e.g., `#inc-20250320-db-outage`). All technical discussion, dashboard links, and hypothesis testing must occur in this channel to maintain a shared context. An open Zoom/Google Meet bridge is also spun up automatically and linked in the channel.
- **Status Updates:** For a SEV1, the Communications Lead must post an update to the `#incident-war-room` and the company-wide `#announcements` channel every **30 minutes**, regardless of whether there is new information.
- **External Status Page:** Customer-facing updates on `status.novatech.com` must be updated promptly, ensuring transparency without revealing sensitive security details.

## 6. Escalation Policy
If an incident is escalating in severity or the on-call engineer is stuck, they are empowered and encouraged to escalate immediately. Never suffer in silence.
- **Escalation Path:** On-Call Engineer -> Team Lead -> Engineering Manager (EM) -> VP of Engineering (Priya Patel) -> CTO (Marcus Rodriguez).
- If you are ever in doubt about whether to escalate or declare a SEV1, bias toward action. We would rather over-respond to a SEV2 than under-respond to a SEV1.

## 7. Post-Mortem Process
Incident response does not end when the system recovers. We mandate a culture of continuous learning.
- **Requirement:** A formal, written post-mortem document is strictly required for every SEV1 and SEV2 incident.
- **Timeline:** The post-mortem draft must be completed and reviewed within **48 hours** of the incident's resolution.
- **Blameless Culture:** Post-mortems are exclusively focused on identifying systemic vulnerabilities, tooling gaps, and process failures. We **never** blame individuals. We operate on the assumption that every engineer acts with the best intentions given the information and tools they had at the time.
- **Action Items:** Every post-mortem must result in prioritized Jira tickets (Action Items) designed to prevent the incident from ever recurring. These tickets are automatically placed at the top of the relevant team's next sprint backlog.

By adhering strictly to this playbook, we ensure high availability for our customers and a sustainable, supportive on-call environment for our engineers.
