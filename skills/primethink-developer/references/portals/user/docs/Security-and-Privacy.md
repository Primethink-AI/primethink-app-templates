# Security and Privacy

PrimeThink is designed around strict separation between groups, role-based control inside them, and explicit authentication at every access point. This page summarises the security model; linked pages carry the details.

## Account Security

- **Login** requires the account email and password; the login page is protected by reCAPTCHA.
- **Passwords must meet a policy** wherever one is set — registration, accepting an invitation, changing your password, and resetting a forgotten one. See [Password requirements](#password-requirements) below.
- **Repeated failed logins lock the account temporarily.** By default, five failed attempts within fifteen minutes lock sign-in for fifteen minutes.
- **Email verification** — accounts must verify their email address. Unverified users can log in during a grace period (default 3 days); after that, login is blocked until verification. See [Email Verification](Email-Verification.md).
- **Sessions** use short-lived signed tokens (JWT) carrying the user, group, and expiration.
- **Sessions are held per group.** Each group you are signed in to has its own session, renewed in the background before it expires. If one group's session can no longer be renewed, only that group asks you to sign in again — your other groups keep working, and you are signed out of the application entirely only when the last remaining session ends. In a browser, several open tabs share one set of session tokens, so renewing in one tab keeps the others signed in.

### Password requirements

The platform ships with these defaults, and a group can tighten them — where the two differ, the stricter rule applies:

| Rule | Default |
|------|---------|
| Minimum length | 12 characters |
| Maximum length | 72 characters |
| Required character classes | none required |
| Minimum strength score | 3 out of 4 |
| Common passwords | rejected |
| Passwords containing your own details | rejected |

Strength is estimated rather than counted: a long passphrase of ordinary words can score well, while a short password padded with symbols often does not. The score also drops for anything predictable, so keyboard patterns and dates do not help. Because your name and email address are checked too, a password built from them is refused even if it is long enough.

When a password is rejected, the response names each rule it failed rather than giving a single generic error.

Registration, password reset, and the change-password dialog check the password as you type: each active rule is listed with a tick once you satisfy it, alongside a strength meter. The check is advisory — if it is briefly unavailable the rows go neutral and a note says the password will be checked when you submit, and submitting is never blocked, because the same rules are applied to the request itself.

## Encryption

All data is encrypted **in transit** (TLS) and **at rest**.

## Group Isolation

Each group is a self-contained tenant: members and roles, chats, documents, collections, settings, and configured AI assistants all live inside the group, and one group's data is never visible from another. Chat databases are additionally scoped per group at the storage level. See [Group Management](/admin/Group-Management/).

## Access Control

- **Role-based permissions** — Group Admins assign roles; each role carries permissions that gate features such as LLM invocation and direct tool calls. See [Roles and Permissions](/admin/Roles-and-Permissions/).
- **Chat membership** — chat content and chat-root files require both authentication and membership in the chat.
- **Document tiers** — file access follows the storage hierarchy: `@public` (no auth, deliberately public), `@liveapp` (authentication + group membership), and chat root (authentication + chat membership). Never store sensitive data in `@public`. See [File Storage Hierarchy](File-Storage-Hierarchy.md).

## API and Integration Security

- **API keys** authenticate REST API access via `Authorization: Token YOUR_API_KEY`; keys are generated per-user under `Settings > API Keys` and can be regenerated. See [API Auth](/developer/API-Auth/).
- **Live Apps** authenticate to the platform with per-chat scoped tokens and CSRF tokens — never with user credentials.
- **Secrets in integrations** are never hard-coded: API keys for external services are stored as settings and referenced with `${SETTING_NAME}` placeholders, resolved server-side at runtime. See [Capabilities](/admin/Capabilities/).
- **Query safety** — chat-DB filtering uses parameterized queries to prevent SQL injection, with server-side validation of filter fields and values, and rate limiting on complex queries. See [Filtering and Querying](/admin/Filtering-and-Querying/).

## AI Providers and Your Data

Messages and documents that an AI assistant processes are sent to the configured model provider (for example OpenAI or Anthropic) to generate responses. Hosted MCP capabilities execute at the model provider as well. Choose models and capabilities with this data flow in mind — group admins control which agents (and therefore which models) are configured, and role permissions govern whether users can invoke LLMs and call tools directly.
