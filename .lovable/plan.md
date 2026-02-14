

# Database Schema, Auth & Protected Routes

## Overview
Set up the complete backend: database tables with RLS, auth session management, protected routes, and wire onboarding to persist data. All screens currently use mock data -- this plan creates the real data layer.

## Phase 1: Database Schema (Migration)

### Tables to create:

**profiles** -- one row per user, auto-created on signup
- `id` (uuid, PK, references auth.users ON DELETE CASCADE)
- `full_name` (text, not null)
- `bio` (text, default '')
- `instagram` (text, default '')
- `linkedin` (text, default '')
- `avatar_url` (text, default '')
- `privacy` (text, default 'public') -- public | members | private
- `onboarding_completed` (boolean, default false)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**profile_member_types** -- junction table
- `id` (uuid, PK, default gen_random_uuid())
- `profile_id` (uuid, references profiles ON DELETE CASCADE)
- `member_type` (text, not null) -- co_living, co_working, event_attendee, follower
- unique(profile_id, member_type)

**profile_skills** -- junction table
- `id` (uuid, PK, default gen_random_uuid())
- `profile_id` (uuid, references profiles ON DELETE CASCADE)
- `skill` (text, not null)
- unique(profile_id, skill)

**profile_interests** -- junction table
- `id` (uuid, PK, default gen_random_uuid())
- `profile_id` (uuid, references profiles ON DELETE CASCADE)
- `interest` (text, not null)
- unique(profile_id, interest)

**profile_looking_for** -- junction table
- `id` (uuid, PK, default gen_random_uuid())
- `profile_id` (uuid, references profiles ON DELETE CASCADE)
- `looking_for` (text, not null) -- collaborators, mentors, etc.
- unique(profile_id, looking_for)

**connections** -- connection requests between users
- `id` (uuid, PK, default gen_random_uuid())
- `requester_id` (uuid, references profiles ON DELETE CASCADE, not null)
- `receiver_id` (uuid, references profiles ON DELETE CASCADE, not null)
- `status` (text, default 'pending') -- pending, accepted, declined
- `message` (text, default '')
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())
- unique(requester_id, receiver_id)

### Storage bucket
- `avatars` -- public bucket for profile photos

### Trigger
- Auto-create profile row when a new user signs up (pulls `full_name` from `raw_user_meta_data`)
- Auto-update `updated_at` on profiles changes

### RLS Policies (all tables)
- **profiles**: Anyone authenticated can SELECT (respecting privacy later in app logic). Users can UPDATE/INSERT only their own row.
- **junction tables** (skills, interests, member_types, looking_for): Authenticated users can SELECT all. INSERT/DELETE only own rows (where profile_id = auth.uid()).
- **connections**: Authenticated users can SELECT where they are requester or receiver. INSERT only where requester_id = auth.uid(). UPDATE only where receiver_id = auth.uid() (to accept/decline). DELETE only own sent requests.

## Phase 2: Auth Context & Session Management

Create `src/contexts/AuthContext.tsx`:
- Wraps app with auth state via `onAuthStateChange` + `getSession`
- Exposes `user`, `session`, `profile`, `loading`, `signOut`
- Fetches the profile row after auth state resolves
- Provides `refreshProfile()` for post-onboarding updates

## Phase 3: Protected Routes

Create `src/components/ProtectedRoute.tsx`:
- Redirects to `/login` if not authenticated
- Redirects to `/onboarding` if authenticated but `onboarding_completed = false`
- Shows loading skeleton while auth resolves

Update `App.tsx`:
- Wrap `/for-you`, `/connections`, `/profile`, `/profile/:id`, `/onboarding`, `/matches` with ProtectedRoute
- Onboarding route skips the "must complete onboarding" check

## Phase 4: Wire Up Onboarding

Update `Onboarding.tsx`:
- On final step completion, save all data to database:
  - Upload photo to `avatars` bucket, save URL to profile
  - Update profile row (full_name, bio, instagram, linkedin)
  - Insert rows into junction tables (skills, interests, member_types, looking_for)
  - Set `onboarding_completed = true`

## Phase 5: Wire Up Existing Pages

- **Login/Signup**: Already wired to Supabase auth -- just update redirects (login goes to `/for-you`, signup success message stays)
- **Navbar**: Add sign-out button, show user avatar
- **ForYou**: Fetch real profiles from DB instead of mock data
- **Connections**: Fetch real connections/requests from DB
- **MyProfile**: Load/save from DB instead of local state
- **Profile/:id**: Fetch profile by ID from DB

## Technical Notes

- The `profiles.id` column directly uses `auth.users.id` (no separate foreign key column needed -- the PK itself is the FK)
- Junction tables use `profile_id` referencing `profiles.id`
- All junction table operations use upsert/delete patterns (clear and re-insert on save)
- No admin roles needed at this stage

