
# Security Hardening for HubKonnect — COMPLETED

## ✅ Implemented

### Phase 1: Database Migration
- **Helper functions**: `get_profile_visibility()`, `is_connected()`, `check_connection_rate_limit()`, `prevent_duplicate_connection()` — all SECURITY DEFINER with search_path set
- **Privacy-aware RLS**: Replaced `USING (true)` SELECT policies on all 5 tables (profiles, skills, interests, member_types, looking_for) with visibility checks respecting the `privacy` column
- **Connection UPDATE tightened**: WITH CHECK constrains status to 'accepted'/'declined' only
- **Rate limiting**: Trigger enforces 10 requests/day per user
- **Reverse-duplicate prevention**: Trigger prevents both (A,B) and (B,A) connection rows
- **Performance indexes**: Added composite indexes on connections and junction tables

### Phase 2: Frontend Changes
- **ProfileCard**: Instagram handle no longer passed from ForYou page; rate limit error toast added
- **Profile page**: Social links (Instagram/LinkedIn) gated behind connection status; connection-aware buttons (Connect/Pending/Connected)
- **useConnectionStatus hook**: New hook to check connection state between two users

### Phase 3: Auth
- Anonymous signups disabled
- Auto-confirm email kept enabled (MVP)

## ⚠️ Remaining (requires dashboard access)
- **Leaked password protection**: Must be enabled in Auth settings > Password Security. Not configurable via migration tools.


