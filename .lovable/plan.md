

# Security Hardening for HubKonnect

Based on the security guide you shared and a full scan of the app, here are the issues found and the fixes planned.

## Issues Found

### 1. Profile Data Exposed to All Authenticated Users (Critical)
All 5 profile-related tables use `USING (true)` SELECT policies. Any authenticated user sees everyone's full data -- including Instagram handles, LinkedIn URLs, bios, skills, and interests -- regardless of the `privacy` column that already exists on profiles but is never enforced.

### 2. Connection UPDATE Policy Too Permissive (Medium)
The receiver can update ANY column on a connection row (status, message, requester_id, etc.), not just the status. An attacker could modify fields they shouldn't touch.

### 3. No Rate Limiting on Connection Requests (Medium)
Users can send unlimited connection requests. The planned 10/day limit is not enforced at the database level.

### 4. Leaked Password Protection Disabled (Low)
Users can sign up with passwords known to be in data breaches.

### 5. Social Links Visible Without Connection (Medium)
Instagram and LinkedIn are shown on ProfileCard and Profile page even when users aren't connected -- the frontend doesn't gate them.

### 6. No Reverse-Direction Duplicate Prevention (Low)
The unique constraint is on `(requester_id, receiver_id)` but User A can request User B AND User B can request User A, creating duplicate connection pairs.

---

## Implementation Plan

### Phase 1: Database Migration -- Privacy-Aware RLS + Rate Limiting

**A. Create a helper function** to check profile visibility (avoids recursion):

```text
get_profile_visibility(target_id) -> returns the privacy value
is_connected(user_a, user_b) -> checks for accepted connection
check_connection_rate_limit() -> counts today's sent requests
normalize_connection_pair(a, b) -> returns ordered pair for unique constraint
```

**B. Replace SELECT policies** on all 5 profile tables:
- `profiles`: Owner always sees own. Public profiles visible to all authenticated. "Members" and "private" profiles visible only if connected or self.
- `profile_skills`, `profile_interests`, `profile_member_types`, `profile_looking_for`: Same logic -- only show data for profiles the viewer is allowed to see.

**C. Tighten connection UPDATE policy**:
- Add `WITH CHECK` that locks `requester_id`, `receiver_id` to their original values and only allows `status` to be set to 'accepted' or 'declined'.

**D. Add rate limiting trigger**:
- Before INSERT on connections, check if the requester has sent >= 10 requests today. Raise exception if over limit.

**E. Add reverse-direction unique constraint**:
- Use a trigger or generated columns to prevent both (A,B) and (B,A) from existing.

### Phase 2: Frontend -- Social Link Gating + Rate Limit Feedback

**A. ProfileCard component**: Remove Instagram handle display (currently shown as `@handle`). Only show initials/name.

**B. Profile page**: Only show Instagram/LinkedIn links section if:
- The viewer is the profile owner, OR
- There is an accepted connection between them

**C. ForYou page**: Stop passing Instagram handle to ProfileCard.

**D. Rate limit error handling**: When connection insert fails due to rate limit, show a friendly toast: "You've reached your daily limit (10/day)."

### Phase 3: Enable Leaked Password Protection

Use the auth configuration tool to enable leaked password protection so users can't sign up with compromised passwords.

---

## Files Changed

| Area | Change |
|------|--------|
| Database migration | New helper functions, replaced SELECT policies on 5 tables, tightened connection UPDATE, rate limit trigger, reverse-duplicate prevention |
| `src/components/ProfileCard.tsx` | Remove handle display, only show name/initials |
| `src/pages/Profile.tsx` | Gate social links section behind connection status check |
| `src/pages/ForYou.tsx` | Stop passing Instagram to ProfileCard |
| `src/hooks/use-connections.ts` | Add `useConnectionStatus` hook, handle rate limit errors |
| Auth config | Enable leaked password protection |

