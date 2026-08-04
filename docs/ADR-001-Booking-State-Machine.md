# ADR-001: Booking State Machine

- **Status:** Accepted
- **Date:** 2026-08-04

---

## Context

HailDepot connects customers with skilled tradespeople.

Originally, the booking lifecycle allowed a tradesperson to mark a booking as `completed` immediately after finishing work.

This meant the customer had no opportunity to confirm that the work had actually been completed before the booking was finalized.

As the platform evolves toward production quality, the booking lifecycle needs to support customer confirmation, future payment workflows, dispute resolution, and trustworthy reviews.

---

## Decision

The booking lifecycle will follow this state machine:

```text
pending
    ↓
accepted
    ↓
awaiting_confirmation
    ↓
completed
```

Definitions:

- **pending** — Waiting for the tradesperson to respond.
- **accepted** — Tradesperson accepted the booking.
- **awaiting_confirmation** — Tradesperson has marked the work as finished and is waiting for customer confirmation.
- **completed** — Customer confirmed that the work was completed successfully.
- **declined** — Tradesperson declined the booking.
- **cancelled** — Booking was cancelled before completion.

---

## Rationale

This workflow:

- Prevents premature completion of jobs.
- Gives customers control over final confirmation.
- Supports future payment release after confirmation.
- Provides a foundation for dispute resolution.
- Ensures reviews are submitted only after confirmed completion.

---

## Consequences

### Positive

- Clearer booking lifecycle.
- Better customer trust.
- Easier integration of ratings and payments.
- Scalable for future features.

### Trade-offs

- Introduces one additional booking state.
- Requires customer interaction before final completion.

---

## Future Considerations

Potential future booking states include:

- in_progress
- payment_pending
- disputed
- refunded

These should only be introduced when the associated functionality is implemented.

---

## Decision Owner

HailDepot Engineerings