# ADR-002: User Roles and Authentication

- **Status:** Accepted
- **Date:** 2026-08-04

---

# Context

HailDepot is a two-sided marketplace that connects customers with skilled tradespeople.

As the platform grows, users may participate in multiple ways. For example:

- A homeowner may later become a tradesperson.
- A plumber may also hire electricians.
- A contractor may both provide and purchase services.

Using separate accounts for each role would create unnecessary friction and duplicate user data.

---

# Decision

HailDepot will use a **single authentication system**.

Each user has one account.

Each account can have one or more roles.

Authentication is independent of user roles.

After authentication, the application determines which dashboard or experience to present based on the user's assigned role(s).

---

# Initial Roles

- Customer
- Tradesperson
- Administrator

Future roles may include:

- Company
- Supplier
- Inspector
- Trainer

---

# Authentication Flow

```text
Sign In
     │
     ▼
Authenticate User
     │
     ▼
Load User Profile
     │
     ▼
Determine Assigned Roles
     │
     ▼
Route User
```

Examples:

Customer only

```
Login
   ↓
Customer Dashboard
```

Tradesperson only

```
Login
   ↓
Tradesperson Dashboard
```

Multiple roles

```
Login
   ↓
Choose Dashboard
   ↓
Customer
Tradesperson
Admin
```

---

# Rationale

A single authentication system:

- Reduces duplicate accounts.
- Simplifies account management.
- Improves user experience.
- Supports future expansion.
- Aligns with modern marketplace platforms.

---

# Consequences

## Positive

- One identity per user.
- Easier profile management.
- Flexible role expansion.
- Simpler authentication architecture.

## Trade-offs

- Requires role-based authorization.
- Requires dashboard routing after login.

---

# Future Considerations

Potential future capabilities include:

- Switching dashboards without logging out.
- Supporting multiple businesses under one account.
- Organization accounts.
- Team members and permissions.
- Fine-grained role permissions.

---

# Decision Owner

HailDepot Engineering