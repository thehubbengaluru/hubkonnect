

# Plan: Add 3 Pre-Launch Features

## Feature 1: "Who's Active Now" Sidebar (Real-time presence)

**What changes:**
- **Database migration**: Add `last_seen_at` (timestamptz, default `now()`) column to `profiles` table. Update the RLS policy so users can update their own `last_seen_at`.
- **AuthContext / PageShell**: On every authenticated page load, upsert `last_seen_at = now()` for the current user via a lightweight hook (`usePresenceHeartbeat`). This fires once on mount and then every 5 minutes via `setInterval`.
- **New hook `useActiveNow`**: Query profiles where `last_seen_at > now() - interval '15 minutes'`, exclude current user, join with match data. Returns top 5 sorted by match score.
- **ForYou sidebar update**: Replace the current static "Active Now" section with real data from `useActiveNow`. Each entry shows avatar/initials, name, match %, time ago, and a "View Profile" link. Green dot only shows for users active in last 5 minutes; amber dot for 5-15 minutes.

## Feature 2: Honest Beta Landing Page

**What changes to `Index.tsx`:**
- **Hero**: Add "Early Access Beta" badge above the main heading. Keep the existing headline and subtext.
- **Stats section**: Replace hardcoded "500+" / "120+" / "85%" with a live query counting actual profiles, connections, and average match rate from the database. Show a progress bar toward the "100 members" goal. Use a new hook `useBetaStats` that runs 3 simple count queries.
- **Testimonials section**: Replace with "What Early Testers Are Saying" header. Keep the 3 testimonial cards but add a subtle "Beta testers" label. This is an honest framing -- when you have real quotes, swap them in.
- **New "What Unlocks at 100 Members" section**: A simple card grid showing locked features (Coffee Roulette, Skill Swaps, Project Boards, Accountability Pods) with lock icons and brief descriptions. Creates FOMO.
- **CTA buttons**: Change "Get Started" to "Join the Beta -- It's Free" with a "Limited early access" sublabel.

## Feature 3: Basic Analytics Admin Dashboard

**What changes:**
- **New page `src/pages/Admin.tsx`**: A protected route at `/admin` that checks if the user's email is in a hardcoded admin list (you can update this later).
- **New route** in `App.tsx`: Add `/admin` wrapped in `ProtectedRoute`.
- **Dashboard content** (all read-only queries via the existing database client):
  1. **Activation funnel**: Total signups (profiles count), onboarding completed count, users with 1+ connections, users with 1+ messages sent.
  2. **Engagement**: Daily active users (last_seen_at within 24h), weekly active (7 days), avg connections per user, avg messages per user.
  3. **Connection funnel**: Total requests sent, accepted rate, users with 0 connections (red flag list), users with 5+ connections (power users).
  4. **Retention**: Users active today vs 7 days ago vs 30 days ago (using `last_seen_at`).
  5. **Top members**: Most connected, most messages sent.
- **UI**: Uses the existing brutalist design system. Simple stat cards in a grid with recharts sparklines for trends. No external analytics SDK needed -- everything queries the existing tables.
- **No nav link**: Admin page is accessed by direct URL only, not shown in the navbar.

---

## Technical Details

### Database Migration (single migration)

```sql
-- Add last_seen_at to profiles for presence tracking
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now();

-- Index for active-now queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at 
  ON public.profiles (last_seen_at DESC);
```

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/use-presence.ts` | `usePresenceHeartbeat()` - updates `last_seen_at` on mount + interval |
| `src/hooks/use-active-now.ts` | `useActiveNow()` - fetches recently active profiles with match scores |
| `src/hooks/use-beta-stats.ts` | `useBetaStats()` - counts members, connections, avg match for landing page |
| `src/hooks/use-admin-stats.ts` | `useAdminStats()` - all analytics queries for admin dashboard |
| `src/pages/Admin.tsx` | Admin analytics dashboard |

### Modified Files
| File | Change |
|------|--------|
| `src/pages/ForYou.tsx` | Replace static activeUsers with `useActiveNow` hook; add heartbeat |
| `src/pages/Index.tsx` | Beta badge, live stats, unlock roadmap section, updated CTAs |
| `src/App.tsx` | Add `/admin` route |
| `src/components/PageShell.tsx` | Add `usePresenceHeartbeat()` call so every page updates presence |

### Estimated Scope
- 1 database migration
- 5 new files
- 4 modified files

