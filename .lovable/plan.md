

# Making HubKonnect Robust for 1000+ Users

After reviewing every page and hook in the codebase, here are the remaining issues that would cause breakdowns at scale, and the plan to fix them.

---

## Issues Found

### 1. No Error Boundary (App crashes = white screen)
If any component throws a render error, the entire app white-screens with no way to recover. There is no ErrorBoundary anywhere in the codebase.

### 2. ForYou page loads ALL profiles into memory
`useAllProfiles` fetches every single profile + 4 bulk junction table queries, then `computeMatch()` runs array intersections for every profile on every render. At 1000 users this means downloading and processing the entire member directory on each page visit.

### 3. No React Query staleTime configured
Every navigation between pages triggers a full refetch of profiles, connections, and profile details. Default `staleTime` is 0, so data is always considered stale.

### 4. ProfileCard uses local `useState` for connection status
The "Connect" button resets to "Connect" on every page load because `sent` is local state. Users see stale UI and can accidentally send duplicate requests (caught by DB constraint, but bad UX).

### 5. Forgot Password button does nothing
The "Forgot password?" link on the login page is a `button` with no `onClick` handler.

### 6. No lazy loading on images
All avatar images load eagerly. With hundreds of profiles on ForYou, this means downloading all avatars at once.

### 7. No indexes on junction tables
The 4 junction tables (`profile_skills`, `profile_interests`, `profile_member_types`, `profile_looking_for`) are queried by `profile_id` but may lack indexes, slowing down the bulk `.in()` queries.

### 8. Connections table missing foreign keys
The `connections` table has no foreign keys to `profiles`, which means orphaned rows if a profile is deleted and no referential integrity.

---

## Implementation Plan

### Phase 1: Error Boundary + Crash Recovery
- Create `src/components/ErrorBoundary.tsx` -- a React class component that catches render errors and shows a friendly "Something went wrong" message with a Reload button
- Wrap all routes in `App.tsx` with this ErrorBoundary

### Phase 2: Performance -- Query Optimization
- Add `staleTime: 5 * 60 * 1000` (5 minutes) to profile queries in `use-profiles.ts`
- Add `staleTime: 60 * 1000` (1 minute) to connection queries in `use-connections.ts`
- Add `loading="lazy"` to all avatar `<img>` elements across ProfileCard, Profile, Connections, MyProfile, and Navbar

### Phase 3: Connection-Aware ProfileCard
- Fetch the user's existing connections once on ForYou page
- Pass connection status to each ProfileCard so it shows "Sent" / "Pending" / "Connected" from actual DB state instead of local useState
- Remove the local `sent` state hack

### Phase 4: Forgot Password Flow
- Add a forgot password modal/inline form to `Login.tsx`
- On submit, call `supabase.auth.resetPasswordForEmail(email)`
- Show confirmation toast

### Phase 5: Database -- Indexes + Foreign Keys
Database migration to add:
- Indexes on `profile_skills(profile_id)`, `profile_interests(profile_id)`, `profile_member_types(profile_id)`, `profile_looking_for(profile_id)`
- Foreign keys from `connections.requester_id` and `connections.receiver_id` to `profiles.id`
- Unique constraint on connections to prevent reverse duplicates at the DB level (using `LEAST/GREATEST` pattern)

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/ErrorBoundary.tsx` | New -- crash recovery component |
| `src/App.tsx` | Wrap routes in ErrorBoundary |
| `src/hooks/use-profiles.ts` | Add staleTime to all queries |
| `src/hooks/use-connections.ts` | Add staleTime, export connection list for ForYou |
| `src/components/ProfileCard.tsx` | Accept connectionStatus prop, remove local useState |
| `src/pages/ForYou.tsx` | Fetch user's connections, pass status to cards, lazy images |
| `src/pages/Profile.tsx` | Add lazy loading to avatar image |
| `src/pages/Connections.tsx` | Add lazy loading to avatar images |
| `src/pages/Login.tsx` | Wire forgot password to auth reset flow |
| `src/components/Navbar.tsx` | Add lazy loading to avatar image |
| Database migration | Indexes on junction tables, foreign keys on connections |

