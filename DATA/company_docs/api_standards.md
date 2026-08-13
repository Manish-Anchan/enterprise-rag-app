# NovaTech Solutions — API Design Standards

**Last Updated:** April 20, 2025
**Document Owner:** API Platform Team

---

## 1. Introduction

This document defines the API design standards that all engineering teams at NovaTech Solutions must follow when building, maintaining, or modifying APIs. Consistent API design reduces cognitive load for consumers, simplifies integration, and improves overall system reliability. These standards apply to all new APIs and should be incrementally adopted for existing APIs during major updates.

## 2. Architectural Style: REST

All synchronous APIs at NovaTech Solutions must follow Representational State Transfer (REST) principles.

### Resource URLs
- URLs should be organized around resources and be predictable and hierarchical.
- Use **plural nouns** for resources (e.g., `/users`, not `/user`; `/deployments`, not `/deployment`).
- Avoid verbs in URLs (e.g., use `GET /users` not `/getUsers`).
- Nest resources to express relationships: `GET /v1/teams/42/members` (members of team 42).
- Maximum URL nesting depth: 3 levels. Beyond that, use query parameters or separate endpoints.

### HTTP Verbs
Use the appropriate HTTP verb for the action:
- **GET** — Read a resource or collection. Must be safe and idempotent.
- **POST** — Create a new resource. Not idempotent.
- **PUT** — Replace an entire resource. Idempotent.
- **PATCH** — Partially update a resource.
- **DELETE** — Remove a resource. Idempotent.

## 3. API Versioning

API versioning is mandatory for all external and service-to-service APIs.

- **Strategy:** URL-based versioning. Include the version in the path: `/v1/users`, `/v2/users`.
- **Current version:** Most APIs are on `/v1/`. Only increment the major version for breaking changes.
- **Deprecation policy:** When a version is deprecated, consumers receive a **6-month notice** via email, developer portal announcements, and a `Sunset` HTTP header on responses. After 6 months, the deprecated version is decommissioned.
- **Deprecation header:** All responses from deprecated versions must include: `Sunset: Sat, 01 Nov 2025 00:00:00 GMT` and `Deprecation: true`.

## 4. Authentication and Authorization

### User-Facing APIs
- Use **OAuth 2.0** with **JSON Web Tokens (JWT)** for authentication.
- Tokens are issued by our identity provider (Okta SSO).
- APIs must validate JWT signature, audience (`aud`), issuer (`iss`), and expiration (`exp`).
- Authorization is role-based. Scopes are embedded in the JWT payload.

### Service-to-Service Communication
- Use **API Keys** passed in the `X-API-Key` header.
- API keys are provisioned via the API Gateway and stored in AWS Secrets Manager.
- Never pass API keys in query parameters or request bodies.
- For highly sensitive inter-service communication, use **Mutual TLS (mTLS)**.

## 5. Rate Limiting

All APIs must enforce rate limiting to protect infrastructure and ensure fair usage.

| Tier | Rate Limit | Use Case |
|------|-----------|----------|
| **Standard** | 1,000 requests/minute | Default for all API consumers |
| **Premium** | 5,000 requests/minute | Enterprise customers with SLA |
| **Internal** | 10,000 requests/minute | Service-to-service (internal) |

### Rate Limit Headers
Include the following headers in all responses:
- `X-RateLimit-Limit` — Total requests allowed in the window.
- `X-RateLimit-Remaining` — Requests remaining in the current window.
- `X-RateLimit-Reset` — UTC epoch timestamp when the window resets.

When rate limit is exceeded, return **HTTP 429 Too Many Requests** with a `Retry-After` header.

## 6. Error Handling

### Standard Error Envelope
All error responses must follow this consistent JSON structure:

```json
{
  "error": {
    "code": "NOVA-4001",
    "message": "The provided email address is already in use.",
    "details": [
      {
        "field": "email",
        "issue": "must be unique"
      }
    ],
    "request_id": "req_a1b2c3d4e5f6"
  }
}
```

- `code` — Machine-readable error code. Format: `NOVA-XXXX` where the first digit maps to HTTP status (4xxx = client error, 5xxx = server error).
- `message` — Human-readable description of the error.
- `details` — Optional array of field-level validation errors.
- `request_id` — Unique identifier for tracing the request in Datadog.

### Standard HTTP Status Codes
- **200 OK** — Success.
- **201 Created** — Resource created. Include `Location` header with the new resource URL.
- **204 No Content** — Success with no body (e.g., DELETE).
- **400 Bad Request** — Malformed request or validation failure.
- **401 Unauthorized** — Missing or invalid authentication.
- **403 Forbidden** — Authenticated but lacking permissions.
- **404 Not Found** — Resource does not exist.
- **409 Conflict** — Resource conflict (e.g., duplicate creation).
- **422 Unprocessable Entity** — Valid syntax but semantic error.
- **429 Too Many Requests** — Rate limit exceeded.
- **500 Internal Server Error** — Unexpected server error.
- **503 Service Unavailable** — Service is temporarily down.

## 7. Pagination

### Cursor-Based Pagination (Preferred)
For large or frequently changing datasets, use cursor-based pagination:

```
GET /v1/events?limit=50&after=eyJpZCI6MTIzNH0=
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTI4NH0=",
    "has_more": true
  }
}
```

### Offset-Based Pagination
For small, stable datasets, offset-based pagination is acceptable:

```
GET /v1/departments?limit=20&offset=40
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "total": 85,
    "limit": 20,
    "offset": 40
  }
}
```

Default page size: 20. Maximum page size: 100.

## 8. Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| JSON request/response keys | camelCase | `firstName`, `createdAt` |
| URL query parameters | snake_case | `sort_by`, `created_after` |
| URL path segments | kebab-case | `/user-preferences` |
| HTTP headers (custom) | Title-Case with `X-` prefix | `X-Request-Id` |

## 9. API Documentation

- All APIs must be documented using the **OpenAPI 3.0** specification.
- FastAPI services auto-generate OpenAPI specs. For Go services, use `swag` to generate specs from annotations.
- The OpenAPI spec file must live in the repository alongside the service code.
- Documentation is automatically published to the internal developer portal during deployment.
- Every endpoint must include: description, parameter documentation, request/response examples, and all possible response codes.

## 10. Questions

For API design reviews, standards questions, or exceptions, contact the API Platform team in #api-guild on Slack.
