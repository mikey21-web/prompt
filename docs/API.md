# PromptForge API

REST API for prompt optimization. All endpoints require Clerk authentication via JWT token.

## Base URL

- **Production**: `https://promptforge.app/api`
- **Development**: `http://localhost:3000/api`

## Authentication

Include JWT token in `Authorization` header:
```
Authorization: Bearer <clerk_jwt>
```

Tokens are available:
- **Web**: Automatically via Clerk SDK
- **Extension**: Fetch from Convex auth context
- **Desktop**: Store and refresh in local state

## Endpoints

### POST /api/optimize

Optimize a prompt using specified mode.

**Request**
```json
{
  "prompt": "string (required)",
  "mode": "compress" | "enhance" | "rewrite" (required)",
  "model": "gpt-4o-mini" | "gpt-4o" (optional, default: gpt-4o-mini)
}
```

**Response (200)**
```json
{
  "optimized": "string",
  "tokens": {
    "input": number,
    "output": number
  },
  "cached": boolean
}
```

**Errors**
- `400` — Invalid request (missing required fields)
- `401` — Unauthorized (no valid JWT)
- `429` — Rate limit exceeded (10 requests/min per user)
- `500` — OpenAI API error

**Example**
```bash
curl -X POST https://promptforge.app/api/optimize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "write a poem about trees",
    "mode": "enhance",
    "model": "gpt-4o"
  }'
```

---

### GET /api/usage

Get current token usage and subscription limits.

**Response (200)**
```json
{
  "used": number (tokens used this period),
  "limit": number (monthly limit),
  "period_start": "ISO8601",
  "period_end": "ISO8601",
  "plan": "free" | "pro" | "team"
}
```

**Example**
```bash
curl https://promptforge.app/api/usage \
  -H "Authorization: Bearer $TOKEN"
```

---

### GET /api/history

Get optimization history (paginated).

**Query Parameters**
- `limit` — Results per page (default: 50, max: 100)
- `offset` — Pagination offset (default: 0)
- `mode` — Filter by mode: "compress", "enhance", "rewrite" (optional)

**Response (200)**
```json
[
  {
    "id": "string",
    "prompt": "string",
    "optimized": "string",
    "mode": "compress" | "enhance" | "rewrite",
    "model": "gpt-4o-mini" | "gpt-4o",
    "timestamp": "ISO8601",
    "tokens": {
      "input": number,
      "output": number
    }
  }
]
```

**Example**
```bash
curl 'https://promptforge.app/api/history?limit=10&mode=enhance' \
  -H "Authorization: Bearer $TOKEN"
```

---

### POST /api/templates

Create a saved prompt template.

**Request**
```json
{
  "name": "string (required, max 100 chars)",
  "prompt": "string (required)",
  "description": "string (optional)"
}
```

**Response (201)**
```json
{
  "id": "string",
  "name": "string",
  "prompt": "string",
  "description": "string",
  "created_at": "ISO8601",
  "owner_id": "string"
}
```

**Example**
```bash
curl -X POST https://promptforge.app/api/templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Blog Post Writer",
    "prompt": "You are a professional blog writer...",
    "description": "Template for generating blog posts"
  }'
```

---

### GET /api/templates

Get all saved templates for user.

**Response (200)**
```json
[
  {
    "id": "string",
    "name": "string",
    "prompt": "string",
    "description": "string",
    "created_at": "ISO8601"
  }
]
```

---

### DELETE /api/templates/:id

Delete a template.

**Response (204)** — No content

---

### POST /api/checkout

Initiate Stripe checkout session.

**Request**
```json
{
  "plan": "pro" | "team" (required),
  "billing_cycle": "monthly" | "annual" (required)
}
```

**Response (200)**
```json
{
  "session_id": "string",
  "url": "string (Stripe checkout URL)"
}
```

**Example**
```bash
curl -X POST https://promptforge.app/api/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "pro",
    "billing_cycle": "annual"
  }'
```

---

## Rate Limiting

- **Free plan**: 10 requests/minute
- **Pro plan**: 100 requests/minute
- **Team plan**: 1000 requests/minute + burst allowance

Rate limit info in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1234567890
```

---

## Errors

All errors follow standard format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message"
}
```

### Common Codes
- `AUTH_REQUIRED` — Missing or invalid JWT
- `RATE_LIMIT` — Too many requests
- `INVALID_REQUEST` — Malformed request
- `QUOTA_EXCEEDED` — User subscription limit reached
- `OPENAI_ERROR` — OpenAI API error
- `SERVER_ERROR` — Internal server error

---

## SDKs

### JavaScript/TypeScript

```typescript
import { PromptForgeClient } from "@promptforge/client";

const client = new PromptForgeClient({ token: jwt });

// Optimize
const result = await client.optimize({
  prompt: "write a poem",
  mode: "enhance",
  model: "gpt-4o"
});
console.log(result.optimized);

// Get usage
const usage = await client.getUsage();
console.log(`${usage.used}/${usage.limit} tokens used`);

// History
const history = await client.getHistory({ limit: 20 });
```

### Python

```python
from promptforge import Client

client = Client(token=jwt)

result = client.optimize(
    prompt="write a poem",
    mode="enhance",
    model="gpt-4o"
)
print(result['optimized'])
```

---

## Webhooks

Subscribe to events via dashboard:

- `optimization.created` — New prompt optimized
- `subscription.updated` — Plan change
- `subscription.cancelled` — Subscription ended
- `payment.failed` — Payment error

Webhook signature in `X-Signature` header (HMAC-SHA256).

---

## Changelog

### v1.0.0 (2026-05-20)
- Initial API release
- Optimize, history, templates, checkout endpoints
- Clerk authentication
